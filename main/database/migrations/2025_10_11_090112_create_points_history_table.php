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
        if (Schema::hasTable('points_history')) {
            return;
        }

        Schema::create('points_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inmate_id')->constrained('inmates', 'id', 'points_history_inmate_id_foreign')->cascadeOnDelete();
            $table->integer('points_delta'); // positive or negative
            $table->integer('points_before');
            $table->integer('points_after');
            $table->string('activity');
            $table->text('notes')->nullable();
            $table->date('activity_date');
            $table->unsignedBigInteger('created_by_user_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['inmate_id', 'activity_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('points_history');
    }
};