<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SearcherController extends Controller
{
    /**
     * Display the searcher dashboard.
     */
    public function dashboard()
    {
        return view('searcher.dashboard');
    }

    /**
     * Display the visitors management page for searcher.
     */
    public function visitors()
    {
        return view('searcher.visitors.visitors');
    }
}
