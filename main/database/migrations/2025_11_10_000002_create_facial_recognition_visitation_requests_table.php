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
        Schema::createIfNotExists('facial_recognition_visitation_requests', function (Blueprint $table) {
            $table->id();

            // Link to facial recognition log
            $table->unsignedBigInteger('facial_recognition_log_id')->comment('Reference to the facial recognition log');
            $table->foreign('facial_recognition_log_id')->references('id')->on('facial_recognition_logs')->onDelete('cascade');

            // Visitor and Inmate Information
            $table->unsignedBigInteger('visitor_id')->comment('Visitor making the request');
            $table->foreign('visitor_id')->references('id')->on('visitors')->onDelete('cascade');
            $table->unsignedBigInteger('inmate_id')->comment('Inmate to be visited');
            $table->foreign('inmate_id')->references('id')->on('inmates')->onDelete('cascade');

            // Visit Schedule
            $table->date('visit_date')->comment('Requested date of visit');
            $table->time('visit_time')->comment('Requested time of visit');
            $table->integer('duration_minutes')->default(30)->comment('Duration of visit in minutes');

            // Status Management
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed', 'cancelled'])
                ->default('pending')
                ->comment('Status of the visitation request');
            $table->text('rejection_reason')->nullable()->comment('Reason for rejection if applicable');
            $table->text('notes')->nullable()->comment('Additional notes');

            // Check-in/Check-out
            $table->timestamp('checked_in_at')->nullable()->comment('Actual check-in time');
            $table->timestamp('checked_out_at')->nullable()->comment('Actual check-out time');

            // Approval/Processing
            $table->unsignedBigInteger('approved_by')->nullable()->comment('Officer who approved the request');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable()->comment('When the request was approved');

            // Automation flag
            $table->boolean('is_auto_generated')->default(true)->comment('Whether this was auto-generated from facial recognition');

            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index('visitor_id');
            $table->index('inmate_id');
            $table->index('visit_date');
            $table->index('status');
            $table->index(['visit_date', 'visit_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facial_recognition_visitation_requests');
    }
};
