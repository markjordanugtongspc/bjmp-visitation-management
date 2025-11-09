<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;

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
        return $this->role_id == 0;
    }
    
    /**
     * Check if the user is a warden.
     *
     * @return bool
     */
    public function isWarden()
    {
        return $this->role_id == 1;
    }
    
    /**
     * Check if the user is a jail head nurse.
     *
     * @return bool
     */
    public function isHeadNurse()
    {
        return $this->role_id == 6;
    }
    
    /**
     * Check if the user is a jail nurse.
     *
     * @return bool
     */
    public function isNurse()
    {
        return $this->role_id == 7;
    }
    
    /**
     * Get the user's role name.
     *
     * @return string
     */
    public function getRoleName()
    {
        return match($this->role_id) {
            0 => 'Admin',
            1 => 'Warden',
            2 => 'Assistant Warden',
            6 => 'Jail Head Nurse',
            7 => 'Jail Nurse',
            8 => 'Searcher',
            default => 'User'
        };
    }

    /**
     * Get the dashboard route for the user's role.
     *
     * @return string
     */
    public function getDashboardRoute()
    {
        return match($this->role_id) {
            0 => 'admin.dashboard',           // Admin
            1 => 'warden.dashboard',          // Warden
            2 => 'assistant-warden.dashboard', // Assistant Warden
            6, 7 => 'nurse.dashboard',        // Jail Head Nurse, Jail Nurse
            8 => 'searcher.dashboard',        // Searcher
            default => 'admin.dashboard',     // Fallback to admin dashboard
        };
    }
    
    /**
     * Get the user's profile picture URL.
     *
     * @return string
     */
    public function getProfilePictureUrlAttribute()
    {
        if ($this->profile_picture && Storage::disk('public')->exists($this->profile_picture)) {
            return Storage::url($this->profile_picture);
        }
        
        // Fallback to ui-avatars.com API with user's full name
        $name = urlencode($this->full_name ?? 'User');
        return "https://ui-avatars.com/api/?name={$name}&background=random";
    }
}
