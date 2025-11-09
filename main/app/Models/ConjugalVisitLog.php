<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ConjugalVisitLog Model
 * Represents individual conjugal visit sessions/logs
 */
class ConjugalVisitLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'conjugal_visit_id',
        'visitor_id',
        'inmate_id',
        'schedule',
        'duration_minutes',
        'paid',
        'status',
        'reference_number',
    ];

    protected $casts = [
        'schedule' => 'datetime',
        'duration_minutes' => 'integer',
        'status' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the conjugal visit registration
     */
    public function conjugalVisit(): BelongsTo
    {
        return $this->belongsTo(ConjugalVisit::class);
    }

    /**
     * Get the visitor
     */
    public function visitor(): BelongsTo
    {
        return $this->belongsTo(Visitor::class);
    }

    /**
     * Get the inmate
     */
    public function inmate(): BelongsTo
    {
        return $this->belongsTo(Inmate::class);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            0 => 'Denied',
            1 => 'Approved',
            2 => 'Pending',
            3 => 'Completed',
            default => 'Unknown',
        };
    }

    /**
     * Get paid status label
     */
    public function getPaidLabelAttribute(): string
    {
        return $this->paid;
    }

    /**
     * Get formatted duration
     */
    public function getFormattedDurationAttribute(): string
    {
        $minutes = $this->duration_minutes;
        
        if ($minutes >= 60) {
            $hours = floor($minutes / 60);
            $remainingMinutes = $minutes % 60;
            
            if ($remainingMinutes > 0) {
                return "{$hours} Hour" . ($hours > 1 ? 's' : '') . " {$remainingMinutes} Min";
            }
            
            return "{$hours} Hour" . ($hours > 1 ? 's' : '');
        }
        
        return "{$minutes} Minutes";
    }

    /**
     * Scope to filter by status
     */
    public function scopeByStatus($query, int $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter by paid status
     */
    public function scopeByPaidStatus($query, string $paid)
    {
        return $query->where('paid', $paid);
    }

    /**
     * Scope to filter by visitor
     */
    public function scopeByVisitor($query, int $visitorId)
    {
        return $query->where('visitor_id', $visitorId);
    }

    /**
     * Scope to filter by inmate
     */
    public function scopeByInmate($query, int $inmateId)
    {
        return $query->where('inmate_id', $inmateId);
    }

    /**
     * Scope to filter by date range
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('schedule', [$startDate, $endDate]);
    }

    /**
     * Check if payment is completed
     */
    public function isPaid(): bool
    {
        return $this->paid === 'YES';
    }

    /**
     * Check if visit is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 3;
    }

    /**
     * Check if visit is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 1;
    }

    /**
     * Check if visit is pending
     */
    public function isPending(): bool
    {
        return $this->status === 2;
    }
}
