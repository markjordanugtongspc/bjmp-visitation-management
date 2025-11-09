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
        if (!Schema::hasTable('supervision_files')) {
            return;
        }

        // Check if column exists before modifying
        if (Schema::hasColumn('supervision_files', 'category')) {
            // Add 'Conjugal' to the category enum
            try {
                DB::statement("ALTER TABLE supervision_files MODIFY COLUMN category ENUM('Operations', 'Intake', 'Safety', 'Medical', 'Visitation', 'Training', 'Discipline', 'Emergency', 'Conjugal') NOT NULL");
            } catch (\Exception $e) {
                // If enum modification fails, try alternative approach
                // This handles cases where MySQL doesn't support direct enum modification
                if (str_contains($e->getMessage(), 'Duplicate value') || str_contains($e->getMessage(), 'already exists')) {
                    // Value already exists, continue
                } else {
                    throw $e;
                }
            }
        }
        
        // Add storage_type column to differentiate between private and public storage
        if (!Schema::hasColumn('supervision_files', 'storage_type')) {
            Schema::table('supervision_files', function (Blueprint $table) {
                $table->enum('storage_type', ['private', 'public'])->default('private')->after('category');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('supervision_files')) {
            return;
        }

        // Remove storage_type column
        if (Schema::hasColumn('supervision_files', 'storage_type')) {
            Schema::table('supervision_files', function (Blueprint $table) {
                $table->dropColumn('storage_type');
            });
        }
        
        // Revert category enum to original values (only if column exists)
        if (Schema::hasColumn('supervision_files', 'category')) {
            try {
                DB::statement("ALTER TABLE supervision_files MODIFY COLUMN category ENUM('Operations', 'Intake', 'Safety', 'Medical', 'Visitation', 'Training', 'Discipline', 'Emergency') NOT NULL");
            } catch (\Exception $e) {
                // If rollback fails, log but don't throw
                \Log::warning('Failed to revert supervision_files category enum: ' . $e->getMessage());
            }
        }
    }
};
