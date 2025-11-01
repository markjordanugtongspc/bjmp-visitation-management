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
        // Check if table already exists (in case of manual drop)
        if (Schema::hasTable('warden_messages')) {
            return;
        }
        
        Schema::create('warden_messages', function (Blueprint $table) {
            $table->id();
            
            // Sender and recipient (both are users)
            $table->unsignedBigInteger('sender_id')->index();
            $table->unsignedBigInteger('recipient_id')->index();
            
            // Message content
            $table->text('message');
            
            // Priority level for urgent messages
            $table->enum('priority', ['normal', 'high', 'urgent'])->default('normal');
            
            // Read status
            $table->boolean('is_read')->default(false)->index();
            $table->timestamp('read_at')->nullable();
            
            // Timestamps
            $table->timestamps();
            
            // Composite index for efficient queries
            $table->index(['recipient_id', 'is_read', 'created_at']);
            
            // Foreign keys with custom names to avoid conflicts
            $table->foreign('sender_id', 'warden_messages_sender_id_foreign')
                ->references('user_id')->on('users')
                ->cascadeOnDelete();
                
            $table->foreign('recipient_id', 'warden_messages_recipient_id_foreign')
                ->references('user_id')->on('users')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warden_messages');
    }
};
