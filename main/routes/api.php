<?php

use App\Http\Controllers\InmateController;
use App\Http\Controllers\CellController;
use App\Http\Controllers\SupervisionController;
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
    Route::post('/{id}/points/add', [InmateController::class, 'addPointsEntry'])->name('api.inmates.add-points');
    Route::post('/{id}/medical-records/add', [InmateController::class, 'addMedicalRecord'])->name('api.inmates.add-medical-record');
});

// Cells API routes (order matters: static paths before dynamic /{cell})
Route::prefix('cells')->middleware(['web'])->group(function () {
    Route::get('/', [CellController::class, 'index'])->name('api.cells.index');
    Route::post('/', [CellController::class, 'store'])->name('api.cells.store');

    // Static/specific routes first
    Route::get('/available', [CellController::class, 'getAvailableCells'])->name('api.cells.available');
    Route::post('/batch-update-occupancy', [CellController::class, 'batchUpdateOccupancy'])->name('api.cells.batch-update-occupancy');

    // Dynamic routes after
    Route::get('/{cell}', [CellController::class, 'show'])->name('api.cells.show');
    Route::patch('/{cell}', [CellController::class, 'update'])->name('api.cells.update');
    Route::patch('/{cell}/occupancy', [CellController::class, 'updateOccupancy'])->name('api.cells.update-occupancy');
    Route::delete('/{cell}', [CellController::class, 'destroy'])->name('api.cells.destroy');
});

// Supervision API routes
Route::prefix('supervision')->group(function () {
    Route::get('/', [SupervisionController::class, 'index'])->name('api.supervision.index');
});
