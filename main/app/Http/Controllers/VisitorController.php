<?php

namespace App\Http\Controllers;

use App\Models\Visitor;
use App\Models\Inmate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

class VisitorController extends Controller
{
    public function index(Request $request)
    {
        $query = Visitor::with(['inmate']);

        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        if ($request->has('inmate_id') && $request->inmate_id) {
            $query->byInmate($request->inmate_id);
        }

        if ($request->has('is_allowed') && $request->is_allowed !== null && $request->is_allowed !== '') {
            $query->where('is_allowed', (int) $request->is_allowed === 1);
        }

        if ($request->has('life_status') && $request->life_status) {
            $query->where('life_status', $request->life_status);
        }

        $perPage = $request->get('per_page', 15);
        $visitors = $query->latest()->paginate($perPage);

        $items = $visitors->items();
        $ids = array_map(fn($v) => $v->id, $items);

        $latestMap = [];
        if (!empty($ids) && Schema::hasTable('visitation_logs') && Schema::hasColumn('visitation_logs', 'visitor_id')) {
            $select = ['visitor_id', 'status', 'created_at'];
            if (Schema::hasColumn('visitation_logs', 'schedule')) $select[] = 'schedule';
            if (Schema::hasColumn('visitation_logs', 'visit_date')) $select[] = 'visit_date';
            if (Schema::hasColumn('visitation_logs', 'visit_time')) $select[] = 'visit_time';
            if (Schema::hasColumn('visitation_logs', 'time_in')) $select[] = 'time_in';
            if (Schema::hasColumn('visitation_logs', 'time_out')) $select[] = 'time_out';
            if (Schema::hasColumn('visitation_logs', 'reason_for_visit')) $select[] = 'reason_for_visit';
            if (Schema::hasColumn('visitation_logs', 'reference_number')) $select[] = 'reference_number';

            $logs = DB::table('visitation_logs')
                ->select($select)
                ->whereIn('visitor_id', $ids)
                ->orderByDesc('created_at')
                ->get();
            foreach ($logs as $row) {
                if (!isset($latestMap[$row->visitor_id])) {
                    $schedule = property_exists($row, 'schedule') ? $row->schedule : null;
                    if (!$schedule && property_exists($row, 'visit_date') && $row->visit_date) {
                        $visitTime = property_exists($row, 'visit_time') ? ($row->visit_time ?? '') : '';
                        $schedule = trim($row->visit_date . ' ' . $visitTime);
                    }
                    $latestMap[$row->visitor_id] = [
                        'schedule' => $schedule,
                        'status' => $row->status,
                        'time_in' => property_exists($row, 'time_in') ? $row->time_in : null,
                        'time_out' => property_exists($row, 'time_out') ? $row->time_out : null,
                        'reason_for_visit' => property_exists($row, 'reason_for_visit') ? $row->reason_for_visit : null,
                        'reference_number' => property_exists($row, 'reference_number') ? $row->reference_number : null,
                    ];
                }
            }
        }

        $data = array_map(function ($v) use ($latestMap) {
            $arr = $v->toArray();
            $arr['latest_log'] = $latestMap[$v->id] ?? null;
            return $arr;
        }, $items);

        return response()->json([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'current_page' => $visitors->currentPage(),
                'last_page' => $visitors->lastPage(),
                'per_page' => $visitors->perPage(),
                'total' => $visitors->total(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'inmate_id' => 'required|exists:inmates,id',
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'relationship' => 'nullable|string|max:100',
            'id_type' => 'nullable|string|max:50',
            'id_number' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:500',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'life_status' => 'nullable|in:alive,deceased,unknown',
            'is_allowed' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        $data['life_status'] = $data['life_status'] ?? 'alive';
        $data['is_allowed'] = array_key_exists('is_allowed', $data) ? (bool) $data['is_allowed'] : true;
        
        if ($request->hasFile('avatar')) {
            $avatar = $request->file('avatar');
            $filename = time() . '_' . $avatar->getClientOriginalName();
            $path = $avatar->storeAs('visitors/avatars', $filename, 'public');
            
            $data['avatar_path'] = 'visitors/avatars';
            $data['avatar_filename'] = $filename;
        }

        if (auth()->check()) {
            $data['created_by_user_id'] = auth()->id();
        }

        $visitor = Visitor::create($data);
        $visitor->load('inmate');

        $schedule = $request->input('schedule');
        if ($schedule && Schema::hasTable('visitation_logs')) {
            try {
                $payload = [
                    'inmate_id' => (int) $data['inmate_id'],
                    'schedule' => $schedule,
                    'status' => 2,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                if (Schema::hasColumn('visitation_logs', 'visitor_id')) {
                    $payload['visitor_id'] = $visitor->id;
                }
                DB::table('visitation_logs')->insert($payload);
            } catch (\Throwable $e) {
                try {
                    $dt = Carbon::parse($schedule);
                    $payload = [
                        'inmate_id' => (int) $data['inmate_id'],
                        'visit_date' => $dt->toDateString(),
                        'visit_time' => $dt->format('H:i:s'),
                        'status' => 'Pending',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                    if (Schema::hasColumn('visitation_logs', 'visitor_id')) {
                        $payload['visitor_id'] = $visitor->id;
                    }
                    DB::table('visitation_logs')->insert($payload);
                } catch (\Throwable $e2) {}
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Visitor registered successfully',
            'data' => $visitor
        ], 201);
    }

    public function show($id)
    {
        $visitor = Visitor::with(['inmate'])->find($id);

        if (!$visitor) {
            return response()->json([
                'success' => false,
                'message' => 'Visitor not found'
            ], 404);
        }

$visitor->setAttribute('latest_log', null);
        if (Schema::hasTable('visitation_logs')) {
            $select = ['status', 'created_at'];
            if (Schema::hasColumn('visitation_logs', 'schedule')) $select[] = 'schedule';
            if (Schema::hasColumn('visitation_logs', 'visit_date')) $select[] = 'visit_date';
            if (Schema::hasColumn('visitation_logs', 'visit_time')) $select[] = 'visit_time';
            if (Schema::hasColumn('visitation_logs', 'time_in')) $select[] = 'time_in';
            if (Schema::hasColumn('visitation_logs', 'time_out')) $select[] = 'time_out';
            if (Schema::hasColumn('visitation_logs', 'reason_for_visit')) $select[] = 'reason_for_visit';

            $query = DB::table('visitation_logs')->select($select);
            if (Schema::hasColumn('visitation_logs', 'visitor_id')) {
                $query->where('visitor_id', $visitor->id);
            }
            $latest = $query->orderByDesc('created_at')->first();
            if ($latest) {
                $schedule = property_exists($latest, 'schedule') ? $latest->schedule : null;
                if (!$schedule && property_exists($latest, 'visit_date') && $latest->visit_date) {
                    $visitTime = property_exists($latest, 'visit_time') ? ($latest->visit_time ?? '') : '';
                    $schedule = trim($latest->visit_date . ' ' . $visitTime);
                }
                $visitor->setAttribute('latest_log', [
                    'schedule' => $schedule,
                    'status' => $latest->status,
                    'time_in' => property_exists($latest, 'time_in') ? $latest->time_in : null,
                    'time_out' => property_exists($latest, 'time_out') ? $latest->time_out : null,
                    'reason_for_visit' => property_exists($latest, 'reason_for_visit') ? $latest->reason_for_visit : null,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $visitor
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|integer|in:0,1,2'
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid status',
                'errors' => $validator->errors()
            ], 422);
        }

        $visitor = Visitor::find($id);
        if (!$visitor) {
            return response()->json([
                'success' => false,
                'message' => 'Visitor not found'
            ], 404);
        }

        if (!Schema::hasTable('visitation_logs')) {
            return response()->json([
                'success' => false,
                'message' => 'Visitation logs not initialized'
            ], 400);
        }

        $statusInt = (int) $request->input('status');
        $statusText = $statusInt === 1 ? 'Approved' : ($statusInt === 0 ? 'Denied' : 'Pending');

        $colInfo = DB::select("SHOW COLUMNS FROM visitation_logs LIKE 'status'");
        $type = strtolower($colInfo[0]->Type ?? '');
        $isEnum = str_starts_with($type, 'enum');

        $select = ['id', 'status', 'created_at'];
        if (Schema::hasColumn('visitation_logs', 'schedule')) $select[] = 'schedule';
        if (Schema::hasColumn('visitation_logs', 'visit_date')) $select[] = 'visit_date';
        if (Schema::hasColumn('visitation_logs', 'visit_time')) $select[] = 'visit_time';

        $query = DB::table('visitation_logs')->select($select);
        if (Schema::hasColumn('visitation_logs', 'visitor_id')) {
            $query->where('visitor_id', $visitor->id);
        }
        $latest = $query->orderByDesc('created_at')->first();

        if (!$latest) {
            // Create a new visitation log for this visitor
            $now = now();
            $payload = [
                'inmate_id' => (int) $visitor->inmate_id,
                'created_at' => $now,
                'updated_at' => $now,
            ];
            if (Schema::hasColumn('visitation_logs', 'visitor_id')) {
                $payload['visitor_id'] = $visitor->id;
            }
            if (Schema::hasColumn('visitation_logs', 'schedule')) {
                $payload['schedule'] = null;
                $payload['status'] = $isEnum ? $statusText : $statusInt;
                DB::table('visitation_logs')->insert($payload);
            } else {
                // Legacy schema: require visit_date (non-null)
                $payload['visit_date'] = $now->toDateString();
                if (Schema::hasColumn('visitation_logs', 'visit_time')) {
                    $payload['visit_time'] = $now->format('H:i:s');
                }
                $payload['status'] = $isEnum ? $statusText : $statusInt;
                DB::table('visitation_logs')->insert($payload);
            }

            return response()->json([
                'success' => true,
                'message' => 'Status updated',
                'data' => [
                    'latest_log' => [
                        'status' => $isEnum ? $statusText : $statusInt,
                    ]
                ]
            ]);
        }

        $update = [
            'status' => $isEnum ? $statusText : $statusInt,
            'updated_at' => now(),
        ];
        DB::table('visitation_logs')->where('id', $latest->id)->update($update);

        return response()->json([
            'success' => true,
            'message' => 'Status updated',
            'data' => [
                'latest_log' => [
                    'status' => $isEnum ? $statusText : $statusInt,
                ]
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $visitor = Visitor::find($id);

        if (!$visitor) {
            return response()->json([
                'success' => false,
                'message' => 'Visitor not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'relationship' => 'nullable|string|max:100',
            'id_type' => 'nullable|string|max:50',
            'id_number' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:500',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'life_status' => 'nullable|in:alive,deceased,unknown',
            'is_allowed' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        
        if ($request->hasFile('avatar')) {
            if ($visitor->avatar_path && $visitor->avatar_filename) {
                Storage::disk('public')->delete($visitor->avatar_path . '/' . $visitor->avatar_filename);
            }
            
            $avatar = $request->file('avatar');
            $filename = time() . '_' . $avatar->getClientOriginalName();
            $path = $avatar->storeAs('visitors/avatars', $filename, 'public');
            
            $data['avatar_path'] = 'visitors/avatars';
            $data['avatar_filename'] = $filename;
        }

        if (auth()->check()) {
            $data['updated_by_user_id'] = auth()->id();
        }

        $visitor->update($data);
        $visitor->load('inmate');

        return response()->json([
            'success' => true,
            'message' => 'Visitor updated successfully',
            'data' => $visitor
        ]);
    }

    public function destroy($id)
    {
        $visitor = Visitor::find($id);

        if (!$visitor) {
            return response()->json([
                'success' => false,
                'message' => 'Visitor not found'
            ], 404);
        }

        if ($visitor->avatar_path && $visitor->avatar_filename) {
            Storage::disk('public')->delete($visitor->avatar_path . '/' . $visitor->avatar_filename);
        }

        $visitor->delete();

        return response()->json([
            'success' => true,
            'message' => 'Visitor deleted successfully'
        ]);
    }

    public function inmatesWithoutAllowedVisitorsCount()
    {
        $count = Inmate::whereDoesntHave('visitors', function ($q) {
            $q->where('is_allowed', true);
        })->count();

        return response()->json([
            'success' => true,
            'count' => $count,
        ]);
    }

    /**
     * Record Time In for a visitor
     */
    public function recordTimeIn($id)
    {
        try {
            $visitor = Visitor::find($id);
            
            if (!$visitor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Visitor not found'
                ], 404);
            }

            // Get the latest visitation log for this visitor
            $latestLog = DB::table('visitation_logs')
                ->where('visitor_id', $id)
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$latestLog) {
                return response()->json([
                    'success' => false,
                    'message' => 'No visitation log found for this visitor'
                ], 404);
            }

            // Check if time_in is already recorded
            if ($latestLog->time_in) {
                return response()->json([
                    'success' => false,
                    'message' => 'Time in already recorded'
                ], 400);
            }

            // Update time_in
            DB::table('visitation_logs')
                ->where('id', $latestLog->id)
                ->update([
                    'time_in' => now(),
                    'updated_at' => now()
                ]);

            // Get updated log
            $updatedLog = DB::table('visitation_logs')
                ->where('id', $latestLog->id)
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'Time in recorded successfully',
                'data' => $updatedLog
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to record time in: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Record Time Out for a visitor
     */
    public function recordTimeOut($id)
    {
        try {
            $visitor = Visitor::find($id);
            
            if (!$visitor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Visitor not found'
                ], 404);
            }

            // Get the latest visitation log for this visitor
            $latestLog = DB::table('visitation_logs')
                ->where('visitor_id', $id)
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$latestLog) {
                return response()->json([
                    'success' => false,
                    'message' => 'No visitation log found for this visitor'
                ], 404);
            }

            // Check if time_in is recorded
            if (!$latestLog->time_in) {
                return response()->json([
                    'success' => false,
                    'message' => 'Time in must be recorded before time out'
                ], 400);
            }

            // Check if time_out is already recorded
            if ($latestLog->time_out) {
                return response()->json([
                    'success' => false,
                    'message' => 'Time out already recorded'
                ], 400);
            }

            // Update time_out
            DB::table('visitation_logs')
                ->where('id', $latestLog->id)
                ->update([
                    'time_out' => now(),
                    'updated_at' => now()
                ]);

            // Get updated log
            $updatedLog = DB::table('visitation_logs')
                ->where('id', $latestLog->id)
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'Time out recorded successfully',
                'data' => $updatedLog
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to record time out: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get visitation requests (logs) for manual approval
     * This returns visitation_logs entries, not visitors
     */
    public function getVisitationRequests(Request $request)
    {
        try {
            // Get basic visitation_logs data first
            $logs = DB::table('visitation_logs')
                ->select([
                    'id', 'visitor_id', 'inmate_id', 'schedule', 'reason_for_visit', 
                    'status', 'time_in', 'time_out', 'created_at', 'reference_number'
                ])
                ->orderByDesc('created_at')
                ->limit(5)
                ->get();

            // Get visitor and inmate information separately
            $visitorIds = $logs->pluck('visitor_id')->filter()->unique();
            $inmateIds = $logs->pluck('inmate_id')->filter()->unique();

            $visitors = [];
            if ($visitorIds->isNotEmpty()) {
                $visitors = DB::table('visitors')
                    ->whereIn('id', $visitorIds)
                    ->get()
                    ->keyBy('id');
            }

            $inmates = [];
            if ($inmateIds->isNotEmpty()) {
                $inmates = DB::table('inmates')
                    ->whereIn('id', $inmateIds)
                    ->get()
                    ->keyBy('id');
            }

            // Get all registered visitors for these inmates to extract family information
            $allVisitors = [];
            if ($inmateIds->isNotEmpty()) {
                $allVisitors = DB::table('visitors')
                    ->whereIn('inmate_id', $inmateIds)
                    ->get()
                    ->groupBy('inmate_id');
            }

            // Transform the data with related information
            $data = $logs->map(function ($log) use ($visitors, $inmates, $allVisitors) {
                $visitor = $visitors->get($log->visitor_id);
                $inmate = $inmates->get($log->inmate_id);
                
                $inmateName = 'N/A';
                if ($inmate) {
                    $inmateName = trim(($inmate->first_name ?? '') . ' ' . ($inmate->last_name ?? ''));
                    if (empty($inmateName)) $inmateName = 'N/A';
                }
                
                return [
                    'id' => $log->id,
                    'visitor_id' => $log->visitor_id,
                    'inmate_id' => $log->inmate_id,
                    'visitor' => $visitor->name ?? 'N/A',
                    'schedule' => $log->schedule ?? 'N/A',
                    'reason_for_visit' => $log->reason_for_visit ?? 'N/A',
                    'reference_number' => $log->reference_number ?? null,
                    'status' => $log->status ?? 2,
                    'time_in' => $log->time_in,
                    'time_out' => $log->time_out,
                    'created_at' => $log->created_at,
                    'visitorDetails' => [
                        'name' => $visitor->name ?? 'N/A',
                        'phone' => $visitor->phone ?? 'N/A',
                        'email' => $visitor->email ?? 'N/A',
                        'relationship' => $visitor->relationship ?? 'N/A',
                        'avatar' => $visitor->avatar ?? null
                    ],
                    'pdlDetails' => [
                        'name' => $inmateName,
                        'inmate_id' => $log->inmate_id,
                        'birthday' => $inmate->birthdate ?? $inmate->date_of_birth ?? null,
                        'age' => $inmate->birthdate ?? $inmate->date_of_birth ? $this->calculateAge($inmate->birthdate ?? $inmate->date_of_birth) : null,
                        'parents' => [
                            'father' => $this->extractFamilyMember($allVisitors, $log->inmate_id, 'father'),
                            'mother' => $this->extractFamilyMember($allVisitors, $log->inmate_id, 'mother')
                        ],
                        'spouse' => $inmate->civil_status === 'Married' ? 'Married' : 'N/A',
                        'nextOfKin' => $this->extractFamilyMembers($allVisitors, $log->inmate_id, ['sister', 'brother', 'sibling'])
                    ],
                    'inmate' => [
                        'id' => $log->inmate_id,
                        'first_name' => $inmate->first_name ?? null,
                        'last_name' => $inmate->last_name ?? null,
                        'middle_name' => $inmate->middle_name ?? null,
                        'name' => $inmateName,
                        'birthdate' => $inmate->birthdate ?? null,
                        'date_of_birth' => $inmate->date_of_birth ?? null,
                        'civil_status' => $inmate->civil_status ?? null
                    ]
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data,
                'meta' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 5,
                    'total' => $data->count()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch visitation requests: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new visitation log entry
     */
    public function createVisitationLog(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'visitor_id' => 'required|exists:visitors,id',
                'inmate_id' => 'required|exists:inmates,id',
                'schedule' => 'required|date',
                'reason_for_visit' => 'required|string|max:500',
                'reference_number' => 'required|string|max:20|unique:visitation_logs,reference_number',
                'status' => 'sometimes|integer|in:0,1,2' // 0=Declined, 1=Approved, 2=Pending
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Create visitation log entry
            $visitationLogId = DB::table('visitation_logs')->insertGetId([
                'reference_number' => $request->reference_number,
                'visitor_id' => $request->visitor_id,
                'inmate_id' => $request->inmate_id,
                'schedule' => $request->schedule,
                'reason_for_visit' => $request->reason_for_visit,
                'status' => $request->status ?? 2, // Default to pending
                'created_at' => now(),
                'updated_at' => now()
            ]);

            if (!$visitationLogId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create visitation log'
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Visitation request created successfully',
                'data' => [
                    'id' => $visitationLogId,
                    'reference_number' => $request->reference_number
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create visitation request: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate age from birthdate
     */
    private function calculateAge($birthdate)
    {
        if (!$birthdate) return null;
        
        try {
            $birthDate = new \DateTime($birthdate);
            $today = new \DateTime();
            $age = $today->diff($birthDate)->y;
            return $age;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Extract a single family member from registered visitors by relationship
     */
    private function extractFamilyMember($allVisitors, $inmateId, $relationship)
    {
        if (!isset($allVisitors[$inmateId])) {
            return 'N/A';
        }

        $visitors = $allVisitors[$inmateId];
        foreach ($visitors as $visitor) {
            if ($visitor->relationship && strtolower($visitor->relationship) === strtolower($relationship)) {
                return $visitor->name ?? 'N/A';
            }
        }

        return 'N/A';
    }

    /**
     * Extract multiple family members from registered visitors by relationships (for Next of Kin)
     */
    private function extractFamilyMembers($allVisitors, $inmateId, $relationships)
    {
        if (!isset($allVisitors[$inmateId])) {
            return 'N/A';
        }

        $visitors = $allVisitors[$inmateId];
        $names = [];

        foreach ($visitors as $visitor) {
            if ($visitor->relationship) {
                $rel = strtolower($visitor->relationship);
                foreach ($relationships as $targetRel) {
                    if ($rel === strtolower($targetRel)) {
                        $names[] = $visitor->name ?? 'Unknown';
                        break;
                    }
                }
            }
        }

        return !empty($names) ? implode(' | ', $names) : 'N/A';
    }
}
