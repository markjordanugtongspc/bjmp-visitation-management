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
        // This migration is intentionally empty to maintain migration order
        // The job field is added in 2025_10_02_000000_add_job_field_to_inmates_table.php
        // This file exists to preserve migration timestamp ordering
        if (!Schema::hasTable('inmates')) {
            return;
        }
        
        // No-op: job field already added in earlier migration
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op: job field rollback handled in earlier migration
    }
};
