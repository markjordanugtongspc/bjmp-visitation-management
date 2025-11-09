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
        // Check if 'time_in' exists before using it in 'after'
        if (Schema::hasColumn('visitation_logs', 'time_in')) {
            Schema::table('visitation_logs', function (Blueprint $table) {
                if (!Schema::hasColumn('visitation_logs', 'time_out')) {
                    $table->timestamp('time_out')->nullable()->after('time_in');
                }

                $table->string('reason_for_visit', 500)->nullable()->after('time_out');
            });
        } else {
            // Fallback: add 'time_out' without specifying 'after'
            Schema::table('visitation_logs', function (Blueprint $table) {
                if (!Schema::hasColumn('visitation_logs', 'time_out')) {
                    $table->timestamp('time_out')->nullable();
                }

                $table->string('reason_for_visit', 500)->nullable()->after('time_out');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visitation_logs', function (Blueprint $table) {
            if (Schema::hasColumn('visitation_logs', 'reason_for_visit')) {
                $table->dropColumn('reason_for_visit');
            }

            if (Schema::hasColumn('visitation_logs', 'time_out')) {
                $table->dropColumn('time_out');
            }
        });
    }
};