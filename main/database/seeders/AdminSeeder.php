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
        if (!User::where('username', 'superadmin')->exists()) {
            $user = User::create([
                'username' => 'superadmin',
                'full_name' => 'Super Administrator',
                'email' => 'superadmin@gmail.com',
                'password' => Hash::make('password'), //password is "password"
                'role_id' => 1,
                'is_active' => true,
            ]);

            $user->assignRole('superadmin');
        }
    }
}