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
        Schema::create('supervision_files', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->enum('category', ['Operations', 'Intake', 'Safety', 'Medical', 'Visitation', 'Training', 'Discipline', 'Emergency']);
            $table->text('summary')->nullable();
            $table->string('file_path', 500);
            $table->string('file_name', 255);
            $table->bigInteger('file_size');
            $table->string('file_type', 50);
            $table->unsignedBigInteger('uploaded_by');
            $table->timestamps();
            
            // Indexes
            $table->index('category');
            $table->index('uploaded_by');
            
            // Foreign key constraint
            $table->foreign('uploaded_by')->references('user_id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supervision_files');
    }
};
