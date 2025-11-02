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
        if (Schema::hasTable('visitation_logs')) {
            return;
        }

        Schema::create('visitation_logs', function (Blueprint $table) {
            $table->id();

            // Ownership
            $table->unsignedBigInteger('inmate_id')->index();

            // Visitor info (denormalized snapshot for audit)
            $table->string('visitor_name');
            $table->string('relationship')->nullable();
            $table->string('visitor_id_type')->nullable();
            $table->string('visitor_id_number')->nullable();
            $table->string('visitor_contact')->nullable();

            // Schedule & details
            $table->date('visit_date');
            $table->time('visit_time')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->enum('purpose', [
                'Family visit',
                'Legal consultation',
                'Medical consultation',
                'Religious visit',
                'Emergency',
                'Other'
            ])->nullable();

            $table->enum('status', ['Approved', 'Pending', 'Denied', 'Completed', 'Cancelled'])
                ->default('Pending')
                ->index();

            $table->string('officer_in_charge')->nullable();
            $table->text('notes')->nullable();

            // Audit trail
            $table->unsignedBigInteger('created_by_user_id')->nullable()->index();
            $table->unsignedBigInteger('updated_by_user_id')->nullable()->index();

            // Helpful indexes
            $table->index(['inmate_id', 'visit_date']);
            $table->index('visit_date');

            // Soft deletes and timestamps
            $table->softDeletes();
            $table->timestamps();

            // Foreign Keys
            $table->foreign('inmate_id', 'visitation_logs_inmate_id_foreign')
                ->references('id')->on('inmates')
                ->onDelete('cascade');
            $table->foreign('created_by_user_id', 'visitation_logs_created_by_user_id_foreign')
                ->references('user_id')->on('users')
                ->nullOnDelete();
            $table->foreign('updated_by_user_id', 'visitation_logs_updated_by_user_id_foreign')
                ->references('user_id')->on('users')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visitation_logs');
    }
};
