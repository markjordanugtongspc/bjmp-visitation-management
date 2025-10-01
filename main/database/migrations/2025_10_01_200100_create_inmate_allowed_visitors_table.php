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
        Schema::create('inmate_allowed_visitors', function (Blueprint $table) {
            $table->id();

            // Ownership
            $table->foreignId('inmate_id')
                ->constrained('inmates')
                ->cascadeOnDelete()
                ->index();

            // Visitor profile
            $table->string('name');
            $table->string('relationship')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('id_type')->nullable();
            $table->string('id_number')->nullable();
            $table->string('address')->nullable();

            // Avatar storage
            $table->string('avatar_path')->nullable();
            $table->string('avatar_filename')->nullable();
            $table->string('avatar_disk')->nullable()->default('public');

            // Audit trail
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete()->index();
            $table->foreignId('updated_by_user_id')->nullable()->constrained('users')->nullOnDelete()->index();

            // Helpful indexes
            $table->index(['inmate_id', 'name']);

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
        Schema::dropIfExists('inmate_allowed_visitors');
    }
};



