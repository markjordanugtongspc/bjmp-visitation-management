<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

/**
 * ConjugalVisit Model
 * Represents the initial registration for conjugal visits
 */
class ConjugalVisit extends Model
{
    use HasFactory;

    protected $fillable = [
        'visitor_id',
        'inmate_id',
        'cohabitation_cert_path',
        'marriage_contract_path',
        'status',
        'relationship_start_date',
    ];

    protected $casts = [
        'status' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'relationship_start_date' => 'date',
    ];

    /**
     * Get the visitor associated with this conjugal visit
     */
    public function visitor(): BelongsTo
    {
        return $this->belongsTo(Visitor::class);
    }

    /**
     * Get the inmate associated with this conjugal visit
     */
    public function inmate(): BelongsTo
    {
        return $this->belongsTo(Inmate::class);
    }

    /**
     * Get all logs for this conjugal visit registration
     */
    public function logs(): HasMany
    {
        return $this->hasMany(ConjugalVisitLog::class);
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
            default => 'Unknown',
        };
    }

    /**
     * Scope to filter by status
     */
    public function scopeByStatus($query, int $status)
    {
        return $query->where('status', $status);
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
     * Check if conjugal visit is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 1;
    }

    /**
     * Check if conjugal visit is pending
     */
    public function isPending(): bool
    {
        return $this->status === 2;
    }

    /**
     * Check if conjugal visit is denied
     */
    public function isDenied(): bool
    {
        return $this->status === 0;
    }

    /**
     * Determine if both required documents have been uploaded.
     */
    public function hasRequiredDocuments(): bool
    {
        return !empty($this->cohabitation_cert_path) && !empty($this->marriage_contract_path);
    }

    /**
     * Calculates validation data for determining conjugal visit eligibility.
     *
     * @return array{is_valid: bool, years: int|null, reason: string|null}
     */
    public function calculateValidationStatus(): array
    {
        $now = Carbon::now();
        $startDate = $this->relationship_start_date ? Carbon::parse($this->relationship_start_date) : null;

        if (!$startDate) {
            return [
                'is_valid' => false,
                'years' => null,
                'reason' => 'Missing relationship start date',
            ];
        }

        $years = $startDate->diffInYears($now, false);

        if ($years < 0) {
            return [
                'is_valid' => false,
                'years' => $years,
                'reason' => 'Relationship start date is in the future',
            ];
        }

        if ($years < 6) {
            return [
                'is_valid' => false,
                'years' => $years,
                'reason' => 'Couple must be married or living together for at least 6 years',
            ];
        }

        if (!$this->hasRequiredDocuments()) {
            return [
                'is_valid' => false,
                'years' => $years,
                'reason' => 'Required documents are not complete',
            ];
        }

        return [
            'is_valid' => true,
            'years' => $years,
            'reason' => null,
        ];
    }

    /**
     * Determine if the registration is valid for conjugal visit requests.
     */
    public function isValidForConjugalVisit(): bool
    {
        $validation = $this->calculateValidationStatus();

        return $validation['is_valid'] && $this->isApproved();
    }

    /**
     * Human readable validation label.
     */
    public function getValidationStatusLabel(): string
    {
        $validation = $this->calculateValidationStatus();

        if ($validation['is_valid']) {
            return 'VALID';
        }

        $reason = $validation['reason'] ?? 'Not valid for conjugal visit';

        return 'NOT VALID - ' . $reason;
    }
}
