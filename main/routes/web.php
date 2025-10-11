<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\WardenController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SupervisionController;
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

// Legacy dashboard route (redirects based on role)
Route::get('/dashboard', function () {
    $user = auth()->user();
    
    switch ($user->role_id) {
        case 0: // Admin
            return redirect()->route('admin.dashboard');
        case 1: // Warden
            return redirect()->route('warden.dashboard');
        case 2: // Officer
            return redirect()->route('officer.dashboard');
        case 3: // Staff
            return redirect()->route('staff.dashboard');
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
    // Super Vision static page
    Route::view('/supervision', 'warden.supervision.supervision')->name('warden.supervision');
    // Supervision file upload
    Route::post('/supervision/upload', [SupervisionController::class, 'upload'])->name('warden.supervision.upload');
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
});

require __DIR__.'/auth.php';
