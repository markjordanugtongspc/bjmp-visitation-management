<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * Handle an incoming request.
     * 
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $role  Required role ID (can be comma-separated for multiple roles)
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            // Redirect to login with error message
            return redirect()->route('login')
                ->with('error', 'Please login to access this page.')
                ->with('redirect_to', $request->url());
        }

        $user = Auth::user();

        // Parse allowed roles (comma-separated string to array)
        $allowedRoles = array_map('intval', explode(',', $role));

        // Check if user's role is in the allowed roles
        if (!in_array($user->role_id, $allowedRoles)) {
            // User doesn't have the required role, redirect to their dashboard
            return redirect()->route($this->getDashboardRoute($user->role_id))
                ->with('error', 'You do not have permission to access this page.');
        }

        return $next($request);
    }

    /**
     * Get the dashboard route for a given role ID.
     * 
     * @param  int  $roleId
     * @return string
     */
    private function getDashboardRoute(int $roleId): string
    {
        // Create a temporary user instance to use the getDashboardRoute method
        $user = new \App\Models\User();
        $user->role_id = $roleId;
        return $user->getDashboardRoute();
    }
}

