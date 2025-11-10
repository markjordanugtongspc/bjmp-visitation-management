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
        if (!Schema::hasTable('facial_recognition_logs')) {
            Schema::create('facial_recognition_logs', function (Blueprint $table) {
                $table->id();
                
                // Detection Metadata
                $table->integer('detected_age')->nullable()->comment('Estimated age of detected face');
                $table->enum('detected_gender', ['male', 'female', 'unknown'])->default('unknown')->comment('Detected gender');
                $table->integer('landmarks_count')->default(68)->comment('Number of facial landmarks detected');
                
                // Match Information
                $table->unsignedBigInteger('matched_visitor_id')->nullable()->comment('ID of matched visitor from visitors table');
                $table->foreign('matched_visitor_id')
                    ->references('id')->on('visitors')
                    ->nullOnDelete();
                $table->decimal('match_confidence', 5, 4)->nullable()->comment('Confidence score of the match (0-1)');
                $table->decimal('confidence_threshold', 5, 4)->default(0.7000)->comment('Threshold used for matching');
                $table->boolean('is_match_successful')->default(false)->comment('Whether face matching was successful');
                
                // Face Detection Data (JSON for storing face descriptor and other metadata)
                $table->json('face_descriptor')->nullable()->comment('Face descriptor array for matching');
                $table->json('detection_metadata')->nullable()->comment('Additional detection data (expressions, etc.)');
                
                // Session Information
                $table->string('session_id')->nullable()->comment('Session ID for tracking');
                $table->string('device_info')->nullable()->comment('Device information');
                $table->ipAddress('ip_address')->nullable()->comment('IP address of the client');
                
                // Audit Trail
                $table->timestamp('detection_timestamp')->useCurrent()->comment('When the face was detected');
                $table->unsignedBigInteger('processed_by')->nullable()->comment('Officer who processed this');
                $table->foreign('processed_by')
                    ->references('user_id')->on('users')
                    ->nullOnDelete();
                
                $table->timestamps();
                $table->softDeletes();
                
                // Indexes for performance
                $table->index('matched_visitor_id');
                $table->index('is_match_successful');
                $table->index('detection_timestamp');
                $table->index('session_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facial_recognition_logs');
    }
};
