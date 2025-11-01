<?php

use App\Http\Controllers\InmateController;
use App\Http\Controllers\CellController;
use App\Http\Controllers\SupervisionController;
use App\Http\Controllers\VisitorController;
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
    Route::get('/verify-by-id', [InmateController::class, 'verifyByIdNumber'])->name('api.inmates.verify-by-id');
    Route::get('/{id}', [InmateController::class, 'show'])->name('api.inmates.show');
    Route::patch('/{id}', [InmateController::class, 'update'])->name('api.inmates.update');
    Route::delete('/{id}', [InmateController::class, 'destroy'])->name('api.inmates.destroy');
    Route::patch('/{id}/points', [InmateController::class, 'updatePoints'])->name('api.inmates.update-points');
    Route::post('/{id}/points/add', [InmateController::class, 'addPointsEntry'])->name('api.inmates.add-points');
    Route::post('/{id}/medical-records/add', [InmateController::class, 'addMedicalRecord'])->name('api.inmates.add-medical-record');
    
    // Medical files endpoints
    Route::post('/{id}/medical-files/upload', [InmateController::class, 'uploadMedicalFile'])->name('api.inmates.upload-medical-file');
    Route::get('/medical-files/{fileId}', [InmateController::class, 'getMedicalFile'])->name('api.inmates.get-medical-file');
    Route::get('/medical-files/{fileId}/download', [InmateController::class, 'downloadMedicalFile'])->name('api.inmates.download-medical-file');
    Route::patch('/medical-files/{fileId}', [InmateController::class, 'updateMedicalFile'])->name('api.inmates.update-medical-file');
    Route::delete('/medical-files/{fileId}', [InmateController::class, 'deleteMedicalFile'])->name('api.inmates.delete-medical-file');
    
    // Avatar upload endpoint
    Route::post('/upload-avatar', [InmateController::class, 'uploadAvatar'])->name('api.inmates.upload-avatar');
});

// Cells API routes (order matters: static paths before dynamic /{cell})
Route::prefix('cells')->middleware(['web'])->group(function () {
    Route::get('/', [CellController::class, 'index'])->name('api.cells.index');
    Route::post('/', [CellController::class, 'store'])->name('api.cells.store');

    // Static/specific routes first
    Route::get('/available', [CellController::class, 'getAvailableCells'])->name('api.cells.available');
    Route::get('/by-gender', [CellController::class, 'getCellsByGender'])->name('api.cells.by-gender');
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

// Visitors API routes
Route::prefix('visitors')->middleware(['web'])->group(function () {
    Route::get('/', [VisitorController::class, 'index'])->name('api.visitors.index');
    Route::get('/statistics', [VisitorController::class, 'statistics'])->name('api.visitors.statistics');
    Route::post('/', [VisitorController::class, 'store'])->name('api.visitors.store');
    Route::get('/{id}', [VisitorController::class, 'show'])->name('api.visitors.show');
    Route::patch('/{id}', [VisitorController::class, 'update'])->name('api.visitors.update');
    Route::patch('/{id}/status', [VisitorController::class, 'updateStatus'])->name('api.visitors.update-status');
    Route::delete('/{id}', [VisitorController::class, 'destroy'])->name('api.visitors.destroy');
    
    // Time In/Time Out routes (id = visitation_log_id)
    Route::post('/{id}/time-in', [VisitorController::class, 'recordTimeIn'])->name('api.visitors.time-in');
    Route::post('/{id}/time-out', [VisitorController::class, 'recordTimeOut'])->name('api.visitors.time-out');
});

// Visitation Requests (Logs) API routes
Route::prefix('visitation-requests')->middleware(['web'])->group(function () {
    Route::get('/', [VisitorController::class, 'getVisitationRequests'])->name('api.visitation-requests.index');
    Route::patch('/{id}/status', [VisitorController::class, 'updateVisitationLogStatus'])->name('api.visitation-requests.update-status');
});

// Visitation Logs API routes
Route::prefix('visitation-logs')->group(function () {
    Route::post('/', [VisitorController::class, 'createVisitationLog'])->name('api.visitation-logs.store');
});

// Metrics related to visitors/inmates
Route::get('/inmates/without-allowed-visitors/count', [VisitorController::class, 'inmatesWithoutAllowedVisitorsCount'])
    ->middleware(['web'])
    ->name('api.inmates.without-allowed-visitors.count');

// API endpoint to get wardens for recipient selection
Route::get('/users/wardens', function () {
    $wardens = \App\Models\User::where('role_id', 1) // Warden role
        ->where('is_active', true)
        ->select(['user_id', 'full_name', 'email'])
        ->orderBy('full_name')
        ->get();
    
    return response()->json($wardens);
})->middleware(['web', 'auth']);

// Warden Messages API routes (for Assistant Warden communication)
Route::prefix('warden-messages')->middleware(['web'])->group(function () {
    Route::post('/', [\App\Http\Controllers\AssistantWardenController::class, 'sendMessage'])->name('api.warden-messages.send');
    Route::get('/', [\App\Http\Controllers\AssistantWardenController::class, 'getMessages'])->name('api.warden-messages.index');
    Route::patch('/{id}/read', [\App\Http\Controllers\AssistantWardenController::class, 'markAsRead'])->name('api.warden-messages.mark-read');
    Route::patch('/mark-all-read', [\App\Http\Controllers\AssistantWardenController::class, 'markAllAsRead'])->name('api.warden-messages.mark-all-read');
    Route::get('/unread-count', [\App\Http\Controllers\AssistantWardenController::class, 'getUnreadCount'])->name('api.warden-messages.unread-count');
});
