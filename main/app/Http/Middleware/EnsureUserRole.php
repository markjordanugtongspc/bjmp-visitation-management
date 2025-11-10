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
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            // For API requests, return JSON error
            $isApiRequest = $request->expectsJson() || 
                           $request->is('api/*') || 
                           $request->ajax() || 
                           $request->wantsJson() ||
                           $request->header('X-Requested-With') === 'XMLHttpRequest' ||
                           $request->header('Accept') === 'application/json';
            
            if ($isApiRequest) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please login to access this page.',
                ], 401);
            }
            
            // Redirect to login with error message
            return redirect()->route('login')
                ->with('error', 'Please login to access this page.')
                ->with('redirect_to', $request->url());
        }

        $user = Auth::user();

        // Parse allowed roles - handle both comma-separated and pipe-separated values
        // Laravel middleware parameters: when using 'ensure.role:0,1,2,8', Laravel may split on comma
        // So we receive either: ['0,1,2,8'] (single param) or ['0', '1', '2', '8'] (multiple params)
        $allowedRoles = [];
        
        // If we have multiple parameters, Laravel already split them (treat each as single role)
        if (count($roles) > 1) {
            foreach ($roles as $roleParam) {
                $allowedRoles[] = (int) trim((string) $roleParam);
            }
        } else {
            // Single parameter - check if it contains separators
            $roleString = (string) ($roles[0] ?? '');
            
            // Try pipe separator first (less likely to be split by Laravel)
            if (strpos($roleString, '|') !== false) {
                $roleArray = array_map(function($r) {
                    return (int) trim($r);
                }, explode('|', $roleString));
                $allowedRoles = array_merge($allowedRoles, $roleArray);
            }
            // Try comma separator
            elseif (strpos($roleString, ',') !== false) {
                $roleArray = array_map(function($r) {
                    return (int) trim($r);
                }, explode(',', $roleString));
                $allowedRoles = array_merge($allowedRoles, $roleArray);
            }
            // No separator - single role
            else {
                $allowedRoles[] = (int) trim($roleString);
            }
        }
        
        // Remove duplicates and re-index
        $allowedRoles = array_values(array_unique($allowedRoles));
        
        // Debug logging (can be removed in production)
        if (empty($allowedRoles)) {
            \Log::warning('EnsureUserRole: No allowed roles parsed', [
                'raw_roles' => $roles,
                'user_role_id' => $user->role_id,
            ]);
        }

        // Get user role as integer for comparison
        $userRoleId = (int) $user->role_id;

        // Check if user's role is in the allowed roles
        if (!in_array($userRoleId, $allowedRoles, true)) {
            // Log for debugging
            \Log::warning('Access denied', [
                'user_id' => $user->id,
                'user_role_id' => $userRoleId,
                'allowed_roles' => $allowedRoles,
                'request_url' => $request->url(),
                'raw_roles_param' => $roles,
            ]);
            
            // For API requests, return JSON error instead of redirect
            // Check for AJAX/JSON requests by headers or route prefix
            $isApiRequest = $request->expectsJson() || 
                           $request->is('api/*') || 
                           $request->ajax() || 
                           $request->wantsJson() ||
                           $request->header('X-Requested-With') === 'XMLHttpRequest' ||
                           $request->header('Accept') === 'application/json';
            
            if ($isApiRequest) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to access this page.',
                    'error' => 'insufficient_permissions',
                ], 403);
            }
            
            // User doesn't have the required role, redirect to their dashboard
            // Set a clear error message that will be displayed via SweetAlert2
            return redirect()->route($this->getDashboardRoute($userRoleId))
                ->with('error', 'Access Denied: You do not have permission to access this page.');
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

