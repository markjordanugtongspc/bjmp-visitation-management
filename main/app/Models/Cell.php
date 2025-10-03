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
        'type',
        'description',
        'status',
    ];

    /**
     * Get the inmates in this cell.
     */
    public function inmates(): HasMany
    {
        return $this->hasMany(Inmate::class);
    }
}
