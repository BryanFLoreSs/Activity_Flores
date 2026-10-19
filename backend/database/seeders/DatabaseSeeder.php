<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('pgsql')->table('students')->upsert([
            [
                'student_number' => 'CLOUD-0001',
                'first_name' => 'Lia',
                'last_name' => 'Garcia',
                'course' => 'BSIT',
                'year_level' => 1,
                'created_at' => now(),
            ],
            [
                'student_number' => 'CLOUD-0002',
                'first_name' => 'Noah',
                'last_name' => 'Cruz',
                'course' => 'BSCS',
                'year_level' => 2,
                'created_at' => now(),
            ],
        ], ['student_number'], ['first_name', 'last_name', 'course', 'year_level']);
    }
}
