<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update users with old role 3 (Staff) to role 7 (Jail Nurse)
        // You can change this to role 6 (Jail Head Nurse) if needed
        DB::table('users')
            ->where('role_id', 3)
            ->update(['role_id' => 7]);
            
        echo "Updated users with role 3 to role 7 (Jail Nurse)\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert users with role 7 back to role 3
        DB::table('users')
            ->where('role_id', 7)
            ->update(['role_id' => 3]);
            
        echo "Reverted users with role 7 back to role 3\n";
    }
};