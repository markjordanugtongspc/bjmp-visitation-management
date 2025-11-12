<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Session;
use Illuminate\View\View;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): View
    {
        return view('auth.login');
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Redirect based on user role
        $user = Auth::user();
        
        switch ($user->role_id) {
            case 0: // Admin
                return redirect()->intended(route('admin.dashboard', absolute: false));
            case 1: // Warden
                return redirect()->intended(route('warden.dashboard', absolute: false));
            case 2: // Assistant Warden
                return redirect()->intended(route('assistant-warden.dashboard', absolute: false));
            case 6: // Jail Head Nurse
                return redirect()->intended(route('nurse.dashboard', absolute: false));
            case 7: // Jail Nurse
                return redirect()->intended(route('nurse.dashboard', absolute: false));
            case 8: // Searcher (Jail Gate Searcher)
                return redirect()->intended(route('searcher.dashboard', absolute: false));
            default:
                // Default to admin dashboard for users without specific role
                return redirect()->intended(route('admin.dashboard', absolute: false));
        }
    }

    /**
     * Destroy an authenticated session.
     * 
     * Comprehensive logout that:
     * - Logs out the user from all guards
     * - Invalidates the session
     * - Regenerates CSRF token
     * - Clears all session data
     * - Flushes user-specific cache
     * - Prevents browser back button access
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Get user ID before logout for cache cleanup
        $userId = Auth::id();
        
        // Logout from web guard
        Auth::guard('web')->logout();
        
        // Clear all session data
        Session::flush();
        
        // Invalidate the session
        $request->session()->invalidate();
        
        // Regenerate CSRF token to prevent reuse
        $request->session()->regenerateToken();
        
        // Clear user-specific cache if exists
        if ($userId) {
            Cache::forget("user.{$userId}");
            Cache::forget("user.{$userId}.permissions");
            Cache::forget("user.{$userId}.roles");
        }
        
        // Redirect to login with cache-busting parameter
        return redirect('/login')
            ->with('status', 'You have been successfully logged out.')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
            ->header('Pragma', 'no-cache')
            ->header('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');
    }
}
