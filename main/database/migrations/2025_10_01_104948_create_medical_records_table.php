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
        if (Schema::hasTable('medical_records')) {
            return;
        }

        Schema::create('medical_records', function (Blueprint $table) {
            $table->id();

            // Ownership
            $table->unsignedBigInteger('inmate_id')->index();

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
            $table->unsignedBigInteger('created_by_user_id')->nullable()->index();
            $table->unsignedBigInteger('updated_by_user_id')->nullable()->index();

            // Helpful indexes
            $table->index(['inmate_id', 'record_date']);
            $table->index('record_date');

            // Soft deletes and timestamps
            $table->softDeletes();
            $table->timestamps();

            // Foreign Keys (define separately to allow custom naming/avoid duplicates)
            $table->foreign('inmate_id', 'medical_records_inmate_id_foreign')
                ->references('id')->on('inmates')
                ->onDelete('cascade');
            $table->foreign('created_by_user_id', 'medical_records_created_by_user_id_foreign')
                ->references('user_id')->on('users')
                ->nullOnDelete();
            $table->foreign('updated_by_user_id', 'medical_records_updated_by_user_id_foreign')
                ->references('user_id')->on('users')
                ->nullOnDelete();
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
