<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $missingMigrations = [
            ['migration' => '2025_10_01_104948_create_medical_records_table', 'batch' => 3],
            ['migration' => '2025_10_01_104949_create_disciplinary_actions_table', 'batch' => 3],
            ['migration' => '2025_10_01_104949_create_visitation_logs_table', 'batch' => 3],
            ['migration' => '2025_10_01_200100_create_inmate_allowed_visitors_table', 'batch' => 4], // Replaced by visitors table
            ['migration' => '2025_10_02_000000_add_job_field_to_inmates_table', 'batch' => 4],
        ];

        foreach ($missingMigrations as $migration) {
            $exists = DB::table('migrations')
                ->where('migration', $migration['migration'])
                ->exists();

            if (!$exists) {
                DB::table('migrations')->insert([
                    'migration' => $migration['migration'],
                    'batch' => $migration['batch'],
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $migrationsToRemove = [
            '2025_10_01_104948_create_medical_records_table',
            '2025_10_01_104949_create_disciplinary_actions_table',
            '2025_10_01_104949_create_visitation_logs_table',
            '2025_10_01_200100_create_inmate_allowed_visitors_table',
            '2025_10_02_000000_add_job_field_to_inmates_table',
        ];

        DB::table('migrations')->whereIn('migration', $migrationsToRemove)->delete();
    }
};
