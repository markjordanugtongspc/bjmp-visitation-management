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
        if (Schema::hasTable('cells')) {
            return;
        }

        Schema::create('cells', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Cell Name
            $table->integer('capacity')->default(20); // Total Capacity
            $table->integer('current_count')->default(0); // Total Current Occupancy
            $table->enum('type', ['Male', 'Female'])->default('Male'); // Type Male/Female
            $table->string('location')->nullable(); // Location (e.g., Block A, Block B)
            $table->enum('status', ['Active', 'Inactive', 'Maintenance'])->default('Active'); // Status Active/Inactive/Maintenance
            $table->timestamps();
            
            // Add indexes for better performance
            $table->index(['type', 'status']);
            $table->index('location');
            $table->unique('name'); // Ensure unique cell names
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cells');
    }
};
