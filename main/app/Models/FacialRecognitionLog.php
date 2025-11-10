<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class FacialRecognitionLog extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'detected_age',
        'detected_gender',
        'landmarks_count',
        'matched_visitor_id',
        'match_confidence',
        'confidence_threshold',
        'is_match_successful',
        'face_descriptor',
        'detection_metadata',
        'session_id',
        'device_info',
        'ip_address',
        'detection_timestamp',
        'processed_by',
    ];

    protected $casts = [
        'face_descriptor' => 'array',
        'detection_metadata' => 'array',
        'is_match_successful' => 'boolean',
        'match_confidence' => 'decimal:4',
        'confidence_threshold' => 'decimal:4',
        'detection_timestamp' => 'datetime',
        'detected_age' => 'integer',
        'landmarks_count' => 'integer',
    ];

    /**
     * Get the visitor that was matched
     */
    public function matchedVisitor(): BelongsTo
    {
        return $this->belongsTo(Visitor::class, 'matched_visitor_id');
    }

    /**
     * Get the officer who processed this log
     */
    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Get the visitation request associated with this log
     */
    public function visitationRequest(): HasOne
    {
        return $this->hasOne(FacialRecognitionVisitationRequest::class);
    }

    /**
     * Scope for successful matches
     */
    public function scopeSuccessfulMatches($query)
    {
        return $query->where('is_match_successful', true);
    }

    /**
     * Scope for failed matches
     */
    public function scopeFailedMatches($query)
    {
        return $query->where('is_match_successful', false);
    }

    /**
     * Get confidence percentage
     */
    public function getConfidencePercentageAttribute(): float
    {
        return $this->match_confidence ? round($this->match_confidence * 100, 2) : 0;
    }

    /**
     * Get threshold percentage
     */
    public function getThresholdPercentageAttribute(): float
    {
        return round($this->confidence_threshold * 100, 2);
    }
}
