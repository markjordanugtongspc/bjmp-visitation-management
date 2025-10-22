<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicalFile extends Model
{
    protected $fillable = [
        'inmate_id',
        'file_name',
        'file_path',
        'file_type',
        'category',
        'file_size',
        'notes',
        'uploaded_by'
    ];
    
    public function inmate(): BelongsTo
    {
        return $this->belongsTo(Inmate::class);
    }
    
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by', 'user_id');
    }
    
    public function getFileSizeFormattedAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = floor(log($bytes) / log(1024));
        return round($bytes / pow(1024, $i), 1) . ' ' . $units[$i];
    }
}
