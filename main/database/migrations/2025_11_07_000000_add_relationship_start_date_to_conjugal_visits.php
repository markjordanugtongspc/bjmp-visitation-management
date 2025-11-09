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
        if (!Schema::hasTable('conjugal_visits')) {
            return;
        }

        Schema::table('conjugal_visits', function (Blueprint $table) {
            if (!Schema::hasColumn('conjugal_visits', 'relationship_start_date')) {
                $table->date('relationship_start_date')->nullable()->after('marriage_contract_path');
                $table->index('relationship_start_date', 'conjugal_visits_relationship_start_date_index');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('conjugal_visits')) {
            return;
        }

        Schema::table('conjugal_visits', function (Blueprint $table) {
            if (Schema::hasColumn('conjugal_visits', 'relationship_start_date')) {
                $table->dropIndex('conjugal_visits_relationship_start_date_index');
                $table->dropColumn('relationship_start_date');
            }
        });
    }
};


