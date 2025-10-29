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
        // Try to drop the foreign key constraint if it exists
        try {
            DB::statement('ALTER TABLE `visitation_logs` DROP FOREIGN KEY `visitation_logs_allowed_visitor_id_foreign`');
        } catch (\Exception $e) {
            // Foreign key doesn't exist, try alternative names
            try {
                DB::statement('ALTER TABLE `visitation_logs` DROP FOREIGN KEY `visitation_logs_visitor_id_foreign`');
            } catch (\Exception $e2) {
                // Neither exists, continue
            }
        }

        // Rename the column if it exists
        if (Schema::hasColumn('visitation_logs', 'allowed_visitor_id') && !Schema::hasColumn('visitation_logs', 'visitor_id')) {
            DB::statement('ALTER TABLE `visitation_logs` CHANGE COLUMN `allowed_visitor_id` `visitor_id` BIGINT UNSIGNED NULL');
        }

        // Add the new foreign key constraint
        Schema::table('visitation_logs', function (Blueprint $table) {
            // Ensure visitor_id column exists
            if (!Schema::hasColumn('visitation_logs', 'visitor_id')) {
                $table->foreignId('visitor_id')
                    ->nullable()
                    ->after('inmate_id');
            }
        });

        // Add foreign key constraint outside the blueprint closure
        try {
            DB::statement('ALTER TABLE `visitation_logs` ADD CONSTRAINT `visitation_logs_visitor_id_foreign` 
                FOREIGN KEY (`visitor_id`) REFERENCES `visitors` (`id`) ON DELETE SET NULL');
        } catch (\Exception $e) {
            // Foreign key already exists
        }

        Schema::table('visitation_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('visitation_logs', 'schedule')) {
                $table->dateTime('schedule')->nullable()->after('visitor_id');
            }
            if (!Schema::hasColumn('visitation_logs', 'status')) {
                $table->unsignedTinyInteger('status')->default(2)->after('schedule');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visitation_logs', function (Blueprint $table) {
            // Drop the new foreign key constraint
            try {
                $table->dropForeign(['visitor_id']);
            } catch (\Exception $e) {
                // Foreign key doesn't exist, continue
            }
        });

        Schema::table('visitation_logs', function (Blueprint $table) {
            if (Schema::hasColumn('visitation_logs', 'status')) {
                $table->dropColumn('status');
            }
            if (Schema::hasColumn('visitation_logs', 'schedule')) {
                $table->dropColumn('schedule');
            }
        });

        // Rename back to allowed_visitor_id
        if (Schema::hasColumn('visitation_logs', 'visitor_id') && !Schema::hasColumn('visitation_logs', 'allowed_visitor_id')) {
            DB::statement('ALTER TABLE `visitation_logs` CHANGE COLUMN `visitor_id` `allowed_visitor_id` BIGINT UNSIGNED NULL');
        }

        // Add back the old foreign key constraint
        Schema::table('visitation_logs', function (Blueprint $table) {
            if (Schema::hasColumn('visitation_logs', 'allowed_visitor_id')) {
                $table->foreign('allowed_visitor_id')
                    ->references('id')
                    ->on('inmate_allowed_visitors')
                    ->nullOnDelete()
                    ->index();
            }
        });
    }
};
