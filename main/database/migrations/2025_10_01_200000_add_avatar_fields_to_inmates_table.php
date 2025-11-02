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
            if (!Schema::hasColumn('inmates', 'avatar_path')) {
                $table->string('avatar_path')->nullable()->after('current_points');
            }
            if (!Schema::hasColumn('inmates', 'avatar_filename')) {
                $table->string('avatar_filename')->nullable()->after('avatar_path');
            }
            if (!Schema::hasColumn('inmates', 'avatar_disk')) {
                $table->string('avatar_disk')->default('public')->nullable()->after('avatar_filename');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inmates', function (Blueprint $table) {
            $table->dropColumn(['avatar_path', 'avatar_filename', 'avatar_disk']);
        });
    }
};


