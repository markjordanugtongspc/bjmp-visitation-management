<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Visitor Model
 * 
 * TODO: Connect created_by_user_id and updated_by_user_id to inmates table for future functionality
 */
class Visitor extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'inmate_id',
        'name',
        'phone',
        'email',
        'relationship',
        'id_type',
        'id_number',
        'address',
        'avatar_path',
        'avatar_filename',
        'life_status',
        'is_allowed',
        'created_by_user_id',
        'updated_by_user_id',
    ];

    protected $casts = [
        'is_allowed' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the inmate that this visitor is associated with
     */
    public function inmate(): BelongsTo
    {
        return $this->belongsTo(Inmate::class);
    }

    /**
     * Get the visitation logs for this visitor
     */
    public function visitationLogs(): HasMany
    {
        return $this->hasMany(VisitationLog::class);
    }

    /**
     * Get the user who created this visitor
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id', 'user_id');
    }

    /**
     * Get the user who last updated this visitor
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by_user_id', 'user_id');
    }

    /**
     * Get avatar URL accessor
     */
    public function getAvatarUrlAttribute(): ?string
    {
        if ($this->avatar_path && $this->avatar_filename) {
            return asset('storage/' . $this->avatar_path . '/' . $this->avatar_filename);
        }
        return null;
    }

    /**
     * Scope a query to search visitors
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('phone', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('id_number', 'like', "%{$search}%");
        });
    }

    /**
     * Scope a query to filter by inmate
     */
    public function scopeByInmate($query, int $inmateId)
    {
        return $query->where('inmate_id', $inmateId);
    }

    /**
     * Scope a query to filter by relationship
     */
    public function scopeByRelationship($query, string $relationship)
    {
        return $query->where('relationship', $relationship);
    }
}
