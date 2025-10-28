<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\WardenController;
use App\Http\Controllers\NurseController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SupervisionController;
use App\Http\Controllers\MedicalVisitController;
use App\Http\Controllers\SearcherController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Public visitor request form (newly added)
Route::view('/visitation/request/visitor', 'visitation.request.visitor')
    ->name('visitation.request.visitor');

// Role-based dashboard routes
Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])
    ->middleware(['auth', 'verified'])
    ->name('admin.dashboard');

Route::get('/warden/dashboard', [WardenController::class, 'dashboard'])
    ->middleware(['auth', 'verified'])
    ->name('warden.dashboard');

Route::get('/nurse/dashboard', [NurseController::class, 'dashboard'])
    ->middleware(['auth', 'verified'])
    ->name('nurse.dashboard');

// Legacy dashboard route (redirects based on role)
Route::get('/dashboard', function () {
    $user = auth()->user();
    
    switch ($user->role_id) {
        case 0: // Admin
            return redirect()->route('admin.dashboard');
        case 1: // Warden
            return redirect()->route('warden.dashboard');
        case 2: // Assistant Warden
            return redirect()->route('warden.dashboard');
        case 8: // Searcher (Jail Gate Searcher)
            return redirect()->route('searcher.dashboard');
        case 6: // Jail Head Nurse
            return redirect()->route('nurse.dashboard');
        case 7: // Jail Nurse
            return redirect()->route('nurse.dashboard');
        default:
            return redirect()->route('admin.dashboard');
    }
})->middleware(['auth', 'verified'])->name('dashboard');

// Admin routes
Route::prefix('admin')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/officers', [AdminController::class, 'officers'])->name('admin.officers.index');
    Route::get('/inmates', [AdminController::class, 'inmates'])->name('admin.inmates.index');
    // Female inmates static view
    Route::view('/inmates/female', 'admin.inmates.female.inmates-female')->name('admin.inmates.female');
    Route::post('/officers', [AdminController::class, 'storeOfficer'])->name('admin.officers.store');
    Route::get('/officers/list', [AdminController::class, 'listOfficers'])->name('admin.officers.list');
    Route::patch('/officers/{user:user_id}', [AdminController::class, 'updateOfficer'])->name('admin.officers.update');
});

// Warden routes
Route::prefix('warden')->middleware(['auth', 'verified'])->group(function () {
    // Female inmates static view for Warden
    Route::view('/inmates/female', 'warden.inmates.female.inmates-female')->name('warden.inmates.female');
    Route::get('/officers', [WardenController::class, 'officers'])->name('warden.officers.index');
    Route::get('/inmates', [WardenController::class, 'inmates'])->name('warden.inmates.index');
    Route::post('/officers', [WardenController::class, 'storeOfficer'])->name('warden.officers.store');
    Route::get('/officers/list', [WardenController::class, 'listOfficers'])->name('warden.officers.list');
    Route::patch('/officers/{user:user_id}', [WardenController::class, 'updateOfficer'])->name('warden.officers.update');
    
    // Supervision routes
    Route::view('/supervision', 'warden.supervision.supervision')->name('warden.supervision');
        Route::get('/supervision/files', [SupervisionController::class, 'index'])->name('warden.supervision.index');
        Route::post('/supervision/upload', [SupervisionController::class, 'upload'])->name('warden.supervision.upload');
        Route::get('/supervision/files/{id}', [SupervisionController::class, 'show'])->name('warden.supervision.show');
        Route::get('/supervision/files/{id}/preview', [SupervisionController::class, 'preview'])->name('warden.supervision.preview');
        Route::get('/supervision/files/{id}/download', [SupervisionController::class, 'download'])->name('warden.supervision.download');
        Route::delete('/supervision/files/{id}', [SupervisionController::class, 'destroy'])->name('warden.supervision.destroy');
});

// Searcher routes
Route::get('/searcher/dashboard', [SearcherController::class, 'dashboard'])
    ->middleware(['auth', 'verified'])
    ->name('searcher.dashboard');

Route::prefix('searcher')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/visitors', [SearcherController::class, 'visitors'])
        ->name('searcher.visitors.index');
});

// Legacy routes (for backward compatibility)
Route::get('/officers', [AdminController::class, 'officers'])
    ->middleware(['auth', 'verified'])
    ->name('officers.index');

Route::get('/inmates', [AdminController::class, 'inmates'])
    ->middleware(['auth', 'verified'])
    ->name('inmates.index');

Route::post('/officers', [AdminController::class, 'storeOfficer'])
    ->middleware(['auth', 'verified'])
    ->name('officers.store');

Route::get('/officers/list', [AdminController::class, 'listOfficers'])
    ->middleware(['auth', 'verified'])
    ->name('officers.list');

Route::patch('/officers/{user:user_id}', [AdminController::class, 'updateOfficer'])
    ->middleware(['auth', 'verified'])
    ->name('officers.update');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/upload-picture', [ProfileController::class, 'uploadProfilePicture'])->name('profile.upload-picture');
    Route::get('/profile/user-data', [ProfileController::class, 'getUserData'])->name('profile.user-data');
});

// Medical Visit API Routes
Route::prefix('api')->middleware(['auth', 'verified'])->group(function () {
    // Medical visits for specific inmate
    Route::get('/inmates/{id}/medical-visits', [MedicalVisitController::class, 'index'])
        ->name('api.inmates.medical-visits');
    
    // Medical visit CRUD operations
    Route::apiResource('medical-visits', MedicalVisitController::class);
    
    // Additional medical visit endpoints
    Route::get('/medical-visits/upcoming', [MedicalVisitController::class, 'upcoming'])
        ->name('api.medical-visits.upcoming');
    
    Route::patch('/medical-visits/{id}/complete', [MedicalVisitController::class, 'markCompleted'])
        ->name('api.medical-visits.complete');
    
    Route::get('/medical-visits/statistics', [MedicalVisitController::class, 'statistics'])
        ->name('api.medical-visits.statistics');
});

require __DIR__.'/auth.php';
