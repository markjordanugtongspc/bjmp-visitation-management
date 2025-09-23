<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'full_name',
        'email',
        'password',
        'role_id',
        'profile_picture',
        'is_active',
        'title',
        'subtitle',
        'last_login',
        'phone_number',
        'address',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'last_login' => 'datetime',
        ];
    }
    
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'user_id';
    
    /**
     * Check if the user is an admin.
     *
     * @return bool
     */
    public function isAdmin()
    {
        return $this->role_id == 1;
    }
    
    /**
     * Get the user's role name.
     *
     * @return string
     */
    public function getRoleName()
    {
        return match($this->role_id) {
            1 => 'Admin',
            2 => 'Officer',
            3 => 'Staff',
            default => 'User'
        };
    }
}
