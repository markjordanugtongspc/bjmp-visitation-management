<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('visitation_logs', 'status')) {
            Schema::table('visitation_logs', function (Blueprint $table) {
                if (!Schema::hasColumn('visitation_logs', 'status_tiny')) {
                    $table->unsignedTinyInteger('status_tiny')->default(2);
                }
            });

            DB::statement("
                UPDATE visitation_logs
                SET status_tiny = CASE status
                    WHEN 'Approved'  THEN 1
                    WHEN 'Pending'   THEN 2
                    WHEN 'Denied'    THEN 0
                    WHEN 'Completed' THEN 2
                    WHEN 'Cancelled' THEN 2
                    ELSE 2
                END
            ");

            Schema::table('visitation_logs', function (Blueprint $table) {
                $table->dropColumn('status');
            });

            Schema::table('visitation_logs', function (Blueprint $table) {
                $table->unsignedTinyInteger('status')->default(2);
            });

            DB::statement("UPDATE visitation_logs SET status = status_tiny");

            Schema::table('visitation_logs', function (Blueprint $table) {
                $table->dropColumn('status_tiny');
            });
        } else {
            Schema::table('visitation_logs', function (Blueprint $table) {
                if (!Schema::hasColumn('visitation_logs', 'status')) {
                    $table->unsignedTinyInteger('status')->default(2);
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('visitation_logs', 'status')) {
            Schema::table('visitation_logs', function (Blueprint $table) {
                if (!Schema::hasColumn('visitation_logs', 'status_old')) {
                    $table->enum('status_old', ['Approved', 'Pending', 'Denied', 'Completed', 'Cancelled'])->default('Pending');
                }
            });

            DB::statement("
                UPDATE visitation_logs
                SET status_old = CASE status
                    WHEN 1 THEN 'Approved'
                    WHEN 0 THEN 'Denied'
                    ELSE 'Pending'
                END
            ");

            Schema::table('visitation_logs', function (Blueprint $table) {
                $table->dropColumn('status');
            });

            Schema::table('visitation_logs', function (Blueprint $table) {
                $table->enum('status', ['Approved', 'Pending', 'Denied', 'Completed', 'Cancelled'])->default('Pending');
            });

            DB::statement("UPDATE visitation_logs SET status = status_old");

            Schema::table('visitation_logs', function (Blueprint $table) {
                $table->dropColumn('status_old');
            });
        }
    }
};