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
        if (Schema::hasTable('conjugal_visits')) {
            return;
        }

        Schema::create('conjugal_visits', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('visitor_id');
            $table->unsignedBigInteger('inmate_id');
            $table->string('cohabitation_cert_path', 500)->nullable()->comment('Path to Live-in Cohabitation Certificate');
            $table->string('marriage_contract_path', 500)->nullable()->comment('Path to Marriage Contract');
            $table->unsignedTinyInteger('status')->default(2)->comment('0=Denied, 1=Approved, 2=Pending');
            $table->timestamps();
            
            // Indexes
            $table->index('visitor_id');
            $table->index('inmate_id');
            $table->index('status');
            
            // Foreign key constraints with explicit names to avoid conflicts
            $table->foreign('visitor_id', 'conjugal_visits_visitor_id_foreign')->references('id')->on('visitors')->onDelete('cascade');
            $table->foreign('inmate_id', 'conjugal_visits_inmate_id_foreign')->references('id')->on('inmates')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conjugal_visits');
    }
};
