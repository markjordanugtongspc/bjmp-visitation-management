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
        if (Schema::hasTable('inmate_allowed_visitors')) {
            return;
        }

        Schema::create('inmate_allowed_visitors', function (Blueprint $table) {
            $table->id();

            // Foreign key to inmates
            $table->unsignedBigInteger('inmate_id')->index();
            
            // Visitor information
            $table->string('name');
            $table->string('contact_number')->nullable();
            $table->string('relationship')->nullable();
            $table->string('id_type')->nullable();
            $table->string('id_number')->nullable();
            $table->text('address')->nullable();
            
            // Avatar
            $table->string('avatar_path')->nullable();
            $table->string('avatar_filename')->nullable();
            $table->string('avatar_disk')->nullable()->default('public');
            
            // Audit trail
            $table->unsignedBigInteger('created_by_user_id')->nullable()->index();
            $table->unsignedBigInteger('updated_by_user_id')->nullable()->index();

            // Indexes
            $table->index(['inmate_id', 'name']);

            // Soft deletes and timestamps
            $table->softDeletes();
            $table->timestamps();

            // Foreign Keys
            $table->foreign('inmate_id', 'inmate_allowed_visitors_inmate_id_foreign')
                ->references('id')->on('inmates')
                ->onDelete('cascade');
            $table->foreign('created_by_user_id', 'inmate_allowed_visitors_created_by_user_id_foreign')
                ->references('user_id')->on('users')
                ->nullOnDelete();
            $table->foreign('updated_by_user_id', 'inmate_allowed_visitors_updated_by_user_id_foreign')
                ->references('user_id')->on('users')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inmate_allowed_visitors');
    }
};
