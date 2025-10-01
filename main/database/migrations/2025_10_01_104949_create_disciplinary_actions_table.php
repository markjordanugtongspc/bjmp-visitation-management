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
        Schema::create('disciplinary_actions', function (Blueprint $table) {
            $table->id();

            // Ownership
            $table->foreignId('inmate_id')
                ->constrained('inmates')
                ->cascadeOnDelete()
                ->index();

            // Action core
            $table->date('action_date');
            $table->enum('category', [
                'Rule violation',
                'Fighting',
                'Disobedience',
                'Contraband',
                'Escape attempt',
                'Other'
            ])->index();
            $table->text('description');
            $table->enum('severity', ['Low', 'Medium', 'High', 'Critical'])->default('Low')->index();
            $table->integer('points_delta')->default(0); // negative to deduct, positive to reward if any
            $table->string('sanction')->nullable(); // e.g., isolation, privileges revoked
            $table->longText('notes')->nullable();
            $table->string('attachments_path')->nullable();

            // Staff
            $table->foreignId('sanctioned_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->index();
            $table->foreignId('created_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->index();
            $table->foreignId('updated_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->index();

            // Helpful indexes
            $table->index(['inmate_id', 'action_date']);

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
        Schema::dropIfExists('disciplinary_actions');
    }
};
