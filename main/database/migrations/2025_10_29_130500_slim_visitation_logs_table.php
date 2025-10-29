<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('visitation_logs', function (Blueprint $table) {
            try { $table->dropForeign('visitation_logs_created_by_user_id_foreign'); } catch (\Throwable $e) {}
            try { $table->dropForeign('visitation_logs_updated_by_user_id_foreign'); } catch (\Throwable $e) {}
        });

        try { DB::statement('ALTER TABLE visitation_logs DROP INDEX visitation_logs_inmate_id_visit_date_index'); } catch (\Throwable $e) {}
        try { DB::statement('ALTER TABLE visitation_logs DROP INDEX visitation_logs_visit_date_index'); } catch (\Throwable $e) {}

        Schema::table('visitation_logs', function (Blueprint $table) {
            $drops = [
                'visitor_name',
                'relationship',
                'visitor_id_type',
                'visitor_id_number',
                'visitor_contact',
                'visit_date',
                'visit_time',
                'duration_minutes',
                'purpose',
                'officer_in_charge',
                'notes',
                'created_by_user_id',
                'updated_by_user_id',
                'deleted_at',
            ];
            foreach ($drops as $col) {
                if (Schema::hasColumn('visitation_logs', $col)) {
                    $table->dropColumn($col);
                }
            }
            if (!Schema::hasColumn('visitation_logs', 'schedule')) {
                $table->dateTime('schedule')->nullable()->after('visitor_id');
            }
            if (!Schema::hasColumn('visitation_logs', 'status')) {
                $table->unsignedTinyInteger('status')->default(2)->after('schedule');
            }
        });

        try {
            $column = DB::select("SHOW COLUMNS FROM visitation_logs LIKE 'status'");
            if (!empty($column)) {
                $type = strtolower($column[0]->Type ?? '');
                if (str_starts_with($type, 'enum')) {
                    Schema::table('visitation_logs', function (Blueprint $table) {
                        if (!Schema::hasColumn('visitation_logs', 'status_tiny')) {
                            $table->unsignedTinyInteger('status_tiny')->default(2)->after('schedule');
                        }
                    });

                    DB::statement("\n                        UPDATE visitation_logs\n                        SET status_tiny = CASE status\n                            WHEN 'Approved'  THEN 1\n                            WHEN 'Pending'   THEN 2\n                            WHEN 'Denied'    THEN 0\n                            WHEN 'Completed' THEN 2\n                            WHEN 'Cancelled' THEN 2\n                            ELSE 2\n                        END\n                    ");

                    Schema::table('visitation_logs', function (Blueprint $table) {
                        $table->dropColumn('status');
                    });

                    Schema::table('visitation_logs', function (Blueprint $table) {
                        $table->unsignedTinyInteger('status')->default(2)->after('schedule');
                    });

                    DB::statement("UPDATE visitation_logs SET status = status_tiny");

                    Schema::table('visitation_logs', function (Blueprint $table) {
                        $table->dropColumn('status_tiny');
                    });
                }
            }
        } catch (\Throwable $e) {}
    }

    public function down(): void
    {
        Schema::table('visitation_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('visitation_logs', 'deleted_at')) {
                $table->softDeletes();
            }
            if (!Schema::hasColumn('visitation_logs', 'created_by_user_id')) {
                $table->unsignedBigInteger('created_by_user_id')->nullable()->index();
            }
            if (!Schema::hasColumn('visitation_logs', 'updated_by_user_id')) {
                $table->unsignedBigInteger('updated_by_user_id')->nullable()->index();
            }
            if (!Schema::hasColumn('visitation_logs', 'visit_date')) {
                $table->date('visit_date')->nullable();
            }
            if (!Schema::hasColumn('visitation_logs', 'visit_time')) {
                $table->time('visit_time')->nullable();
            }
            if (!Schema::hasColumn('visitation_logs', 'purpose')) {
                $table->enum('purpose', [
                    'Family visit',
                    'Legal consultation',
                    'Medical consultation',
                    'Religious visit',
                    'Emergency',
                    'Other'
                ])->nullable();
            }
            if (!Schema::hasColumn('visitation_logs', 'duration_minutes')) {
                $table->integer('duration_minutes')->nullable();
            }
            if (!Schema::hasColumn('visitation_logs', 'officer_in_charge')) {
                $table->string('officer_in_charge')->nullable();
            }
            if (!Schema::hasColumn('visitation_logs', 'notes')) {
                $table->text('notes')->nullable();
            }
            if (!Schema::hasColumn('visitation_logs', 'visitor_name')) {
                $table->string('visitor_name')->nullable();
            }
            if (!Schema::hasColumn('visitation_logs', 'relationship')) {
                $table->string('relationship')->nullable();
            }
            if (!Schema::hasColumn('visitation_logs', 'visitor_id_type')) {
                $table->string('visitor_id_type')->nullable();
            }
            if (!Schema::hasColumn('visitation_logs', 'visitor_id_number')) {
                $table->string('visitor_id_number')->nullable();
            }
            if (!Schema::hasColumn('visitation_logs', 'visitor_contact')) {
                $table->string('visitor_contact')->nullable();
            }
        });

        try { DB::statement('CREATE INDEX visitation_logs_visit_date_index ON visitation_logs(visit_date)'); } catch (\Throwable $e) {}
        try { DB::statement('CREATE INDEX visitation_logs_inmate_id_visit_date_index ON visitation_logs(inmate_id, visit_date)'); } catch (\Throwable $e) {}
        try { DB::statement('ALTER TABLE visitation_logs ADD CONSTRAINT visitation_logs_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL'); } catch (\Throwable $e) {}
        try { DB::statement('ALTER TABLE visitation_logs ADD CONSTRAINT visitation_logs_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL'); } catch (\Throwable $e) {}
    }
};
