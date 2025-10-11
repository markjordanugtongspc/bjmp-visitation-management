<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            case 2: // Officer
                return redirect()->intended(route('officer.dashboard', absolute: false));
            case 3: // Staff
                return redirect()->intended(route('staff.dashboard', absolute: false));
            default:
                // Default to admin dashboard for users without specific role
                return redirect()->intended(route('admin.dashboard', absolute: false));
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
