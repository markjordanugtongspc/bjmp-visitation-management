<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * TODO: Connect created_by_user_id and updated_by_user_id to inmates table for future functionality
     */
    public function up(): void
    {
        // Check if inmate_allowed_visitors table exists
        if (Schema::hasTable('inmate_allowed_visitors')) {
            // Rename table
            Schema::rename('inmate_allowed_visitors', 'visitors');
        }

        // Rename contact_number to phone if exists
        if (Schema::hasColumn('visitors', 'contact_number') && !Schema::hasColumn('visitors', 'phone')) {
            DB::statement('ALTER TABLE `visitors` CHANGE COLUMN `contact_number` `phone` VARCHAR(255) NULL');
        }

        // Modify the table structure
        Schema::table('visitors', function (Blueprint $table) {
            // Remove avatar_disk column if exists
            if (Schema::hasColumn('visitors', 'avatar_disk')) {
                $table->dropColumn('avatar_disk');
            }

            // Add email column if it doesn't exist
            if (!Schema::hasColumn('visitors', 'email')) {
                $table->string('email')->nullable()->after('phone');
            }
        });

        // Handle indexes separately with error handling
        try {
            // Try to get all indexes
            $indexes = DB::select("SHOW INDEX FROM visitors");
            $indexNames = array_unique(array_map(fn($idx) => $idx->Key_name, $indexes));
            
            // Drop composite index if it exists
            foreach ($indexNames as $idxName) {
                if (str_contains($idxName, 'inmate_id') && str_contains($idxName, 'name')) {
                    DB::statement("ALTER TABLE visitors DROP INDEX {$idxName}");
                    break;
                }
            }
        } catch (\Exception $e) {
            // Continue if index doesn't exist
        }

        // Add new indexes
        try {
            Schema::table('visitors', function (Blueprint $table) {
                $table->index('name', 'visitors_name_index');
            });
        } catch (\Exception $e) {
            // Index already exists
        }

        try {
            Schema::table('visitors', function (Blueprint $table) {
                $table->index('email', 'visitors_email_index');
            });
        } catch (\Exception $e) {
            // Index already exists
        }

        try {
            Schema::table('visitors', function (Blueprint $table) {
                $table->index('phone', 'visitors_phone_index');
            });
        } catch (\Exception $e) {
            // Index already exists
        }

        try {
            Schema::table('visitors', function (Blueprint $table) {
                $table->index(['inmate_id', 'name'], 'visitors_inmate_id_name_index');
            });
        } catch (\Exception $e) {
            // Index already exists
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('visitors')) {
            Schema::table('visitors', function (Blueprint $table) {
                // Add back avatar_disk column
                if (!Schema::hasColumn('visitors', 'avatar_disk')) {
                    $table->string('avatar_disk')->nullable()->default('public')->after('avatar_filename');
                }

                // Drop email column
                if (Schema::hasColumn('visitors', 'email')) {
                    $table->dropColumn('email');
                }
            });

            // Drop indexes
            try {
                DB::statement("ALTER TABLE visitors DROP INDEX visitors_inmate_id_name_index");
            } catch (\Exception $e) {}
            
            try {
                DB::statement("ALTER TABLE visitors DROP INDEX visitors_name_index");
            } catch (\Exception $e) {}
            
            try {
                DB::statement("ALTER TABLE visitors DROP INDEX visitors_email_index");
            } catch (\Exception $e) {}
            
            try {
                DB::statement("ALTER TABLE visitors DROP INDEX visitors_phone_index");
            } catch (\Exception $e) {}

            // Rename phone back to contact_number
            if (Schema::hasColumn('visitors', 'phone') && !Schema::hasColumn('visitors', 'contact_number')) {
                DB::statement('ALTER TABLE `visitors` CHANGE COLUMN `phone` `contact_number` VARCHAR(255) NULL');
            }

            // Rename table back
            Schema::rename('visitors', 'inmate_allowed_visitors');
        }
    }
};
