<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NurseController extends Controller
{
    /**
     * Display the nurse dashboard.
     */
    public function dashboard()
    {
        return view('nurse.dashboard');
    }
}
