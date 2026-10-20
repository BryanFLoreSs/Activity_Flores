<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::connection('pgsql')->hasTable('students')) {
            Schema::connection('pgsql')->create('students', function (Blueprint $table): void {
                $table->id();
                $table->string('student_number', 30)->unique();
                $table->string('first_name', 100);
                $table->string('last_name', 100);
                $table->string('course', 100);
                $table->unsignedSmallInteger('year_level');
                $table->timestampTz('created_at')->useCurrent();
            });
        }
    }

    public function down(): void
    {
        Schema::connection('pgsql')->dropIfExists('students');
    }
};
