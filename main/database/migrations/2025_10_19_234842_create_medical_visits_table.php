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
        if (Schema::hasTable('medical_visits')) {
            return;
        }

        Schema::create('medical_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inmate_id')->constrained('inmates', 'id', 'medical_visits_inmate_id_foreign')->onDelete('cascade');
            $table->datetime('scheduled_at');
            $table->enum('visit_type', ['one-time', 'recurring']);
            $table->enum('recurring_frequency', ['daily', 'weekly', 'monthly'])->nullable();
            $table->date('recurring_until')->nullable();
            $table->enum('status', ['scheduled', 'completed', 'missed', 'cancelled'])->default('scheduled');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users', 'user_id', 'medical_visits_created_by_foreign')->onDelete('cascade');
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['inmate_id', 'scheduled_at']);
            $table->index(['status', 'scheduled_at']);
            $table->index('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_visits');
    }
};
