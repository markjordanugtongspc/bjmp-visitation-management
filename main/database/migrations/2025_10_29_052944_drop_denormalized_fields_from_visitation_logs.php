<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('visitation_logs', function (Blueprint $table) {
            if (Schema::hasColumn('visitation_logs', 'visitor_name')) $table->dropColumn('visitor_name');
            if (Schema::hasColumn('visitation_logs', 'relationship')) $table->dropColumn('relationship');
            if (Schema::hasColumn('visitation_logs', 'visitor_id_type')) $table->dropColumn('visitor_id_type');
            if (Schema::hasColumn('visitation_logs', 'visitor_id_number')) $table->dropColumn('visitor_id_number');
            if (Schema::hasColumn('visitation_logs', 'visitor_contact')) $table->dropColumn('visitor_contact');
            if (Schema::hasColumn('visitation_logs', 'visit_date')) $table->dropColumn('visit_date');
            if (Schema::hasColumn('visitation_logs', 'visit_time')) $table->dropColumn('visit_time');
        });
    }

    public function down(): void
    {
        Schema::table('visitation_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('visitation_logs', 'visitor_name')) $table->string('visitor_name')->nullable();
            if (!Schema::hasColumn('visitation_logs', 'relationship')) $table->string('relationship')->nullable();
            if (!Schema::hasColumn('visitation_logs', 'visitor_id_type')) $table->string('visitor_id_type')->nullable();
            if (!Schema::hasColumn('visitation_logs', 'visitor_id_number')) $table->string('visitor_id_number')->nullable();
            if (!Schema::hasColumn('visitation_logs', 'visitor_contact')) $table->string('visitor_contact')->nullable();
            if (!Schema::hasColumn('visitation_logs', 'visit_date')) $table->date('visit_date')->nullable();
            if (!Schema::hasColumn('visitation_logs', 'visit_time')) $table->time('visit_time')->nullable();
        });
    }
};