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
            $table->string('reason_for_visit', 500)->nullable()->after('time_out');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visitation_logs', function (Blueprint $table) {
            $table->dropColumn('reason_for_visit');
        });
    }
};
