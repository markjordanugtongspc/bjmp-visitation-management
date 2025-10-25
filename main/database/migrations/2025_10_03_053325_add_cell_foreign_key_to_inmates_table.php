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
            // Add foreign key constraint to cells table
            $table->foreign('cell_id', 'inmates_cell_id_foreign')
                ->references('id')
                ->on('cells')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inmates', function (Blueprint $table) {
            $table->dropForeign('inmates_cell_id_foreign');
        });
    }
};
