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
        Schema::create('medical_records', function (Blueprint $table) {
            $table->id();

            // Ownership
            $table->foreignId('inmate_id')
                ->constrained('inmates')
                ->cascadeOnDelete()
                ->index();

            // Record core
            $table->date('record_date');
            $table->string('diagnosis')->index();
            $table->text('treatment');
            $table->longText('doctor_notes')->nullable();

            // Structured ancillary data
            $table->json('vitals')->nullable();       // e.g., { blood_pressure, heart_rate, temperature }
            $table->json('allergies')->nullable();
            $table->json('medications')->nullable();

            // Files
            $table->string('attachments_path')->nullable();

            // Audit trail
            $table->foreignId('created_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->index();
            $table->foreignId('updated_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->index();

            // Helpful indexes
            $table->index(['inmate_id', 'record_date']);
            $table->index('record_date');

            // Soft deletes and timestamps
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_records');
    }
};
