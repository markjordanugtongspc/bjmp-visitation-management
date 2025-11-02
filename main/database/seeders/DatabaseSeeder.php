<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            OfficerSeeder::class,
            // CellSeeder::class, // Removed: Cells should be created manually by users
        ]);
    }
}