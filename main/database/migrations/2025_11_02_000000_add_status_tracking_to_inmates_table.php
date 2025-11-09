<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('inmates')) {
            return;
        }

        Schema::table('inmates', function (Blueprint $table) {
            // Add timestamp tracking for status changes (only if columns don't exist)
            if (!Schema::hasColumn('inmates', 'released_at')) {
                $table->timestamp('released_at')->nullable()->after('status');
                $table->index('released_at');
            }
            if (!Schema::hasColumn('inmates', 'transferred_at')) {
                $table->timestamp('transferred_at')->nullable()->after('released_at');
                $table->index('transferred_at');
            }
            
            // Add transfer destination/notes
            if (!Schema::hasColumn('inmates', 'transfer_destination')) {
                $table->text('transfer_destination')->nullable()->after('transferred_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('inmates')) {
            return;
        }

        Schema::table('inmates', function (Blueprint $table) {
            // Drop indexes if they exist
            if (Schema::hasColumn('inmates', 'released_at')) {
                try {
                    $table->dropIndex(['released_at']);
                } catch (\Exception $e) {
                    // Index might not exist, continue
                }
            }
            if (Schema::hasColumn('inmates', 'transferred_at')) {
                try {
                    $table->dropIndex(['transferred_at']);
                } catch (\Exception $e) {
                    // Index might not exist, continue
                }
            }
            
            // Drop columns if they exist
            $columnsToDrop = [];
            if (Schema::hasColumn('inmates', 'released_at')) {
                $columnsToDrop[] = 'released_at';
            }
            if (Schema::hasColumn('inmates', 'transferred_at')) {
                $columnsToDrop[] = 'transferred_at';
            }
            if (Schema::hasColumn('inmates', 'transfer_destination')) {
                $columnsToDrop[] = 'transfer_destination';
            }
            
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
