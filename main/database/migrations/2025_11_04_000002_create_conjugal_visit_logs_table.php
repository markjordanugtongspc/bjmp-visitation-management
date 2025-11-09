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
        if (Schema::hasTable('conjugal_visit_logs')) {
            return;
        }

        Schema::create('conjugal_visit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('conjugal_visit_id');
            $table->unsignedBigInteger('visitor_id');
            $table->unsignedBigInteger('inmate_id');
            $table->dateTime('schedule');
            $table->unsignedInteger('duration_minutes')->comment('30, 35, 40, 45, 60, 120 minutes');
            $table->enum('paid', ['YES', 'NO'])->default('NO')->comment('Payment status: YES or NO');
            $table->unsignedTinyInteger('status')->default(2)->comment('0=Denied, 1=Approved, 2=Pending, 3=Completed');
            $table->string('reference_number', 50)->unique();
            $table->timestamps();
            
            // Indexes
            $table->index('conjugal_visit_id');
            $table->index('visitor_id');
            $table->index('inmate_id');
            $table->index('schedule');
            $table->index('status');
            $table->index('paid');
            
            // Foreign key constraints with explicit names to avoid conflicts
            $table->foreign('conjugal_visit_id', 'conjugal_visit_logs_conjugal_visit_id_foreign')->references('id')->on('conjugal_visits')->onDelete('cascade');
            $table->foreign('visitor_id', 'conjugal_visit_logs_visitor_id_foreign')->references('id')->on('visitors')->onDelete('cascade');
            $table->foreign('inmate_id', 'conjugal_visit_logs_inmate_id_foreign')->references('id')->on('inmates')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conjugal_visit_logs');
    }
};
