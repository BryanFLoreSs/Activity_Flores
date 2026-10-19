<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'source' => ['required', Rule::in(['cloud', 'physical'])],
        ]);

        $connection = $validated['source'] === 'cloud' ? 'pgsql' : 'local_mysql';
        $students = DB::connection($connection)
            ->table('students')
            ->orderBy('id')
            ->get();

        return response()->json([
            'source' => $validated['source'],
            'count' => $students->count(),
            'data' => $students,
        ]);
    }

    public function physical(): JsonResponse
    {
        $students = DB::connection('local_mysql')
            ->table('students')
            ->orderBy('id')
            ->get();

        return response()->json([
            'source' => 'physical_mysql',
            'count' => $students->count(),
            'data' => $students,
        ]);
    }
}
