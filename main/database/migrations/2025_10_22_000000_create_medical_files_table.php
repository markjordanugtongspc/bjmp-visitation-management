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
        if (Schema::hasTable('medical_files')) {
            return;
        }

        Schema::create('medical_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inmate_id')->constrained('inmates', 'id', 'medical_files_inmate_id_foreign')->onDelete('cascade');
            $table->string('file_name'); // Original filename
            $table->string('file_path'); // Storage path
            $table->string('file_type'); // Extension (pdf, jpg, etc)
            $table->string('category'); // lab_results, medical_certificate, etc
            $table->bigInteger('file_size'); // In bytes
            $table->text('notes')->nullable(); // Short summary
            $table->foreignId('uploaded_by')->constrained('users', 'user_id', 'medical_files_uploaded_by_foreign');
            $table->timestamps();
            
            $table->index(['inmate_id', 'category']);
        });
    }

    /**
     * Reverse the migrations.cls
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_files');
    }
};
