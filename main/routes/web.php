<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
// Admin permissions bulk sync
Route::middleware(['auth'])->group(function () {
    Route::post('/admin/permissions/bulk-sync', [\App\Http\Controllers\Admin\PermissionController::class, 'bulkSync'])
        ->name('admin.permissions.bulkSync');
    Route::get('/admin/permissions', [\App\Http\Controllers\Admin\PermissionController::class, 'list'])
        ->name('admin.permissions.list');
});

// Public visitor request form (newly added)
Route::view('/visitation/request/visitor', 'visitation.request.visitor')
    ->name('visitation.request.visitor');

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Admin routes
Route::get('/admin', function () {
    return view('admin.admin');
})->middleware(['auth', 'verified'])->name('admin.index');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
