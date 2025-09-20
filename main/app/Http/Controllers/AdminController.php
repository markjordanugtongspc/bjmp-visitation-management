<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    /**
     * Display the admin dashboard based on user role.
     */
    public function dashboard()
    {
        $user = Auth::user();
        
        // Check if user has admin role (role_id = 1)
        if ($user->isAdmin()) {
            return view('admin.dashboard');
        }
        
        // For other roles, redirect to appropriate dashboard
        // You can add more role checks here as needed
        return view('admin.dashboard'); // Default to admin dashboard for now
    }
    
    /**
     * Display the inmates management page.
     */
    public function inmates()
    {
        return view('admin.inmates.inmates');
    }
    
    /**
     * Display the officers management page.
     */
    public function officers()
    {
        return view('admin.officers.officers');
    }
}
