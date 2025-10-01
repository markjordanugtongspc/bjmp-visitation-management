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
        Schema::table('visitation_logs', function (Blueprint $table) {
            // Optional link to allowed visitors record
            if (!Schema::hasColumn('visitation_logs', 'allowed_visitor_id')) {
                $table->foreignId('allowed_visitor_id')
                    ->nullable()
                    ->constrained('inmate_allowed_visitors')
                    ->nullOnDelete()
                    ->index()
                    ->after('inmate_id');
            }

            // Snapshot avatar info for audit/history
            if (!Schema::hasColumn('visitation_logs', 'visitor_avatar_path')) {
                $table->string('visitor_avatar_path')->nullable()->after('visitor_contact');
            }
            if (!Schema::hasColumn('visitation_logs', 'visitor_avatar_filename')) {
                $table->string('visitor_avatar_filename')->nullable()->after('visitor_avatar_path');
            }
            if (!Schema::hasColumn('visitation_logs', 'visitor_avatar_disk')) {
                $table->string('visitor_avatar_disk')->nullable()->default('public')->after('visitor_avatar_filename');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visitation_logs', function (Blueprint $table) {
            if (Schema::hasColumn('visitation_logs', 'allowed_visitor_id')) {
                $table->dropConstrainedForeignId('allowed_visitor_id');
            }
            $table->dropColumn([
                'visitor_avatar_path',
                'visitor_avatar_filename',
                'visitor_avatar_disk',
            ]);
        });
    }
};



