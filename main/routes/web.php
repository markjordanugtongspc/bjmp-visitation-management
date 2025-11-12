<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\WardenController;
use App\Http\Controllers\AssistantWardenController;
use App\Http\Controllers\NurseController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SupervisionController;
use App\Http\Controllers\MedicalVisitController;
use App\Http\Controllers\SearcherController;
use App\Http\Controllers\FacialRecognitionController;
use App\Http\Controllers\ReportsController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Public visitor request form (newly added)
Route::view('/visitation/request/visitor', 'visitation.request.visitor')
    ->name('visitation.request.visitor');

// Public Visitor Routes (No authentication required - ID-based validation acts as password)
Route::prefix('visitor')
    ->name('visitor.')
    ->group(function () {
        // Facial Recognition Routes
        Route::prefix('facial-recognition')
            ->name('facial-recognition.')
            ->group(function () {
                Route::get('/registered-faces', [FacialRecognitionController::class, 'getRegisteredFacesPublic'])
                    ->name('registered-faces');
                
                Route::post('/match-face', [FacialRecognitionController::class, 'matchFacePublic'])
                    ->name('match-face');
                
                Route::post('/confirm-match', [FacialRecognitionController::class, 'confirmMatchPublic'])
                    ->name('confirm-match');
                
                Route::post('/create-visitation-request', [FacialRecognitionController::class, 'createVisitationRequestPublic'])
                    ->name('create-visitation-request');
            });
        
        // Manual Visitation Request Routes
        Route::prefix('visitation')
            ->name('visitation.')
            ->group(function () {
                Route::get('/verify-inmate-by-id', [\App\Http\Controllers\InmateController::class, 'verifyByIdNumberPublic'])
                    ->name('verify-inmate-by-id');
                
                Route::get('/availability', [\App\Http\Controllers\VisitorController::class, 'getDateAvailabilityPublic'])
                    ->name('availability');
                
                Route::get('/check-availability', [\App\Http\Controllers\VisitorController::class, 'checkTimeSlotAvailabilityPublic'])
                    ->name('check-availability');
                
                Route::post('/request', [\App\Http\Controllers\VisitorController::class, 'createVisitationLogPublic'])
                    ->name('request');
            });
        
        // Conjugal Visit Routes
        // NOTE: If routes return 404, clear route cache: php artisan route:clear
        Route::prefix('conjugal-visits')
            ->name('conjugal-visits.')
            ->group(function () {
                // Verify inmate by ID (must be first to avoid route conflicts)
                // Full path: /visitor/conjugal-visits/verify-inmate-by-id
                Route::get('/verify-inmate-by-id', [\App\Http\Controllers\InmateController::class, 'verifyByIdNumberPublic'])
                    ->name('verify-inmate-by-id');
                
                // Check eligibility
                Route::get('/check-eligibility', [\App\Http\Controllers\ConjugalVisitController::class, 'checkConjugalVisitEligibilityPublic'])
                    ->name('check-eligibility');
                
                // Register/update conjugal visit registration
                Route::post('/register', [\App\Http\Controllers\ConjugalVisitController::class, 'storeRegistrationPublic'])
                    ->name('register');
                
                // Request conjugal visit
                Route::post('/request-visit', [\App\Http\Controllers\ConjugalVisitController::class, 'storeVisitLogPublic'])
                    ->name('request-visit');
                
                // Get supervision files (guidelines)
                Route::get('/supervision', [\App\Http\Controllers\SupervisionController::class, 'indexPublic'])
                    ->name('supervision');
            });
    });

// Public BJMP overview page
Route::view('/bjmp-overview', 'navigations.bjmp-overview')
    ->name('bjmp.overview');

// Role-based dashboard routes
Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])
    ->middleware(['auth', 'verified', 'ensure.role:0', 'prevent.back'])
    ->name('admin.dashboard');

Route::get('/warden/dashboard', [WardenController::class, 'dashboard'])
    ->middleware(['auth', 'verified', 'ensure.role:1', 'prevent.back'])
    ->name('warden.dashboard');

Route::get('/assistant-warden/dashboard', [AssistantWardenController::class, 'dashboard'])
    ->middleware(['auth', 'verified', 'ensure.role:2', 'prevent.back'])
    ->name('assistant-warden.dashboard');

Route::get('/nurse/dashboard', [NurseController::class, 'dashboard'])
    ->middleware(['auth', 'verified', 'ensure.role:6,7', 'prevent.back'])
    ->name('nurse.dashboard');

// Legacy dashboard route (redirects based on role)
Route::get('/dashboard', function () {
    $user = auth()->user();
    
    if (!$user) {
        return redirect()->route('login')->with('error', 'Please login to access this page.');
    }
    
    // Use User model's helper method to get the correct dashboard route
    return redirect()->route($user->getDashboardRoute());
})->middleware(['auth', 'verified', 'prevent.back'])->name('dashboard');

// Admin routes - Only accessible by Admin (role_id: 0)
Route::prefix('admin')->middleware(['auth', 'verified', 'ensure.role:0', 'prevent.back'])->group(function () {
    Route::get('/officers', [AdminController::class, 'officers'])->name('admin.officers.index');
    Route::get('/inmates', [AdminController::class, 'inmates'])->name('admin.inmates.index');
    // Female inmates static view
    Route::view('/inmates/female', 'admin.inmates.female.inmates-female')->name('admin.inmates.female');
    Route::post('/officers', [AdminController::class, 'storeOfficer'])->name('admin.officers.store');
    Route::get('/officers/list', [AdminController::class, 'listOfficers'])->name('admin.officers.list');
    Route::patch('/officers/{user:user_id}', [AdminController::class, 'updateOfficer'])->name('admin.officers.update');
    Route::post('/officers/{user:user_id}/upload-avatar', [AdminController::class, 'uploadOfficerAvatar'])->name('admin.officers.upload-avatar');
    
    // Visitor routes
    Route::get('/visitors', [AdminController::class, 'visitors'])->name('admin.visitors.index');
    
    // Reports routes
    Route::get('/reports', [ReportsController::class, 'index'])->name('admin.reports.index');
    Route::post('/reports/export', [ReportsController::class, 'export'])->name('admin.reports.export');
});

// Assistant Warden routes - Only accessible by Assistant Warden (role_id: 2)
Route::prefix('assistant-warden')->middleware(['auth', 'verified', 'ensure.role:2', 'prevent.back'])->group(function () {
    // Female inmates static view for Assistant Warden
    Route::view('/inmates/female', 'assistant_warden.inmates.female.inmates-female')->name('assistant-warden.inmates.female');
    Route::get('/inmates', [AssistantWardenController::class, 'inmates'])->name('assistant-warden.inmates.index');
    Route::get('/officers', [AssistantWardenController::class, 'officers'])->name('assistant-warden.officers.index');
    Route::post('/officers', [AssistantWardenController::class, 'storeOfficer'])->name('assistant-warden.officers.store');
    Route::get('/officers/list', [AssistantWardenController::class, 'listOfficers'])->name('assistant-warden.officers.list');
    Route::patch('/officers/{user:user_id}', [AssistantWardenController::class, 'updateOfficer'])->name('assistant-warden.officers.update');
    Route::post('/officers/{user:user_id}/upload-avatar', [AssistantWardenController::class, 'uploadOfficerAvatar'])->name('assistant-warden.officers.upload-avatar');
    
    // Visitor routes
    Route::get('/visitors', [AssistantWardenController::class, 'visitors'])->name('assistant-warden.visitors.index');
    Route::get('/visitors/requests', [AssistantWardenController::class, 'requests'])->name('assistant-warden.visitors.requests');
    
    // Supervision routes (shared with warden)
    Route::view('/supervision', 'assistant_warden.supervision.supervision')->name('assistant-warden.supervision');
        Route::get('/supervision/files', [SupervisionController::class, 'index'])->name('assistant-warden.supervision.index');
        Route::post('/supervision/upload', [SupervisionController::class, 'upload'])->name('assistant-warden.supervision.upload');
        Route::get('/supervision/files/{id}', [SupervisionController::class, 'show'])->name('assistant-warden.supervision.show');
        Route::get('/supervision/files/{id}/preview', [SupervisionController::class, 'preview'])->name('assistant-warden.supervision.preview');
        Route::get('/supervision/files/{id}/download', [SupervisionController::class, 'download'])->name('assistant-warden.supervision.download');
        Route::delete('/supervision/files/{id}', [SupervisionController::class, 'destroy'])->name('assistant-warden.supervision.destroy');
    
    // Reports routes
    Route::get('/reports', [ReportsController::class, 'index'])->name('assistant-warden.reports.index');
    Route::post('/reports/export', [ReportsController::class, 'export'])->name('assistant-warden.reports.export');
});

// Warden routes - Only accessible by Warden (role_id: 1)
Route::prefix('warden')->middleware(['auth', 'verified', 'ensure.role:1', 'prevent.back'])->group(function () {
    // Female inmates static view for Warden
    Route::view('/inmates/female', 'warden.inmates.female.inmates-female')->name('warden.inmates.female');
    Route::get('/officers', [WardenController::class, 'officers'])->name('warden.officers.index');
    Route::get('/inmates', [WardenController::class, 'inmates'])->name('warden.inmates.index');
    Route::post('/officers', [WardenController::class, 'storeOfficer'])->name('warden.officers.store');
    Route::get('/officers/list', [WardenController::class, 'listOfficers'])->name('warden.officers.list');
    Route::patch('/officers/{user:user_id}', [WardenController::class, 'updateOfficer'])->name('warden.officers.update');
    Route::post('/officers/{user:user_id}/upload-avatar', [WardenController::class, 'uploadOfficerAvatar'])->name('warden.officers.upload-avatar');
    
    // Visitor routes
    Route::get('/visitors', [WardenController::class, 'visitors'])->name('warden.visitors.index');
    Route::get('/visitors/requests', [WardenController::class, 'requests'])->name('warden.visitors.requests');
    
    // Supervision routes
    Route::view('/supervision', 'warden.supervision.supervision')->name('warden.supervision');
        Route::get('/supervision/files', [SupervisionController::class, 'index'])->name('warden.supervision.index');
        Route::post('/supervision/upload', [SupervisionController::class, 'upload'])->name('warden.supervision.upload');
        Route::get('/supervision/files/{id}', [SupervisionController::class, 'show'])->name('warden.supervision.show');
        Route::get('/supervision/files/{id}/preview', [SupervisionController::class, 'preview'])->name('warden.supervision.preview');
        Route::get('/supervision/files/{id}/download', [SupervisionController::class, 'download'])->name('warden.supervision.download');
        Route::delete('/supervision/files/{id}', [SupervisionController::class, 'destroy'])->name('warden.supervision.destroy');
    
    // Reports routes
    Route::get('/reports', [ReportsController::class, 'index'])->name('warden.reports.index');
    Route::post('/reports/export', [ReportsController::class, 'export'])->name('warden.reports.export');
});

// Searcher routes - Only accessible by Searcher (role_id: 8)
Route::get('/searcher/dashboard', [SearcherController::class, 'dashboard'])
    ->middleware(['auth', 'verified', 'ensure.role:8', 'prevent.back'])
    ->name('searcher.dashboard');

Route::prefix('searcher')->middleware(['auth', 'verified', 'ensure.role:8', 'prevent.back'])->group(function () {
    Route::get('/visitors', [SearcherController::class, 'visitors'])
        ->name('searcher.visitors.index');
    Route::get('/visitors/requests', [SearcherController::class, 'requests'])
        ->name('searcher.visitors.requests');
    
    // Reports routes
    Route::get('/reports', [ReportsController::class, 'index'])->name('searcher.reports.index');
    Route::post('/reports/export', [ReportsController::class, 'export'])->name('searcher.reports.export');
});

// Legacy routes (for backward compatibility) - Redirect based on role
Route::get('/officers', function () {
    $user = auth()->user();
    if (!$user) {
        return redirect()->route('login')->with('error', 'Please login to access this page.');
    }
    
    return match($user->role_id) {
        0 => redirect()->route('admin.officers.index'),
        1 => redirect()->route('warden.officers.index'),
        2 => redirect()->route('assistant-warden.officers.index'),
        default => redirect()->route($user->getDashboardRoute())
            ->with('error', 'You do not have permission to access this page.'),
    };
})->middleware(['auth', 'verified', 'prevent.back'])->name('officers.index');

Route::get('/inmates', function () {
    $user = auth()->user();
    if (!$user) {
        return redirect()->route('login')->with('error', 'Please login to access this page.');
    }
    
    return match($user->role_id) {
        0 => redirect()->route('admin.inmates.index'),
        1 => redirect()->route('warden.inmates.index'),
        2 => redirect()->route('assistant-warden.inmates.index'),
        default => redirect()->route($user->getDashboardRoute())
            ->with('error', 'You do not have permission to access this page.'),
    };
})->middleware(['auth', 'verified', 'prevent.back'])->name('inmates.index');

Route::post('/officers', function () {
    $user = auth()->user();
    if (!$user) {
        return redirect()->route('login')->with('error', 'Please login to access this page.');
    }
    
    return match($user->role_id) {
        0 => app(AdminController::class)->storeOfficer(request()),
        1 => app(WardenController::class)->storeOfficer(request()),
        2 => app(AssistantWardenController::class)->storeOfficer(request()),
        default => redirect()->route($user->getDashboardRoute())
            ->with('error', 'You do not have permission to access this page.'),
    };
})->middleware(['auth', 'verified', 'prevent.back'])->name('officers.store');

Route::get('/officers/list', function () {
    $user = auth()->user();
    if (!$user) {
        return redirect()->route('login')->with('error', 'Please login to access this page.');
    }
    
    return match($user->role_id) {
        0 => app(AdminController::class)->listOfficers(request()),
        1 => app(WardenController::class)->listOfficers(request()),
        2 => app(AssistantWardenController::class)->listOfficers(request()),
        default => redirect()->route($user->getDashboardRoute())
            ->with('error', 'You do not have permission to access this page.'),
    };
})->middleware(['auth', 'verified', 'prevent.back'])->name('officers.list');

Route::patch('/officers/{user:user_id}', function ($user) {
    $authUser = auth()->user();
    if (!$authUser) {
        return redirect()->route('login')->with('error', 'Please login to access this page.');
    }
    
    return match($authUser->role_id) {
        0 => app(AdminController::class)->updateOfficer(request(), $user),
        1 => app(WardenController::class)->updateOfficer(request(), $user),
        2 => app(AssistantWardenController::class)->updateOfficer(request(), $user),
        default => redirect()->route($authUser->getDashboardRoute())
            ->with('error', 'You do not have permission to access this page.'),
    };
})->middleware(['auth', 'verified', 'prevent.back'])->name('officers.update');


Route::middleware(['auth', 'prevent.back'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/upload-picture', [ProfileController::class, 'uploadProfilePicture'])->name('profile.upload-picture');
    Route::get('/profile/user-data', [ProfileController::class, 'getUserData'])->name('profile.user-data');
    
    // Facial Recognition - Accessible by Admin (0), Warden (1), Assistant Warden (2), and Searcher (8)
    // Apply middleware to the entire group for cleaner code and consistent access control
    Route::prefix('facial-recognition')
        ->middleware('ensure.role:0|1|2|8')
        ->name('facial-recognition.')
        ->group(function () {
            // Main facial recognition page - must be last to avoid route conflicts
            Route::get('/', [FacialRecognitionController::class, 'index'])
                ->name('index');
            
            // API Routes
            Route::get('/registered-faces', [FacialRecognitionController::class, 'getRegisteredFaces'])
                ->name('registered-faces');
            
            Route::post('/match-face', [FacialRecognitionController::class, 'matchFace'])
                ->name('match-face');
            
            Route::post('/confirm-match', [FacialRecognitionController::class, 'confirmMatch'])
                ->name('confirm-match');
            
            Route::post('/create-visitation-request', [FacialRecognitionController::class, 'createVisitationRequest'])
                ->name('create-visitation-request');
            
            Route::get('/logs', [FacialRecognitionController::class, 'getRecentLogs'])
                ->name('logs');
            
            Route::get('/visitation-requests', [FacialRecognitionController::class, 'getVisitationRequests'])
                ->name('visitation-requests');
            
            Route::get('/visitation-requests/pending', [FacialRecognitionController::class, 'getPendingVisitationRequests'])
                ->name('visitation-requests.pending');
            
            Route::post('/visitation-requests/{id}/approve', [FacialRecognitionController::class, 'approveVisitationRequest'])
                ->name('visitation-requests.approve');
            
            Route::post('/visitation-requests/{id}/decline', [FacialRecognitionController::class, 'declineVisitationRequest'])
                ->name('visitation-requests.decline');
        });
});

// Medical Visit API Routes
Route::prefix('api')->middleware(['auth', 'verified', 'prevent.back'])->group(function () {
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
