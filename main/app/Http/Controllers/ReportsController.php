<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Visitor;
use App\Models\Inmate;
use App\Models\FacialRecognitionVisitationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class ReportsController extends Controller
{
    /**
     * Display the reports dashboard.
     */
    public function index(Request $request)
    {
        // Get current user role
        $user = auth()->user();
        $userRole = $user->role_id;
        
        // Get date range from request (default to last 30 days)
        $dateFrom = $request->input('date_from', Carbon::now()->subDays(30)->format('Y-m-d'));
        $dateTo = $request->input('date_to', Carbon::now()->format('Y-m-d'));
        
        // Get report type filter
        $reportType = $request->input('report_type', 'all');
        
        // Prepare data based on user role
        $data = $this->getReportsData($userRole, $dateFrom, $dateTo, $reportType);
        
        // Extract statistics for the view (blade template expects $statistics directly)
        $statistics = $data['statistics'] ?? [
            'totalVisitors' => 0,
            'totalInmates' => 0,
            'pendingRequests' => 0,
            'approvedToday' => 0,
        ];
        
        // Return appropriate view based on role
        $view = $this->getViewForRole($userRole);
        
        return view($view, array_merge($data, [
            'user' => $user,
            'userRole' => $userRole,
            'dateFrom' => $dateFrom,
            'dateTo' => $dateTo,
            'reportType' => $reportType,
            'statistics' => $statistics, // Add statistics at the top level for blade template
        ]));
    }
    
    /**
     * Get reports data based on user role
     */
    private function getReportsData($userRole, $dateFrom, $dateTo, $reportType)
    {
        $data = [];
        
        // Common data for all roles
        $data['statistics'] = $this->getStatistics($dateFrom, $dateTo);
        $data['visitorTrends'] = $this->getVisitorTrends($dateFrom, $dateTo);
        $data['requestStatus'] = $this->getRequestStatusData($dateFrom, $dateTo);
        
        // Role-specific data
        switch ($userRole) {
            case 0: // Admin
                $data['inmateStats'] = $this->getInmateStatistics($dateFrom, $dateTo);
                $data['officerStats'] = $this->getOfficerStatistics($dateFrom, $dateTo);
                $data['facilityOverview'] = $this->getFacilityOverview($dateFrom, $dateTo);
                break;
                
            case 1: // Warden
                $data['inmateStats'] = $this->getInmateStatistics($dateFrom, $dateTo);
                $data['facilityOverview'] = $this->getFacilityOverview($dateFrom, $dateTo);
                $data['supervisionReports'] = $this->getSupervisionReports($dateFrom, $dateTo);
                break;
                
            case 2: // Assistant Warden
                $data['inmateStats'] = $this->getInmateStatistics($dateFrom, $dateTo);
                $data['supervisionReports'] = $this->getSupervisionReports($dateFrom, $dateTo);
                break;
                
            case 8: // Searcher
                $data['searchReports'] = $this->getSearchReports($dateFrom, $dateTo);
                break;
        }
        
        return $data;
    }
    
    /**
     * Get general statistics
     */
    private function getStatistics($dateFrom, $dateTo)
    {
        try {
            $startDate = Carbon::parse($dateFrom)->startOfDay();
            $endDate = Carbon::parse($dateTo)->endOfDay();
            $today = Carbon::today();
            
            // Get statistics with proper error handling
            // Note: SoftDeletes trait automatically excludes soft-deleted records
            $totalVisitors = Visitor::whereBetween('created_at', [$startDate, $endDate])->count();
            $totalInmates = Inmate::count(); // Total inmates (not filtered by date, but excludes soft-deleted)
            $pendingRequests = FacialRecognitionVisitationRequest::where('status', 'pending')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();
            $approvedToday = FacialRecognitionVisitationRequest::where('status', 'approved')
                ->whereDate('created_at', $today)
                ->count();
            
            // Log statistics for debugging (remove in production if not needed)
            \Log::debug('Reports statistics calculated', [
                'totalVisitors' => $totalVisitors,
                'totalInmates' => $totalInmates,
                'pendingRequests' => $pendingRequests,
                'approvedToday' => $approvedToday,
                'dateFrom' => $startDate->format('Y-m-d H:i:s'),
                'dateTo' => $endDate->format('Y-m-d H:i:s'),
            ]);
            
            return [
                'totalVisitors' => (int)$totalVisitors,
                'totalInmates' => (int)$totalInmates,
                'pendingRequests' => (int)$pendingRequests,
                'approvedToday' => (int)$approvedToday,
            ];
        } catch (\Exception $e) {
            \Log::error('Error getting statistics: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'dateFrom' => $dateFrom,
                'dateTo' => $dateTo
            ]);
            // Return zeros only if there's an actual error
            return [
                'totalVisitors' => 0,
                'totalInmates' => 0,
                'pendingRequests' => 0,
                'approvedToday' => 0,
            ];
        }
    }
    
    /**
     * Get visitor trends data (Chart.js format)
     * Matches dashboard's monthly visits pattern
     * Combines data from visitation_logs and facial_recognition_visitation_requests
     */
    private function getVisitorTrends($dateFrom, $dateTo)
    {
        try {
            $currentYear = Carbon::now()->year;
            $monthCounts = array_fill(1, 12, 0);

            // Get monthly visits from visitation_logs
            if (Schema::hasTable('visitation_logs')) {
                $visits = DB::table('visitation_logs')
                    ->select(
                        DB::raw('MONTH(created_at) as month'),
                        DB::raw('COUNT(*) as count')
                    )
                    ->whereYear('created_at', $currentYear)
                    ->groupBy(DB::raw('MONTH(created_at)'))
                    ->get();

                foreach ($visits as $visit) {
                    $monthCounts[$visit->month] += $visit->count;
                }
            }

            // Get monthly visits from facial_recognition_visitation_requests
            if (Schema::hasTable('facial_recognition_visitation_requests')) {
                $frVisits = DB::table('facial_recognition_visitation_requests')
                    ->select(
                        DB::raw('MONTH(created_at) as month'),
                        DB::raw('COUNT(*) as count')
                    )
                    ->whereYear('created_at', $currentYear)
                    ->groupBy(DB::raw('MONTH(created_at)'))
                    ->get();

                foreach ($frVisits as $visit) {
                    $monthCounts[$visit->month] += $visit->count;
                }
            }

            // Get approved visits separately for second dataset
            $approvedCounts = array_fill(1, 12, 0);
            
            if (Schema::hasTable('visitation_logs')) {
                $approvedVisits = DB::table('visitation_logs')
                    ->select(
                        DB::raw('MONTH(created_at) as month'),
                        DB::raw('COUNT(*) as count')
                    )
                    ->whereYear('created_at', $currentYear)
                    ->whereIn('status', ['Approved', 'Completed'])
                    ->groupBy(DB::raw('MONTH(created_at)'))
                    ->get();

                foreach ($approvedVisits as $visit) {
                    $approvedCounts[$visit->month] += $visit->count;
                }
            }
            
            if (Schema::hasTable('facial_recognition_visitation_requests')) {
                $approvedFrVisits = DB::table('facial_recognition_visitation_requests')
                    ->select(
                        DB::raw('MONTH(created_at) as month'),
                        DB::raw('COUNT(*) as count')
                    )
                    ->whereYear('created_at', $currentYear)
                    ->where('status', 'approved')
                    ->groupBy(DB::raw('MONTH(created_at)'))
                    ->get();

                foreach ($approvedFrVisits as $visit) {
                    $approvedCounts[$visit->month] += $visit->count;
                }
            }

            // Create array with all 12 months
            $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            $labels = [];
            $totalVisitorsData = [];
            $approvedVisitsData = [];
            
            for ($i = 1; $i <= 12; $i++) {
                $labels[] = $monthNames[$i - 1];
                $totalVisitorsData[] = $monthCounts[$i];
                $approvedVisitsData[] = $approvedCounts[$i];
            }
            
            return [
                'labels' => $labels,
                'datasets' => [
                    [
                        'label' => 'Total Visitors',
                        'data' => $totalVisitorsData,
                    ],
                    [
                        'label' => 'Approved Visits',
                        'data' => $approvedVisitsData,
                    ]
                ]
            ];
        } catch (\Exception $e) {
            \Log::error('Error getting visitor trends: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Get request status data (Chart.js Doughnut format)
     * Data from facial_recognition_visitation_requests table
     */
    private function getRequestStatusData($dateFrom, $dateTo)
    {
        try {
            $startDate = Carbon::parse($dateFrom)->startOfDay();
            $endDate = Carbon::parse($dateTo)->endOfDay();
            
            $approved = FacialRecognitionVisitationRequest::where('status', 'approved')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();
            
            $pending = FacialRecognitionVisitationRequest::where('status', 'pending')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();
            
            $rejected = FacialRecognitionVisitationRequest::whereIn('status', ['declined', 'rejected'])
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();
            
            $cancelled = FacialRecognitionVisitationRequest::where('status', 'cancelled')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();
            
            // Return Chart.js doughnut format
            return [
                'labels' => ['Approved', 'Pending', 'Rejected', 'Cancelled'],
                'datasets' => [[
                    'data' => [$approved, $pending, $rejected, $cancelled]
                ]]
            ];
        } catch (\Exception $e) {
            \Log::error('Error getting request status data: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Get inmate statistics (Admin/Warden/Assistant Warden only)
     * Returns Chart.js Bar format - Male and Female only
     */
    private function getInmateStatistics($dateFrom, $dateTo)
    {
        try {
            $male = Inmate::where('gender', 'Male')->count();
            $female = Inmate::where('gender', 'Female')->count();
            
            // Return Chart.js bar format (Male and Female only)
            return [
                'labels' => ['Male', 'Female'],
                'datasets' => [[
                    'label' => 'Current Population',
                    'data' => [$male, $female]
                ]]
            ];
        } catch (\Exception $e) {
            \Log::error('Error getting inmate statistics: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Get officer statistics (Admin only)
     */
    private function getOfficerStatistics($dateFrom, $dateTo)
    {
        return [
            'total' => User::whereIn('role_id', [1, 2, 6, 7])->count(),
            'wardens' => User::where('role_id', 1)->count(),
            'assistantWardens' => User::where('role_id', 2)->count(),
            'nurses' => User::whereIn('role_id', [6, 7])->count(),
        ];
    }
    
    /**
     * Get facility overview (Admin/Warden only)
     */
    private function getFacilityOverview($dateFrom, $dateTo)
    {
        return [
            'capacity' => 500, // This should come from settings
            'occupied' => Inmate::count(),
            'available' => 500 - Inmate::count(),
            'occupancyRate' => round((Inmate::count() / 500) * 100, 2),
        ];
    }
    
    /**
     * Get supervision reports (Warden/Assistant Warden only)
     */
    private function getSupervisionReports($dateFrom, $dateTo)
    {
        return [
            'totalFiles' => DB::table('supervision_files')
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->count(),
            'recentUploads' => DB::table('supervision_files')
                ->select('file_name as filename', 'created_at')
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($file) {
                    $file->created_at = \Carbon\Carbon::parse($file->created_at);
                    return $file;
                }),
        ];
    }
    
    /**
     * Get search reports (Searcher only)
     */
    private function getSearchReports($dateFrom, $dateTo)
    {
        // Check if search_logs table exists
        if (!Schema::hasTable('search_logs')) {
            return [
                'totalSearches' => 0,
                'popularSearches' => collect([]),
            ];
        }

        return [
            'totalSearches' => DB::table('search_logs')
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->count(),
            'popularSearches' => DB::table('search_logs')
                ->select('search_term', DB::raw('count(*) as count'))
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->groupBy('search_term')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get(),
        ];
    }
    
    /**
     * Get view name based on user role
     */
    private function getViewForRole($userRole)
    {
        return match ($userRole) {
            0 => 'admin.reports.reports',
            1 => 'warden.reports.reports',
            2 => 'assistant_warden.reports.reports',
            8 => 'searcher.reports.reports',
            default => 'errors.403',
        };
    }
    
    /**
     * API endpoint for reports data (for JavaScript)
     */
    public function apiIndex(Request $request)
    {
        try {
            $user = auth()->user();
            $userRole = $user->role_id;
            
            // Get date range from request (default to last 30 days)
            $dateFrom = $request->input('date_from', Carbon::now()->subDays(30)->format('Y-m-d'));
            $dateTo = $request->input('date_to', Carbon::now()->format('Y-m-d'));
            $reportType = $request->input('reportType', 'all');
            
            // Get reports data
            $data = $this->getReportsData($userRole, $dateFrom, $dateTo, $reportType);
            
            return response()->json([
                'success' => true,
                'data' => $data,
                'dateFrom' => $dateFrom,
                'dateTo' => $dateTo,
                'reportType' => $reportType,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching reports data: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Export reports data (API endpoint for JavaScript)
     */
    public function export(Request $request)
    {
        try {
            $format = $request->input('format', 'pdf');
            $reportType = $request->input('report_type', 'general');
            $dateFrom = $request->input('date_from', Carbon::now()->subDays(30)->format('Y-m-d'));
            $dateTo = $request->input('date_to', Carbon::now()->format('Y-m-d'));
            
            // Get data
            $userRole = auth()->user()->role_id;
            $data = $this->getReportsData($userRole, $dateFrom, $dateTo, $reportType);
            
            // Add comprehensive data for export
            $data['exportData'] = $this->getComprehensiveExportData($userRole, $dateFrom, $dateTo, $reportType);
            $data['dateFrom'] = $dateFrom;
            $data['dateTo'] = $dateTo;
            $data['reportType'] = $reportType;
            $data['user'] = auth()->user();
            $data['generatedAt'] = Carbon::now()->format('F d, Y h:i A');
            
            // Generate export based on format
            switch ($format) {
                case 'pdf':
                    return $this->exportToPDF($data, $reportType, $dateFrom, $dateTo);
                case 'excel':
                case 'xlsx':
                    return $this->exportToExcel($data, $reportType);
                case 'csv':
                    return $this->exportToCSV($data, $reportType);
                default:
                    return response()->json(['error' => 'Unsupported format'], 400);
            }
        } catch (\Exception $e) {
            \Log::error('Export error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error generating export: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get comprehensive data for export
     */
    private function getComprehensiveExportData($userRole, $dateFrom, $dateTo, $reportType)
    {
        $exportData = [];
        
        try {
            $startDate = Carbon::parse($dateFrom)->startOfDay();
            $endDate = Carbon::parse($dateTo)->endOfDay();
            
            // Get all inmates
            if (in_array($userRole, [0, 1, 2])) {
                $exportData['inmates'] = Inmate::with('cell')
                    ->get()
                    ->map(function($inmate) {
                        try {
                            return [
                                'id' => $inmate->id,
                                'name' => $inmate->full_name ?? 'N/A',
                                'gender' => $inmate->gender ?? 'N/A',
                                'age' => $inmate->age ?? 'N/A',
                                'cell' => ($inmate->cell && $inmate->cell->name) ? $inmate->cell->name : 'Unassigned',
                                'registered_date' => $inmate->created_at ? $inmate->created_at->format('M d, Y') : 'N/A',
                                'status' => $inmate->status ?? 'N/A',
                                'crime' => $inmate->crime ?? 'N/A',
                                'sentence' => $inmate->sentence ?? 'N/A',
                            ];
                        } catch (\Exception $e) {
                            \Log::error('Error mapping inmate: ' . $e->getMessage());
                            return null;
                        }
                    })
                    ->filter(); // Remove null entries
            }
            
            // Get all visitors
            $exportData['visitors'] = Visitor::whereBetween('created_at', [$startDate, $endDate])
                ->get()
                ->map(function($visitor) {
                    try {
                        return [
                            'id' => $visitor->id,
                            'name' => $visitor->name ?? 'N/A',
                            'phone' => $visitor->phone ?? 'N/A',
                            'email' => $visitor->email ?? 'N/A',
                            'relationship' => $visitor->relationship ?? 'N/A',
                            'registered_date' => $visitor->created_at ? $visitor->created_at->format('M d, Y') : 'N/A',
                        ];
                    } catch (\Exception $e) {
                        \Log::error('Error mapping visitor: ' . $e->getMessage());
                        return null;
                    }
                })
                ->filter(); // Remove null entries
            
            // Get visitation requests
            $exportData['visitationRequests'] = FacialRecognitionVisitationRequest::with(['visitor', 'inmate'])
                ->whereBetween('created_at', [$startDate, $endDate])
                ->get()
                ->map(function($request) {
                // Format visit_time - handle both time strings and datetime objects
                $visitTime = 'N/A';
                if ($request->visit_time) {
                    try {
                        if (is_object($request->visit_time) && method_exists($request->visit_time, 'format')) {
                            $visitTime = $request->visit_time->format('h:i A');
                        } elseif (is_string($request->visit_time)) {
                            // Handle time format (HH:MM:SS) or datetime format
                            if (strlen($request->visit_time) <= 8) {
                                // Time format: "14:30:00" or "14:30"
                                $timeParts = explode(':', $request->visit_time);
                                $hour = (int)$timeParts[0];
                                $minute = (int)($timeParts[1] ?? 0);
                                $visitTime = date('h:i A', mktime($hour, $minute));
                            } else {
                                $visitTime = Carbon::parse($request->visit_time)->format('h:i A');
                            }
                        }
                    } catch (\Exception $e) {
                        $visitTime = is_string($request->visit_time) ? $request->visit_time : 'N/A';
                    }
                }
                
                try {
                    return [
                        'id' => $request->id,
                        'visitor' => $request->visitor ? ($request->visitor->name ?? 'N/A') : 'N/A',
                        'inmate' => $request->inmate ? ($request->inmate->full_name ?? 'N/A') : 'N/A',
                        'status' => ucfirst($request->status ?? 'pending'),
                        'visit_date' => $request->visit_date ? $request->visit_date->format('M d, Y') : 'N/A',
                        'visit_time' => $visitTime,
                        'requested_at' => $request->created_at ? $request->created_at->format('M d, Y h:i A') : 'N/A',
                        'checked_in_at' => $request->checked_in_at ? $request->checked_in_at->format('M d, Y h:i A') : 'N/A',
                        'checked_out_at' => $request->checked_out_at ? $request->checked_out_at->format('M d, Y h:i A') : 'N/A',
                    ];
                } catch (\Exception $e) {
                    \Log::error('Error mapping visitation request: ' . $e->getMessage());
                    return null;
                }
            })
            ->filter(); // Remove null entries
        
            // Get visitation logs (actual visits from visitation_logs table)
            if (Schema::hasTable('visitation_logs')) {
                try {
                    $exportData['visitationLogs'] = DB::table('visitation_logs')
                        ->whereBetween('visitation_logs.created_at', [$startDate, $endDate])
                        ->select(
                            'visitation_logs.id',
                            'visitation_logs.visitor_name',
                            'visitation_logs.inmate_id',
                            'visitation_logs.visit_date',
                            'visitation_logs.visit_time',
                            'visitation_logs.status',
                            'visitation_logs.purpose',
                            'visitation_logs.created_at'
                        )
                        ->get()
                        ->map(function($log) {
                            try {
                                // Get inmate name
                                $inmate = null;
                                if ($log->inmate_id) {
                                    $inmate = Inmate::find($log->inmate_id);
                                }
                                $inmateName = $inmate ? $inmate->full_name : 'Unknown';
                                
                                // Format visit_time - handle time format
                                $visitTime = 'N/A';
                                if ($log->visit_time) {
                                    try {
                                        if (is_string($log->visit_time)) {
                                            // Handle time format (HH:MM:SS) or datetime format
                                            if (strlen($log->visit_time) <= 8) {
                                                // Time format: "14:30:00" or "14:30"
                                                $timeParts = explode(':', $log->visit_time);
                                                $hour = (int)($timeParts[0] ?? 0);
                                                $minute = (int)($timeParts[1] ?? 0);
                                                $visitTime = date('h:i A', mktime($hour, $minute));
                                            } else {
                                                $visitTime = Carbon::parse($log->visit_time)->format('h:i A');
                                            }
                                        } else {
                                            $visitTime = Carbon::parse($log->visit_time)->format('h:i A');
                                        }
                                    } catch (\Exception $e) {
                                        $visitTime = is_string($log->visit_time) ? $log->visit_time : 'N/A';
                                    }
                                }
                                
                                return [
                                    'id' => $log->id,
                                    'visitor' => $log->visitor_name ?? 'N/A',
                                    'inmate' => $inmateName,
                                    'visit_date' => $log->visit_date ? Carbon::parse($log->visit_date)->format('M d, Y') : 'N/A',
                                    'visit_time' => $visitTime,
                                    'status' => $log->status ?? 'N/A',
                                    'purpose' => $log->purpose ?? 'N/A',
                                    'date' => $log->created_at ? Carbon::parse($log->created_at)->format('M d, Y') : 'N/A',
                                ];
                            } catch (\Exception $e) {
                                \Log::error('Error mapping visitation log: ' . $e->getMessage());
                                return null;
                            }
                        })
                        ->filter(); // Remove null entries
                } catch (\Exception $e) {
                    \Log::error('Error fetching visitation logs: ' . $e->getMessage());
                    $exportData['visitationLogs'] = collect([]);
                }
            } else {
                $exportData['visitationLogs'] = collect([]);
            }
        } catch (\Exception $e) {
            \Log::error('Error getting comprehensive export data: ' . $e->getMessage());
            // Return empty data structure
            $exportData = [
                'inmates' => collect([]),
                'visitors' => collect([]),
                'visitationRequests' => collect([]),
                'visitationLogs' => collect([]),
            ];
        }
        
        return $exportData;
    }
    
    /**
     * Export to PDF
     */
    private function exportToPDF($data, $reportType, $dateFrom, $dateTo)
    {
        try {
            // Generate HTML content
            $html = $this->generatePDFHTML($data, $reportType);
            
            $filename = "BJMP_Report_{$reportType}_" . date('Y-m-d_His') . ".pdf";
            
            // Check if DomPDF is available
            if (class_exists('\Barryvdh\DomPDF\Facade\Pdf')) {
                try {
                    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
                    $pdf->setPaper('a4', 'portrait');
                    return $pdf->download($filename);
                } catch (\Exception $e) {
                    \Log::error('DomPDF error: ' . $e->getMessage(), [
                        'trace' => $e->getTraceAsString()
                    ]);
                    // Fall through to HTML fallback
                }
            }
            
            // Fallback: Return HTML with print styles (user can print to PDF)
            // But indicate it's a fallback in the response
            return response($html)
                ->header('Content-Type', 'text/html; charset=UTF-8')
                ->header('Content-Disposition', 'attachment; filename="' . str_replace('.pdf', '.html', $filename) . '"');
                
        } catch (\Exception $e) {
            \Log::error('PDF export error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error generating PDF: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Generate PDF HTML content
     */
    private function generatePDFHTML($data, $reportType)
    {
        $html = '
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>BJMP Reports - ' . ucfirst($reportType) . '</title>
    <style>
        @page { margin: 20mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 10pt; color: #333; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 3px solid #2563eb; }
        .header h1 { font-size: 24pt; color: #1e40af; margin-bottom: 5px; }
        .header h2 { font-size: 16pt; color: #64748b; margin-bottom: 10px; }
        .header .meta { font-size: 9pt; color: #64748b; }
        .section { margin-bottom: 25px; page-break-inside: avoid; }
        .section-title { font-size: 14pt; color: #1e40af; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #cbd5e1; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
        .stat-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; text-align: center; }
        .stat-card .label { font-size: 9pt; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
        .stat-card .value { font-size: 20pt; font-weight: bold; color: #1e40af; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        thead { background: #1e40af; color: white; }
        th { padding: 10px; text-align: left; font-size: 9pt; font-weight: 600; }
        td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 9pt; }
        tr:nth-child(even) { background: #f8fafc; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 8pt; color: #64748b; padding-top: 10px; border-top: 1px solid #cbd5e1; }
        .no-data { text-align: center; padding: 20px; color: #64748b; font-style: italic; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style>
</head>
<body>';
        
        // Header
        $userName = $data['user']->full_name ?? $data['user']->name ?? 'System';
        $html .= '
    <div class="header">
        <h1>Bureau of Jail Management and Penology</h1>
        <h2>Iligan City District Jail - ' . htmlspecialchars(ucfirst($reportType)) . ' Report</h2>
        <div class="meta">
            <strong>Period:</strong> ' . htmlspecialchars(Carbon::parse($data['dateFrom'])->format('F d, Y')) . ' - ' . htmlspecialchars(Carbon::parse($data['dateTo'])->format('F d, Y')) . '<br>
            <strong>Generated:</strong> ' . htmlspecialchars($data['generatedAt']) . ' | <strong>Generated By:</strong> ' . htmlspecialchars($userName) . '
        </div>
    </div>';
        
        // Statistics Cards
        if (isset($data['statistics'])) {
            $html .= '
    <div class="section">
        <div class="section-title">Statistics Overview</div>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="label">Total Visitors</div>
                <div class="value">' . htmlspecialchars($data['statistics']['totalVisitors']) . '</div>
            </div>
            <div class="stat-card">
                <div class="label">Total Inmates</div>
                <div class="value">' . htmlspecialchars($data['statistics']['totalInmates']) . '</div>
            </div>
            <div class="stat-card">
                <div class="label">Pending Requests</div>
                <div class="value">' . htmlspecialchars($data['statistics']['pendingRequests']) . '</div>
            </div>
            <div class="stat-card">
                <div class="label">Approved Today</div>
                <div class="value">' . htmlspecialchars($data['statistics']['approvedToday']) . '</div>
            </div>
        </div>
    </div>';
        }
        
        // Inmates Table
        if (isset($data['exportData']['inmates'])) {
            $inmates = $data['exportData']['inmates'];
            $inmateCount = is_countable($inmates) ? count($inmates) : (is_object($inmates) && method_exists($inmates, 'count') ? $inmates->count() : 0);
            
            if ($inmateCount > 0) {
                $html .= '
    <div class="section">
        <div class="section-title">Inmates List (' . $inmateCount . ' Total)</div>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Gender</th>
                    <th>Age</th>
                    <th>Cell</th>
                    <th>Status</th>
                    <th>Registered Date</th>
                </tr>
            </thead>
            <tbody>';
            
                foreach ($inmates as $inmate) {
                    $html .= '
                <tr>
                    <td>' . htmlspecialchars($inmate['id'] ?? '') . '</td>
                    <td>' . htmlspecialchars($inmate['name'] ?? '') . '</td>
                    <td>' . htmlspecialchars($inmate['gender'] ?? '') . '</td>
                    <td>' . htmlspecialchars($inmate['age'] ?? '') . '</td>
                    <td>' . htmlspecialchars($inmate['cell'] ?? '') . '</td>
                    <td>' . htmlspecialchars($inmate['status'] ?? '') . '</td>
                    <td>' . htmlspecialchars($inmate['registered_date'] ?? '') . '</td>
                </tr>';
                }
            
                $html .= '
            </tbody>
        </table>
    </div>';
            }
        }
        
        // Visitors Table
        if (isset($data['exportData']['visitors'])) {
            $visitors = $data['exportData']['visitors'];
            $visitorCount = is_countable($visitors) ? count($visitors) : (is_object($visitors) && method_exists($visitors, 'count') ? $visitors->count() : 0);
            
            if ($visitorCount > 0) {
                $html .= '
    <div class="section" style="page-break-before: always;">
        <div class="section-title">Visitors List (' . $visitorCount . ' Total)</div>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Relationship</th>
                    <th>Registered Date</th>
                </tr>
            </thead>
            <tbody>';
            
                foreach ($visitors as $visitor) {
                    $html .= '
                <tr>
                    <td>' . htmlspecialchars($visitor['id'] ?? '') . '</td>
                    <td>' . htmlspecialchars($visitor['name'] ?? '') . '</td>
                    <td>' . htmlspecialchars($visitor['phone'] ?? '') . '</td>
                    <td>' . htmlspecialchars($visitor['email'] ?? '') . '</td>
                    <td>' . htmlspecialchars($visitor['relationship'] ?? '') . '</td>
                    <td>' . htmlspecialchars($visitor['registered_date'] ?? '') . '</td>
                </tr>';
                }
            
                $html .= '
            </tbody>
        </table>
    </div>';
            }
        }
        
        // Visitation Requests Table
        if (isset($data['exportData']['visitationRequests'])) {
            $requests = $data['exportData']['visitationRequests'];
            $requestCount = is_countable($requests) ? count($requests) : (is_object($requests) && method_exists($requests, 'count') ? $requests->count() : 0);
            
            if ($requestCount > 0) {
                $html .= '
    <div class="section" style="page-break-before: always;">
        <div class="section-title">Visitation Requests (' . $requestCount . ' Total)</div>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Visitor</th>
                    <th>Inmate</th>
                    <th>Status</th>
                    <th>Visit Date</th>
                    <th>Visit Time</th>
                    <th>Requested At</th>
                </tr>
            </thead>
            <tbody>';
            
                foreach ($requests as $request) {
                    $html .= '
                <tr>
                    <td>' . htmlspecialchars($request['id'] ?? '') . '</td>
                    <td>' . htmlspecialchars($request['visitor'] ?? '') . '</td>
                    <td>' . htmlspecialchars($request['inmate'] ?? '') . '</td>
                    <td>' . htmlspecialchars($request['status'] ?? '') . '</td>
                    <td>' . htmlspecialchars($request['visit_date'] ?? '') . '</td>
                    <td>' . htmlspecialchars($request['visit_time'] ?? '') . '</td>
                    <td>' . htmlspecialchars($request['requested_at'] ?? '') . '</td>
                </tr>';
                }
            
                $html .= '
            </tbody>
        </table>
    </div>';
            }
        }
        
        // Visitation Logs Table
        if (isset($data['exportData']['visitationLogs'])) {
            $logs = $data['exportData']['visitationLogs'];
            $logCount = is_countable($logs) ? count($logs) : (is_object($logs) && method_exists($logs, 'count') ? $logs->count() : 0);
            
            if ($logCount > 0) {
                $html .= '
    <div class="section" style="page-break-before: always;">
        <div class="section-title">Visitation Logs (' . $logCount . ' Total)</div>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Visitor</th>
                    <th>Inmate</th>
                    <th>Visit Date</th>
                    <th>Visit Time</th>
                    <th>Status</th>
                    <th>Purpose</th>
                </tr>
            </thead>
            <tbody>';
            
                foreach ($logs as $log) {
                    $html .= '
                <tr>
                    <td>' . htmlspecialchars($log['id'] ?? '') . '</td>
                    <td>' . htmlspecialchars($log['visitor'] ?? '') . '</td>
                    <td>' . htmlspecialchars($log['inmate'] ?? '') . '</td>
                    <td>' . htmlspecialchars($log['visit_date'] ?? '') . '</td>
                    <td>' . htmlspecialchars($log['visit_time'] ?? '') . '</td>
                    <td>' . htmlspecialchars($log['status'] ?? '') . '</td>
                    <td>' . htmlspecialchars($log['purpose'] ?? '') . '</td>
                </tr>';
                }
            
                $html .= '
            </tbody>
        </table>
    </div>';
            }
        }
        
        $html .= '
    <div class="footer">
        <p>BJMP Iligan City District Jail - Confidential Report</p>
        <p>This document contains sensitive information and should be handled according to security protocols.</p>
    </div>
</body>
</html>';
        
        return $html;
    }
    
    /**
     * Export to Excel
     */
    private function exportToExcel($data, $reportType)
    {
        try {
            // Generate CSV format (Excel can open CSV files)
            // For full Excel support, you'd need to install Laravel Excel package
            $filename = "BJMP_Report_{$reportType}_" . date('Y-m-d_His') . ".csv";
            
            // Generate comprehensive CSV content
            $csv = $this->generateCSVContent($data, $reportType);
            
            // Return as CSV (Excel will open it)
            return response($csv, 200)
                ->header('Content-Type', 'text/csv; charset=UTF-8')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
                ->header('Cache-Control', 'must-revalidate, post-check=0, pre-check=0')
                ->header('Pragma', 'public');
        } catch (\Exception $e) {
            \Log::error('Excel export error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error generating Excel export: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Export to CSV
     */
    private function exportToCSV($data, $reportType)
    {
        try {
            $filename = "BJMP_Report_{$reportType}_" . date('Y-m-d_His') . ".csv";
            
            // Generate comprehensive CSV content
            $csv = $this->generateCSVContent($data, $reportType);
            
            // Add BOM for Excel UTF-8 compatibility
            $bom = "\xEF\xBB\xBF";
            $csv = $bom . $csv;
            
            return response($csv, 200)
                ->header('Content-Type', 'text/csv; charset=UTF-8')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
                ->header('Cache-Control', 'must-revalidate, post-check=0, pre-check=0')
                ->header('Pragma', 'public');
        } catch (\Exception $e) {
            \Log::error('CSV export error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error generating CSV export: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Generate CSV content from data
     */
    private function generateCSVContent($data, $reportType)
    {
        $csv = "BJMP Iligan City District Jail - {$reportType} Report\n";
        $csv .= "Period: {$data['dateFrom']} to {$data['dateTo']}\n";
        $csv .= "Generated: {$data['generatedAt']}\n";
        $userName = $data['user']->full_name ?? $data['user']->name ?? 'System';
        $csv .= "Generated By: " . $userName . "\n\n";
        
        // Statistics
        if (isset($data['statistics'])) {
            $csv .= "STATISTICS\n";
            $csv .= "Total Visitors,{$data['statistics']['totalVisitors']}\n";
            $csv .= "Total Inmates,{$data['statistics']['totalInmates']}\n";
            $csv .= "Pending Requests,{$data['statistics']['pendingRequests']}\n";
            $csv .= "Approved Today,{$data['statistics']['approvedToday']}\n\n";
        }
        
        // Inmates
        if (isset($data['exportData']['inmates'])) {
            $inmates = $data['exportData']['inmates'];
            $inmateCount = is_countable($inmates) ? count($inmates) : (is_object($inmates) && method_exists($inmates, 'count') ? $inmates->count() : 0);
            
            if ($inmateCount > 0) {
                $csv .= "INMATES\n";
                $csv .= "ID,Name,Gender,Age,Cell,Status,Crime,Sentence,Registered Date\n";
                foreach ($inmates as $inmate) {
                    $csv .= sprintf(
                        "%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                        $inmate['id'] ?? '',
                        $this->escapeCSV($inmate['name'] ?? ''),
                        $inmate['gender'] ?? '',
                        $inmate['age'] ?? '',
                        $this->escapeCSV($inmate['cell'] ?? ''),
                        $inmate['status'] ?? '',
                        $this->escapeCSV($inmate['crime'] ?? ''),
                        $this->escapeCSV($inmate['sentence'] ?? ''),
                        $inmate['registered_date'] ?? ''
                    );
                }
                $csv .= "\n";
            }
        }
        
        // Visitors
        if (isset($data['exportData']['visitors'])) {
            $visitors = $data['exportData']['visitors'];
            $visitorCount = is_countable($visitors) ? count($visitors) : (is_object($visitors) && method_exists($visitors, 'count') ? $visitors->count() : 0);
            
            if ($visitorCount > 0) {
                $csv .= "VISITORS\n";
                $csv .= "ID,Name,Phone,Email,Relationship,Registered Date\n";
                foreach ($visitors as $visitor) {
                    $csv .= sprintf(
                        "%s,%s,%s,%s,%s,%s\n",
                        $visitor['id'] ?? '',
                        $this->escapeCSV($visitor['name'] ?? ''),
                        $visitor['phone'] ?? '',
                        $visitor['email'] ?? '',
                        $visitor['relationship'] ?? '',
                        $visitor['registered_date'] ?? ''
                    );
                }
                $csv .= "\n";
            }
        }
        
        // Visitation Requests
        if (isset($data['exportData']['visitationRequests'])) {
            $requests = $data['exportData']['visitationRequests'];
            $requestCount = is_countable($requests) ? count($requests) : (is_object($requests) && method_exists($requests, 'count') ? $requests->count() : 0);
            
            if ($requestCount > 0) {
                $csv .= "VISITATION REQUESTS\n";
                $csv .= "ID,Visitor,Inmate,Status,Visit Date,Visit Time,Requested At,Checked In,Checked Out\n";
                foreach ($requests as $request) {
                    $csv .= sprintf(
                        "%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                        $request['id'] ?? '',
                        $this->escapeCSV($request['visitor'] ?? ''),
                        $this->escapeCSV($request['inmate'] ?? ''),
                        $request['status'] ?? '',
                        $request['visit_date'] ?? '',
                        $request['visit_time'] ?? '',
                        $request['requested_at'] ?? '',
                        $request['checked_in_at'] ?? '',
                        $request['checked_out_at'] ?? ''
                    );
                }
                $csv .= "\n";
            }
        }
        
        // Visitation Logs
        if (isset($data['exportData']['visitationLogs'])) {
            $logs = $data['exportData']['visitationLogs'];
            $logCount = is_countable($logs) ? count($logs) : (is_object($logs) && method_exists($logs, 'count') ? $logs->count() : 0);
            
            if ($logCount > 0) {
                $csv .= "VISITATION LOGS\n";
                $csv .= "ID,Visitor,Inmate,Visit Date,Visit Time,Status,Purpose,Date\n";
                foreach ($logs as $log) {
                    $csv .= sprintf(
                        "%s,%s,%s,%s,%s,%s,%s,%s\n",
                        $log['id'] ?? '',
                        $this->escapeCSV($log['visitor'] ?? ''),
                        $this->escapeCSV($log['inmate'] ?? ''),
                        $log['visit_date'] ?? '',
                        $log['visit_time'] ?? '',
                        $log['status'] ?? '',
                        $log['purpose'] ?? '',
                        $log['date'] ?? ''
                    );
                }
            }
        }
        
        return $csv;
    }
    
    /**
     * Escape CSV field
     */
    private function escapeCSV($field)
    {
        // Handle null values
        if ($field === null || $field === '') {
            return '';
        }
        
        // Convert to string
        $field = (string)$field;
        
        // Escape quotes
        $field = str_replace('"', '""', $field);
        
        // Wrap in quotes if needed
        if (strpos($field, ',') !== false || strpos($field, '"') !== false || strpos($field, "\n") !== false || strpos($field, "\r") !== false) {
            return '"' . $field . '"';
        }
        
        return $field;
    }
}
