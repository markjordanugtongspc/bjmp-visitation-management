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
        Schema::table('inmates', function (Blueprint $table) {
            $table->integer('original_sentence_days')->nullable()->after('sentence');
            $table->integer('reduced_sentence_days')->default(0)->after('original_sentence_days');
            $table->date('expected_release_date')->nullable()->after('reduced_sentence_days');
            $table->date('adjusted_release_date')->nullable()->after('expected_release_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inmates', function (Blueprint $table) {
            $table->dropColumn([
                'original_sentence_days',
                'reduced_sentence_days', 
                'expected_release_date',
                'adjusted_release_date'
            ]);
        });
    }
};