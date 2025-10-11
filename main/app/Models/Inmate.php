<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inmate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'birthdate',
        'gender',
        'civil_status',
        'address_line1',
        'address_line2',
        'city',
        'province',
        'postal_code',
        'country',
        'crime',
        'sentence',
        'date_of_admission',
        'status',
        'cell_id',
        'admitted_by_user_id',
        'job',
        'medical_status',
        'last_medical_check',
        'medical_notes',
        'initial_points',
        'current_points',
        'original_sentence_days',
        'reduced_sentence_days',
        'expected_release_date',
        'adjusted_release_date',
    ];

    protected $casts = [
        'birthdate' => 'date',
        'date_of_admission' => 'date',
        'last_medical_check' => 'date',
        'initial_points' => 'integer',
        'current_points' => 'integer',
        'original_sentence_days' => 'integer',
        'reduced_sentence_days' => 'integer',
        'expected_release_date' => 'date',
        'adjusted_release_date' => 'date',
    ];

    protected $dates = [
        'birthdate',
        'date_of_admission',
        'last_medical_check',
        'deleted_at',
    ];

    // Relationships
    public function admittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admitted_by_user_id');
    }

    public function cell(): BelongsTo
    {
        return $this->belongsTo(Cell::class);
    }

    // Commented out until models are created
    // public function medicalRecords(): HasMany
    // {
    //     return $this->hasMany(MedicalRecord::class);
    // }

    // public function disciplinaryActions(): HasMany
    // {
    //     return $this->hasMany(DisciplinaryAction::class);
    // }

    // public function visitationLogs(): HasMany
    // {
    //     return $this->hasMany(VisitationLog::class);
    // }

    // public function allowedVisitors(): HasMany
    // {
    //     return $this->hasMany(InmateAllowedVisitor::class);
    // }

    public function pointsHistory(): HasMany
    {
        return $this->hasMany(PointsHistory::class)->orderBy('activity_date', 'desc');
    }

    // Accessors
    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->middle_name . ' ' . $this->last_name);
    }

    public function getAgeAttribute(): int
    {
        return $this->birthdate ? $this->birthdate->diffInYears(now()) : 0;
    }

    public function getFullAddressAttribute(): string
    {
        $parts = array_filter([
            $this->address_line1,
            $this->address_line2,
            $this->city,
            $this->province,
            $this->postal_code,
            $this->country,
        ]);

        return implode(', ', $parts);
    }

    public function getDaysInCustodyAttribute(): int
    {
        return $this->date_of_admission ? $this->date_of_admission->diffInDays(now()) : 0;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    public function scopeByGender($query, string $gender)
    {
        return $query->where('gender', $gender);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByMedicalStatus($query, string $medicalStatus)
    {
        return $query->where('medical_status', $medicalStatus);
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhere('middle_name', 'like', "%{$search}%")
              ->orWhere('crime', 'like', "%{$search}%")
              ->orWhere('sentence', 'like', "%{$search}%")
              ->orWhereHas('cell', function ($cellQuery) use ($search) {
                  $cellQuery->where('name', 'like', "%{$search}%");
              });
        });
    }

    // Helper methods
    public function updatePoints(int $points, string $activity, string $note = null): void
    {
        $this->current_points += $points;
        $this->save();

        // Create points history record if needed
        // This would be handled by a separate PointsHistory model
    }

    public function isActive(): bool
    {
        return $this->status === 'Active';
    }

    public function isReleased(): bool
    {
        return $this->status === 'Released';
    }

    public function isTransferred(): bool
    {
        return $this->status === 'Transferred';
    }

    public function isMedical(): bool
    {
        return $this->status === 'Medical';
    }

    // Cell management methods
    public function assignToCell(Cell $cell): bool
    {
        // Check if cell has available space
        if (!$cell->hasAvailableSpace()) {
            return false;
        }

        // Check if cell type matches inmate gender
        if ($cell->type !== $this->gender) {
            return false;
        }

        // Check if cell is active
        if ($cell->status !== 'Active') {
            return false;
        }

        $this->cell_id = $cell->id;
        $this->save();

        // Update cell occupancy
        $cell->updateCurrentCount();

        return true;
    }

    public function removeFromCell(): void
    {
        if ($this->cell_id) {
            $cell = $this->cell;
            $this->cell_id = null;
            $this->save();

            // Update cell occupancy
            if ($cell) {
                $cell->updateCurrentCount();
            }
        }
    }

    public function transferToCell(Cell $newCell): bool
    {
        $oldCell = $this->cell;
        
        // Remove from current cell
        $this->removeFromCell();
        
        // Assign to new cell
        $success = $this->assignToCell($newCell);
        
        if (!$success && $oldCell) {
            // If assignment failed, restore to old cell
            $this->assignToCell($oldCell);
        }
        
        return $success;
    }

}
