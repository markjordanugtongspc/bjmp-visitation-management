<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('visitors')) {
            return;
        }

        Schema::table('visitors', function (Blueprint $table) {
            if (!Schema::hasColumn('visitors', 'life_status')) {
                // Use ENUM when available; fallback to string if database doesn't support enum
                try {
                    DB::statement("ALTER TABLE visitors ADD COLUMN life_status ENUM('alive','deceased','unknown') NOT NULL DEFAULT 'alive'");
                } catch (\Throwable $e) {
                    $table->string('life_status', 16)->default('alive');
                }
            }

            if (!Schema::hasColumn('visitors', 'is_allowed')) {
                $table->boolean('is_allowed')->default(true);
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('visitors')) {
            return;
        }

        Schema::table('visitors', function (Blueprint $table) {
            if (Schema::hasColumn('visitors', 'life_status')) {
                $table->dropColumn('life_status');
            }
            if (Schema::hasColumn('visitors', 'is_allowed')) {
                $table->dropColumn('is_allowed');
            }
        });
    }
};


