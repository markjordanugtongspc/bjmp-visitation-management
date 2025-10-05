<?php

namespace Database\Seeders;

use App\Models\Cell;
use Illuminate\Database\Seeder;

class CellSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cells = [
            [
                'name' => 'Cell 1A',
                'capacity' => 20,
                'current_count' => 0,
                'type' => 'Male',
                'location' => 'Block A',
                'status' => 'Active',
            ],
            [
                'name' => 'Cell 1B',
                'capacity' => 20,
                'current_count' => 0,
                'type' => 'Male',
                'location' => 'Block A',
                'status' => 'Active',
            ],
            [
                'name' => 'Cell 2A',
                'capacity' => 15,
                'current_count' => 0,
                'type' => 'Female',
                'location' => 'Block B',
                'status' => 'Active',
            ],
            [
                'name' => 'Cell 2B',
                'capacity' => 15,
                'current_count' => 0,
                'type' => 'Female',
                'location' => 'Block B',
                'status' => 'Active',
            ],
            [
                'name' => 'Cell 3A',
                'capacity' => 25,
                'current_count' => 0,
                'type' => 'Male',
                'location' => 'Block C',
                'status' => 'Active',
            ],
            [
                'name' => 'Cell 3B',
                'capacity' => 25,
                'current_count' => 0,
                'type' => 'Male',
                'location' => 'Block C',
                'status' => 'Maintenance',
            ],
        ];

        foreach ($cells as $cellData) {
            Cell::create($cellData);
        }
    }
}