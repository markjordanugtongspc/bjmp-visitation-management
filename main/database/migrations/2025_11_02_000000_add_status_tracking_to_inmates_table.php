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
        Schema::table('inmates', function (Blueprint $table) {
            // Add timestamp tracking for status changes
            $table->timestamp('released_at')->nullable()->after('status');
            $table->timestamp('transferred_at')->nullable()->after('released_at');
            
            // Add transfer destination/notes
            $table->text('transfer_destination')->nullable()->after('transferred_at');
            
            // Add index for timestamp queries
            $table->index('released_at');
            $table->index('transferred_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inmates', function (Blueprint $table) {
            $table->dropIndex(['released_at']);
            $table->dropIndex(['transferred_at']);
            $table->dropColumn(['released_at', 'transferred_at', 'transfer_destination']);
        });
    }
};
