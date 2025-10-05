<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cell extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'capacity',
        'current_count',
        'type',
        'location',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'capacity' => 'integer',
        'current_count' => 'integer',
    ];

    /**
     * Get the inmates in this cell.
     */
    public function inmates(): HasMany
    {
        return $this->hasMany(Inmate::class);
    }

    /**
     * Update the current count based on actual inmates
     */
    public function updateCurrentCount(): void
    {
        $this->current_count = $this->inmates()->where('status', 'Active')->count();
        $this->save();
    }

    /**
     * Check if the cell is at capacity
     */
    public function isAtCapacity(): bool
    {
        return $this->current_count >= $this->capacity;
    }

    /**
     * Check if the cell has available space
     */
    public function hasAvailableSpace(): bool
    {
        return $this->current_count < $this->capacity;
    }

    /**
     * Get available space count
     */
    public function getAvailableSpaceAttribute(): int
    {
        return max(0, $this->capacity - $this->current_count);
    }

    /**
     * Get occupancy percentage
     */
    public function getOccupancyPercentageAttribute(): float
    {
        if ($this->capacity === 0) return 0;
        return ($this->current_count / $this->capacity) * 100;
    }

    /**
     * Scope for active cells
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    /**
     * Scope for cells by type
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for cells with available space
     */
    public function scopeWithAvailableSpace($query)
    {
        return $query->whereRaw('current_count < capacity');
    }
}
