<?php

use App\Http\Controllers\InmateController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Inmates API routes
Route::prefix('inmates')->middleware(['web'])->group(function () {
    Route::get('/', [InmateController::class, 'index'])->name('api.inmates.index');
    Route::post('/', [InmateController::class, 'store'])->name('api.inmates.store');
    Route::get('/statistics', [InmateController::class, 'statistics'])->name('api.inmates.statistics');
    Route::get('/search', [InmateController::class, 'search'])->name('api.inmates.search');
    Route::get('/{id}', [InmateController::class, 'show'])->name('api.inmates.show');
    Route::patch('/{id}', [InmateController::class, 'update'])->name('api.inmates.update');
    Route::delete('/{id}', [InmateController::class, 'destroy'])->name('api.inmates.destroy');
    Route::patch('/{id}/points', [InmateController::class, 'updatePoints'])->name('api.inmates.update-points');
});
