<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicalRecord extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'medical_records';

    protected $fillable = [
        'inmate_id',
        'record_date',
        'diagnosis',
        'treatment',
        'doctor_notes',
        'vitals',
        'allergies',
        'medications',
        'created_by_user_id'
    ];

    protected $casts = [
        'record_date' => 'date',
        'vitals' => 'json',
        'allergies' => 'json',
        'medications' => 'json',
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
