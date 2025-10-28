<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class OfficerSeeder extends Seeder
{
    public function run(): void
    {
        $officers = [
            ['full_name' => 'Juan Warden', 'email' => 'warden@bjmp.gov.ph', 'title' => 'Warden', 'subtitle' => 'Jail Management', 'role_id' => 1],
            ['full_name' => 'Ms. Warden', 'email' => 'asst.warden@bjmp.gov.ph', 'title' => 'Assistant Warden', 'subtitle' => 'Operations', 'role_id' => 2],
            ['full_name' => 'Sir Chief', 'email' => 'custodial@bjmp.gov.ph', 'title' => 'Chief Custodial', 'subtitle' => 'Security', 'role_id' => 2],
            ['full_name' => 'Chief ICT', 'email' => 'ict@bjmp.gov.ph', 'title' => 'Chief ICT', 'subtitle' => 'Information Systems', 'role_id' => 2],
            ['full_name' => 'Senior Jail Officer', 'email' => 'sjo@bjmp.gov.ph', 'title' => 'Unit Executive Senior Jail Officer', 'subtitle' => 'Administration', 'role_id' => 2],
            ['full_name' => 'Chief Nurse', 'email' => 'health@bjmp.gov.ph', 'title' => 'Chief Health Nurse', 'subtitle' => 'Medical Services', 'role_id' => 6],
            ['full_name' => 'Jail Nurse', 'email' => 'nurse@bjmp.gov.ph', 'title' => 'Jail Nurse', 'subtitle' => 'Medical Services', 'role_id' => 7],
        ];

        foreach ($officers as $index => $o) {
            // Create a safe unique username from name or email prefix
            $baseUsername = strtolower(preg_replace('/[^a-z0-9]+/i', '.', explode('@', $o['email'])[0] ?: ('officer'.($index+1))));
            $username = $baseUsername;
            $suffix = 1;
            while (User::where('username', $username)->exists()) {
                $username = $baseUsername . $suffix;
                $suffix++;
            }

            // Upsert by email
            $user = User::where('email', $o['email'])->first();
            if (!$user) {
                User::create([
                    'username' => $username,
                    'email' => $o['email'],
                    'password' => Hash::make('password'), // default, change later
                    'full_name' => $o['full_name'],
                    'title' => $o['title'],
                    'subtitle' => $o['subtitle'],
                    'role_id' => $o['role_id'],
                    'is_active' => true,
                ]);
            } else {
                // Ensure fields are aligned if already present
                $user->fill([
                    'username' => $username,
                    'full_name' => $o['full_name'],
                    'title' => $o['title'],
                    'subtitle' => $o['subtitle'],
                    'role_id' => $o['role_id'],
                    'is_active' => true,
                ])->save();
            }
        }
    }
}


