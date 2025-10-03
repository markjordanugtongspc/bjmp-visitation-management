<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Public visitor request form (newly added)
Route::view('/visitation/request/visitor', 'visitation.request.visitor')
    ->name('visitation.request.visitor');

Route::get('/dashboard', [AdminController::class, 'dashboard'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Officers page
Route::get('/officers', [AdminController::class, 'officers'])
    ->middleware(['auth', 'verified'])
    ->name('officers.index');

// Inmates page
Route::get('/inmates', [AdminController::class, 'inmates'])
    ->middleware(['auth', 'verified'])
    ->name('inmates.index');


// Officers: create (auto-register in users)
Route::post('/officers', [AdminController::class, 'storeOfficer'])
    ->middleware(['auth', 'verified'])
    ->name('officers.store');

// Officers: list (for hydration/polling)
Route::get('/officers/list', [AdminController::class, 'listOfficers'])
    ->middleware(['auth', 'verified'])
    ->name('officers.list');

// Officers: update (bind by user_id)
Route::patch('/officers/{user:user_id}', [AdminController::class, 'updateOfficer'])
    ->middleware(['auth', 'verified'])
    ->name('officers.update');

Route::get('/officers/list', [AdminController::class, 'listOfficers'])
    ->middleware(['auth', 'verified'])
    ->name('officers.list');

Route::patch('/officers/{user}', [AdminController::class, 'updateOfficer'])
    ->middleware(['auth', 'verified'])
    ->name('officers.update');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
