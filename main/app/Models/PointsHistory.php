<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PointsHistory extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'points_history';

    protected $fillable = [
        'inmate_id',
        'points_delta',
        'points_before',
        'points_after',
        'activity',
        'notes',
        'activity_date',
        'created_by_user_id'
    ];

    protected $casts = [
        'activity_date' => 'date',
        'points_delta' => 'integer',
        'points_before' => 'integer',
        'points_after' => 'integer',
    ];

    // Relationships
    public function inmate(): BelongsTo
    {
        return $this->belongsTo(Inmate::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}