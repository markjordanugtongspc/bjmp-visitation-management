<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class MedicalVisit extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'inmate_id',
        'scheduled_at',
        'visit_type',
        'recurring_frequency',
        'recurring_until',
        'status',
        'notes',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'scheduled_at' => 'datetime',
        'recurring_until' => 'date',
    ];

    /**
     * Get the inmate that owns the medical visit.
     */
    public function inmate(): BelongsTo
    {
        return $this->belongsTo(Inmate::class);
    }

    /**
     * Get the user who created the medical visit.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope a query to only include scheduled visits.
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    /**
     * Scope a query to only include completed visits.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include upcoming visits.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('scheduled_at', '>', now())
                    ->where('status', 'scheduled');
    }

    /**
     * Scope a query to only include visits for a specific inmate.
     */
    public function scopeForInmate($query, $inmateId)
    {
        return $query->where('inmate_id', $inmateId);
    }

    /**
     * Check if the visit is upcoming.
     */
    public function isUpcoming(): bool
    {
        return $this->scheduled_at > now() && $this->status === 'scheduled';
    }

    /**
     * Check if the visit is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->scheduled_at < now() && $this->status === 'scheduled';
    }

    /**
     * Check if the visit is recurring.
     */
    public function isRecurring(): bool
    {
        return $this->visit_type === 'recurring';
    }

    /**
     * Get the formatted scheduled date and time.
     */
    public function getFormattedScheduledAtAttribute(): string
    {
        return $this->scheduled_at->format('M j, Y g:i A');
    }

    /**
     * Get the status badge color class.
     */
    public function getStatusBadgeClassAttribute(): string
    {
        return match($this->status) {
            'scheduled' => 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
            'completed' => 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
            'missed' => 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
            'cancelled' => 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
            default => 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
        };
    }

    /**
     * Get the visit type badge color class.
     */
    public function getVisitTypeBadgeClassAttribute(): string
    {
        return match($this->visit_type) {
            'one-time' => 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
            'recurring' => 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
            default => 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
        };
    }
}
