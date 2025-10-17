<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupervisionFile extends Model
{
    protected $fillable = [
        'title',
        'category',
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
}
