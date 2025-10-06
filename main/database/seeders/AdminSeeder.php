<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Check if user already exists
        if (!User::where('username', 'admin')->exists()) {
            $user = User::create([
                'username' => 'admin',
                'full_name' => 'Administrator',
                'title' => 'System Administrator',
                'subtitle' => 'System Management',
                'email' => 'admin@gmail.com',
                'password' => Hash::make('password'), //password is "password"
                'role_id' => 0,
                'is_active' => true,
            ]);

            // Role assignment removed (Spatie package uninstalled)
        }
    }
}