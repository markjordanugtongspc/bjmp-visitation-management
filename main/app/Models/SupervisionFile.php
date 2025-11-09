<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupervisionFile extends Model
{
    protected $fillable = [
        'title',
        'category',
        'storage_type',
        'summary',
        'file_path',
        'file_name',
        'file_size',
        'file_type',
        'uploaded_by'
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    /**
     * Get the user who uploaded this file
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by', 'user_id');
    }

    /**
     * Get formatted file size
     */
    public function getFormattedFileSizeAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Get file extension
     */
    public function getFileExtensionAttribute(): string
    {
        return pathinfo($this->file_name, PATHINFO_EXTENSION);
    }

    /**
     * Scope to filter by category
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope to filter by uploader
     */
    public function scopeByUploader($query, int $userId)
    {
        return $query->where('uploaded_by', $userId);
    }

    /**
     * Scope to filter by storage type
     */
    public function scopeByStorageType($query, string $storageType)
    {
        return $query->where('storage_type', $storageType);
    }

    /**
     * Get full file URL based on storage type
     */
    public function getFileUrlAttribute(): string
    {
        if ($this->storage_type === 'public') {
            return asset('storage/' . $this->file_path . '/' . $this->file_name);
        }
        
        // For private files, use a route that checks permissions
        return route('warden.supervision.preview', ['id' => $this->id]);
    }

    /**
     * Check if file is publicly accessible
     */
    public function isPublic(): bool
    {
        return $this->storage_type === 'public';
    }
}
