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
        Schema::create('inmates', function (Blueprint $table) {
            $table->id();

            // Core identity
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');

            // Demographics
            $table->date('birthdate');
            $table->enum('gender', ['Male', 'Female'])->index();
            $table->enum('civil_status', ['Single', 'Married', 'Separated', 'Widowed', 'Other'])->nullable();

            // Address (normalized parts)
            $table->string('address_line1');
            $table->string('address_line2')->nullable();
            $table->string('city');
            $table->string('province');
            $table->string('postal_code', 20)->nullable();
            $table->string('country')->default('Philippines');

            // Legal & assignment
            $table->string('crime');
            $table->string('sentence');
            $table->date('date_of_admission');
            $table->enum('status', ['Active', 'Released', 'Transferred', 'Medical'])->default('Active')->index();

            // Optional relationships (FK will be added in separate migration after cells table exists)
            $table->foreignId('cell_id')->nullable()->index();
            $table->foreignId('admitted_by_user_id')
                ->nullable()
                ->constrained('users', 'user_id', 'inmates_admitted_by_user_id_foreign')
                ->nullOnDelete()
                ->index();

            // Medical
            $table->enum('medical_status', ['Healthy', 'Under Treatment', 'Critical', 'Not Assessed'])->default('Not Assessed');
            $table->date('last_medical_check')->nullable();
            $table->text('medical_notes')->nullable();

            // Points snapshot (histories belong in separate tables)
            $table->integer('initial_points')->default(0);
            $table->integer('current_points')->default(0)->index();

            // Useful indexes for lookups
            $table->index(['last_name', 'first_name']);
            $table->index('date_of_admission');

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
        Schema::dropIfExists('inmates');
    }
};
