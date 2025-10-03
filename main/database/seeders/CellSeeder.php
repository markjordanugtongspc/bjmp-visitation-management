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
        // Create initial cells
        $cells = [
            [
                'name' => 'Cell 1',
                'capacity' => 20,
                'type' => 'Male',
                'description' => 'Male detention cell',
                'status' => 'Active',
            ],
            [
                'name' => 'Cell 2',
                'capacity' => 15,
                'type' => 'Female',
                'description' => 'Female detention cell',
                'status' => 'Active',
            ],
            [
                'name' => 'Cell 3',
                'capacity' => 25,
                'type' => 'Male',
                'description' => 'Male detention cell',
                'status' => 'Active',
            ],
            [
                'name' => 'Cell 4',
                'capacity' => 18,
                'type' => 'Female',
                'description' => 'Female detention cell',
                'status' => 'Active',
            ],
        ];

        foreach ($cells as $cell) {
            Cell::create($cell);
        }
    }
}
