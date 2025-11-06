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
     * Record Time In for a visitation log
     */
    public function recordTimeIn($id)
    {
        try {
            // $id is the visitation_log_id
            $visitationLog = DB::table('visitation_logs')
                ->where('id', $id)
                ->first();

            if (!$visitationLog) {
                return response()->json([
                    'success' => false,
                    'message' => 'Visitation log not found'
                ], 404);
            }

            // Check if time_in is already recorded
            if ($visitationLog->time_in) {
                return response()->json([
                    'success' => false,
                    'message' => 'Time in already recorded'
                ], 400);
            }

            // Update time_in
            DB::table('visitation_logs')
                ->where('id', $id)
                ->update([
                    'time_in' => now(),
                    'updated_at' => now()
                ]);

            // Get updated log
            $updatedLog = DB::table('visitation_logs')
                ->where('id', $id)
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
     * Record Time Out for a visitation log
     */
    public function recordTimeOut($id)
    {
        try {
            // $id is the visitation_log_id
            $visitationLog = DB::table('visitation_logs')
                ->where('id', $id)
                ->first();

            if (!$visitationLog) {
                return response()->json([
                    'success' => false,
                    'message' => 'Visitation log not found'
                ], 404);
            }

            // Check if time_in is recorded
            if (!$visitationLog->time_in) {
                return response()->json([
                    'success' => false,
                    'message' => 'Time in must be recorded before time out'
                ], 400);
            }

            // Check if time_out is already recorded
            if ($visitationLog->time_out) {
                return response()->json([
                    'success' => false,
                    'message' => 'Time out already recorded'
                ], 400);
            }

            // Update time_out
            DB::table('visitation_logs')
                ->where('id', $id)
                ->update([
                    'time_out' => now(),
                    'updated_at' => now()
                ]);

            // Get updated log
            $updatedLog = DB::table('visitation_logs')
                ->where('id', $id)
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
            // Check if visitation_logs table exists
            if (!Schema::hasTable('visitation_logs')) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'meta' => [
                        'current_page' => 1,
                        'last_page' => 1,
                        'per_page' => $request->get('per_page', 5),
                        'total' => 0
                    ]
                ]);
            }

            // Get pagination parameters
            $perPage = (int) $request->get('per_page', 5);
            $page = (int) $request->get('page', 1);
            $perPage = max(1, min(100, $perPage)); // Limit between 1 and 100
            $page = max(1, $page);

            // Build select columns dynamically based on what exists in the table
            $selectColumns = ['id', 'inmate_id', 'created_at'];
            if (Schema::hasColumn('visitation_logs', 'visitor_id')) {
                $selectColumns[] = 'visitor_id';
            }
            if (Schema::hasColumn('visitation_logs', 'schedule')) {
                $selectColumns[] = 'schedule';
            }
            if (Schema::hasColumn('visitation_logs', 'reason_for_visit')) {
                $selectColumns[] = 'reason_for_visit';
            }
            if (Schema::hasColumn('visitation_logs', 'status')) {
                $selectColumns[] = 'status';
            }
            if (Schema::hasColumn('visitation_logs', 'time_in')) {
                $selectColumns[] = 'time_in';
            }
            if (Schema::hasColumn('visitation_logs', 'time_out')) {
                $selectColumns[] = 'time_out';
            }
            if (Schema::hasColumn('visitation_logs', 'reference_number')) {
                $selectColumns[] = 'reference_number';
            }

            // Get total count for pagination
            $total = DB::table('visitation_logs')->count();
            $lastPage = max(1, (int) ceil($total / $perPage));

            // Apply pagination
            $offset = ($page - 1) * $perPage;
            $logs = DB::table('visitation_logs')
                ->select($selectColumns)
                ->orderByDesc('created_at')
                ->offset($offset)
                ->limit($perPage)
                ->get();

            // Get visitor and inmate information separately
            $visitorIds = collect();
            $inmateIds = collect();

            foreach ($logs as $log) {
                if (property_exists($log, 'visitor_id') && $log->visitor_id) {
                    $visitorIds->push($log->visitor_id);
                }
                if (property_exists($log, 'inmate_id') && $log->inmate_id) {
                    $inmateIds->push($log->inmate_id);
                }
            }

            $visitorIds = $visitorIds->unique();
            $inmateIds = $inmateIds->unique();

            $visitors = collect();
            if ($visitorIds->isNotEmpty() && Schema::hasTable('visitors')) {
                $visitors = DB::table('visitors')
                    ->whereIn('id', $visitorIds->toArray())
                    ->get()
                    ->keyBy('id');
            }

            $inmates = collect();
            if ($inmateIds->isNotEmpty() && Schema::hasTable('inmates')) {
                $inmates = DB::table('inmates')
                    ->whereIn('id', $inmateIds->toArray())
                    ->get()
                    ->keyBy('id');
            }

            // Get all registered visitors for these inmates to extract family information
            $allVisitors = collect();
            if ($inmateIds->isNotEmpty() && Schema::hasTable('visitors')) {
                $allVisitors = DB::table('visitors')
                    ->whereIn('inmate_id', $inmateIds->toArray())
                    ->get()
                    ->groupBy('inmate_id');
            }

            // Transform the data with related information
            $data = $logs->map(function ($log) use ($visitors, $inmates, $allVisitors) {
                $visitorId = property_exists($log, 'visitor_id') ? $log->visitor_id : null;
                $inmateId = property_exists($log, 'inmate_id') ? $log->inmate_id : null;
                
                $visitor = $visitorId ? ($visitors->get($visitorId) ?? null) : null;
                $inmate = $inmateId ? ($inmates->get($inmateId) ?? null) : null;
                
                $inmateName = 'N/A';
                if ($inmate) {
                    $firstName = property_exists($inmate, 'first_name') ? ($inmate->first_name ?? '') : '';
                    $lastName = property_exists($inmate, 'last_name') ? ($inmate->last_name ?? '') : '';
                    $inmateName = trim($firstName . ' ' . $lastName);
                    if (empty($inmateName)) $inmateName = 'N/A';
                }
                
                $visitorName = 'N/A';
                if ($visitor) {
                    $visitorName = property_exists($visitor, 'name') ? ($visitor->name ?? 'N/A') : 'N/A';
                }
                
                return [
                    'id' => $log->id ?? null,
                    'visitor_id' => $visitorId,
                    'inmate_id' => $inmateId,
                    'visitor' => $visitorName,
                    'schedule' => (property_exists($log, 'schedule') && $log->schedule) ? $log->schedule : 'N/A',
                    'reason_for_visit' => (property_exists($log, 'reason_for_visit') && $log->reason_for_visit) ? $log->reason_for_visit : 'N/A',
                    'reference_number' => (property_exists($log, 'reference_number') && $log->reference_number) ? $log->reference_number : null,
                    'status' => (property_exists($log, 'status') && $log->status !== null) ? $log->status : 2,
                    'time_in' => (property_exists($log, 'time_in') && $log->time_in) ? $log->time_in : null,
                    'time_out' => (property_exists($log, 'time_out') && $log->time_out) ? $log->time_out : null,
                    'created_at' => $log->created_at ?? null,
                    'visitorDetails' => [
                        'name' => $visitorName,
                        'phone' => ($visitor && property_exists($visitor, 'phone')) ? ($visitor->phone ?? 'N/A') : 'N/A',
                        'email' => ($visitor && property_exists($visitor, 'email')) ? ($visitor->email ?? 'N/A') : 'N/A',
                        'relationship' => ($visitor && property_exists($visitor, 'relationship')) ? ($visitor->relationship ?? 'N/A') : 'N/A',
                        'avatar' => ($visitor && property_exists($visitor, 'avatar')) ? ($visitor->avatar ?? null) : null
                    ],
                    'pdlDetails' => [
                        'name' => $inmateName,
                        'inmate_id' => $inmateId,
                        'birthday' => ($inmate && property_exists($inmate, 'birthdate')) ? ($inmate->birthdate ?? null) : (($inmate && property_exists($inmate, 'date_of_birth')) ? ($inmate->date_of_birth ?? null) : null),
                        'age' => ($inmate && (property_exists($inmate, 'birthdate') || property_exists($inmate, 'date_of_birth'))) ? $this->calculateAge($inmate->birthdate ?? $inmate->date_of_birth ?? null) : null,
                        'parents' => [
                            'father' => $this->extractFamilyMember($allVisitors, $inmateId, 'father'),
                            'mother' => $this->extractFamilyMember($allVisitors, $inmateId, 'mother')
                        ],
                        'spouse' => ($inmate && property_exists($inmate, 'civil_status') && $inmate->civil_status === 'Married') ? 'Married' : 'N/A',
                        'nextOfKin' => $this->extractFamilyMembers($allVisitors, $inmateId, ['sister', 'brother', 'sibling']),
                        'avatar_path' => ($inmate && property_exists($inmate, 'avatar_path')) ? ($inmate->avatar_path ?? null) : null,
                        'avatar_filename' => ($inmate && property_exists($inmate, 'avatar_filename')) ? ($inmate->avatar_filename ?? null) : null,
                        'id' => $inmateId
                    ],
                    'inmate' => [
                        'id' => $inmateId,
                        'first_name' => ($inmate && property_exists($inmate, 'first_name')) ? ($inmate->first_name ?? null) : null,
                        'last_name' => ($inmate && property_exists($inmate, 'last_name')) ? ($inmate->last_name ?? null) : null,
                        'middle_name' => ($inmate && property_exists($inmate, 'middle_name')) ? ($inmate->middle_name ?? null) : null,
                        'name' => $inmateName,
                        'birthdate' => ($inmate && property_exists($inmate, 'birthdate')) ? ($inmate->birthdate ?? null) : null,
                        'date_of_birth' => ($inmate && property_exists($inmate, 'date_of_birth')) ? ($inmate->date_of_birth ?? null) : null,
                        'civil_status' => ($inmate && property_exists($inmate, 'civil_status')) ? ($inmate->civil_status ?? null) : null,
                        'avatar_path' => ($inmate && property_exists($inmate, 'avatar_path')) ? ($inmate->avatar_path ?? null) : null,
                        'avatar_filename' => ($inmate && property_exists($inmate, 'avatar_filename')) ? ($inmate->avatar_filename ?? null) : null
                    ]
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data->values()->toArray(),
                'meta' => [
                    'current_page' => $page,
                    'last_page' => $lastPage,
                    'per_page' => $perPage,
                    'total' => $total
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
                'reason_for_visit' => 'nullable|string|max:500',
                'reference_number' => 'nullable|string|max:20',
                'status' => 'sometimes|integer|in:0,1,2' // 0=Declined, 1=Approved, 2=Pending
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Auto-generate reference number if not provided (for existing visitors without one)
            // Format: VL-YYYYMMDD-XXXX (e.g., VL-20251031-0001)
            $referenceNumber = $request->reference_number;
            if (!$referenceNumber) {
                // Generate unique reference number based on today's count
                $todayCount = DB::table('visitation_logs')
                    ->whereDate('created_at', today())
                    ->count();
                $referenceNumber = 'VL-' . date('Ymd') . '-' . str_pad($todayCount + 1, 4, '0', STR_PAD_LEFT);
                
                // Ensure uniqueness in case of race conditions
                $counter = 1;
                while (DB::table('visitation_logs')->where('reference_number', $referenceNumber)->exists()) {
                    $referenceNumber = 'VL-' . date('Ymd') . '-' . str_pad($todayCount + 1 + $counter, 4, '0', STR_PAD_LEFT);
                    $counter++;
                }
            } else {
                // If reference number is provided, ensure it's unique
                if (DB::table('visitation_logs')->where('reference_number', $referenceNumber)->exists()) {
                    // Generate a new one if duplicate (e.g., if client-generated number already exists)
                    $todayCount = DB::table('visitation_logs')
                        ->whereDate('created_at', today())
                        ->count();
                    $referenceNumber = 'VL-' . date('Ymd') . '-' . str_pad($todayCount + 1, 4, '0', STR_PAD_LEFT);
                    
                    $counter = 1;
                    while (DB::table('visitation_logs')->where('reference_number', $referenceNumber)->exists()) {
                        $referenceNumber = 'VL-' . date('Ymd') . '-' . str_pad($todayCount + 1 + $counter, 4, '0', STR_PAD_LEFT);
                        $counter++;
                    }
                }
            }

            // Create visitation log entry
            $visitationLogId = DB::table('visitation_logs')->insertGetId([
                'reference_number' => $referenceNumber,
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
                    'reference_number' => $referenceNumber
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
        if (!$inmateId || (!$allVisitors || ($allVisitors instanceof \Illuminate\Support\Collection && !$allVisitors->has($inmateId)) || (!($allVisitors instanceof \Illuminate\Support\Collection) && !isset($allVisitors[$inmateId])))) {
            return 'N/A';
        }

        $visitors = $allVisitors instanceof \Illuminate\Support\Collection ? $allVisitors->get($inmateId) : $allVisitors[$inmateId];
        
        if (!$visitors || (is_iterable($visitors) && count($visitors) === 0)) {
            return 'N/A';
        }

        foreach ($visitors as $visitor) {
            $rel = is_object($visitor) && property_exists($visitor, 'relationship') ? $visitor->relationship : null;
            if ($rel && strtolower($rel) === strtolower($relationship)) {
                return (is_object($visitor) && property_exists($visitor, 'name')) ? ($visitor->name ?? 'N/A') : 'N/A';
            }
        }

        return 'N/A';
    }

    /**
     * Extract multiple family members from registered visitors by relationships (for Next of Kin)
     */
    private function extractFamilyMembers($allVisitors, $inmateId, $relationships)
    {
        if (!$inmateId || (!$allVisitors || ($allVisitors instanceof \Illuminate\Support\Collection && !$allVisitors->has($inmateId)) || (!($allVisitors instanceof \Illuminate\Support\Collection) && !isset($allVisitors[$inmateId])))) {
            return 'N/A';
        }

        $visitors = $allVisitors instanceof \Illuminate\Support\Collection ? $allVisitors->get($inmateId) : $allVisitors[$inmateId];
        
        if (!$visitors || (is_iterable($visitors) && count($visitors) === 0)) {
            return 'N/A';
        }

        $names = [];

        foreach ($visitors as $visitor) {
            $rel = is_object($visitor) && property_exists($visitor, 'relationship') ? $visitor->relationship : null;
            if ($rel) {
                $relLower = strtolower($rel);
                foreach ($relationships as $targetRel) {
                    if ($relLower === strtolower($targetRel)) {
                        $name = (is_object($visitor) && property_exists($visitor, 'name')) ? ($visitor->name ?? 'Unknown') : 'Unknown';
                        $names[] = $name;
                        break;
                    }
                }
            }
        }

        return !empty($names) ? implode(' | ', $names) : 'N/A';
    }

    /**
     * Update visitation log status (for requests page)
     */
    public function updateVisitationLogStatus(Request $request, $id)
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

        if (!Schema::hasTable('visitation_logs')) {
            return response()->json([
                'success' => false,
                'message' => 'Visitation logs not initialized'
            ], 400);
        }

        $log = DB::table('visitation_logs')->where('id', $id)->first();
        
        if (!$log) {
            return response()->json([
                'success' => false,
                'message' => 'Visitation log not found'
            ], 404);
        }

        $statusInt = (int) $request->input('status');
        $statusText = $statusInt === 1 ? 'Approved' : ($statusInt === 0 ? 'Denied' : 'Pending');

        // Check if status column is enum or integer
        $colInfo = DB::select("SHOW COLUMNS FROM visitation_logs LIKE 'status'");
        $type = strtolower($colInfo[0]->Type ?? '');
        $isEnum = str_starts_with($type, 'enum');

        $update = [
            'status' => $isEnum ? $statusText : $statusInt,
            'updated_at' => now(),
        ];

        DB::table('visitation_logs')->where('id', $id)->update($update);

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully',
            'data' => [
                'id' => $id,
                'status' => $isEnum ? $statusText : $statusInt,
            ]
        ]);
    }

    /**
     * Get visitation statistics for donut chart
     */
    public function statistics()
    {
        try {
            if (!Schema::hasTable('visitation_logs')) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'approved' => 0,
                        'pending' => 0,
                        'rejected' => 0,
                        'total' => 0
                    ]
                ]);
            }

            $stats = DB::table('visitation_logs')
                ->select(
                    DB::raw('SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as approved'),
                    DB::raw('SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as pending'),
                    DB::raw('SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as rejected'),
                    DB::raw('COUNT(*) as total')
                )
                ->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'approved' => (int) ($stats->approved ?? 0),
                    'pending' => (int) ($stats->pending ?? 0),
                    'rejected' => (int) ($stats->rejected ?? 0),
                    'total' => (int) ($stats->total ?? 0)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get weekly visitor traffic for line chart (last 7 days)
     */
    public function weeklyVisitorTraffic()
    {
        try {
            if (!Schema::hasTable('visitation_logs')) {
                return response()->json([
                    'success' => true,
                    'data' => []
                ]);
            }

            // Get data for the last 7 days
            $endDate = Carbon::now();
            $startDate = Carbon::now()->subDays(6);

            $traffic = DB::table('visitation_logs')
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('COUNT(*) as count')
                )
                ->whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
                ->groupBy(DB::raw('DATE(created_at)'))
                ->orderBy('date', 'asc')
                ->get();

            // Create array with all 7 days (fill missing days with 0)
            $data = [];
            for ($i = 0; $i < 7; $i++) {
                $date = Carbon::now()->subDays(6 - $i);
                $dateStr = $date->format('Y-m-d');
                $dayName = $date->format('D'); // Mon, Tue, Wed, etc.
                
                $count = 0;
                foreach ($traffic as $item) {
                    if ($item->date === $dateStr) {
                        $count = $item->count;
                        break;
                    }
                }

                $data[] = [
                    'date' => $dateStr,
                    'day' => $dayName,
                    'count' => $count
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch weekly traffic: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get monthly visits for bar chart (current year)
     */
    public function monthlyVisits()
    {
        try {
            if (!Schema::hasTable('visitation_logs')) {
                return response()->json([
                    'success' => true,
                    'data' => []
                ]);
            }

            $currentYear = Carbon::now()->year;

            $visits = DB::table('visitation_logs')
                ->select(
                    DB::raw('MONTH(created_at) as month'),
                    DB::raw('COUNT(*) as count')
                )
                ->whereYear('created_at', $currentYear)
                ->groupBy(DB::raw('MONTH(created_at)'))
                ->orderBy('month', 'asc')
                ->get();

            // Create array with all 12 months (fill missing months with 0)
            $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            $data = [];
            
            for ($i = 1; $i <= 12; $i++) {
                $count = 0;
                foreach ($visits as $visit) {
                    if ($visit->month == $i) {
                        $count = $visit->count;
                        break;
                    }
                }

                $data[] = [
                    'month' => $i,
                    'monthName' => $monthNames[$i - 1],
                    'count' => $count
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $data,
                'year' => $currentYear
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch monthly visits: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get upcoming schedules (next 3 scheduled visits)
     */
    public function upcomingSchedules()
    {
        try {
            if (!Schema::hasTable('visitation_logs')) {
                return response()->json([
                    'success' => true,
                    'data' => []
                ]);
            }

            $now = Carbon::now();

            // Get upcoming schedules (schedule >= now), ordered by schedule datetime
            $schedules = DB::table('visitation_logs')
                ->select('visitation_logs.*', 'visitors.name as visitor_name', 'visitors.relationship')
                ->leftJoin('visitors', 'visitation_logs.visitor_id', '=', 'visitors.id')
                ->where('visitation_logs.schedule', '>=', $now)
                ->whereNull('visitation_logs.time_in') // Not yet started
                ->orderBy('visitation_logs.schedule', 'asc')
                ->orderBy('visitation_logs.created_at', 'asc')
                ->limit(3)
                ->get();

            $data = $schedules->map(function($schedule) use ($now) {
                $scheduleDate = Carbon::parse($schedule->schedule);
                $isToday = $scheduleDate->isToday();
                
                // Determine badge status
                $badgeStatus = 'pending';
                $badgeText = 'Pending';
                
                if ($isToday) {
                    $badgeStatus = 'today';
                    $badgeText = 'Today';
                } elseif ($schedule->status == 1) {
                    $badgeStatus = 'approved';
                    $badgeText = 'Approved';
                }

                return [
                    'id' => $schedule->id,
                    'visitor_name' => $schedule->visitor_name ?? 'Unknown Visitor',
                    'relationship' => $schedule->relationship ?? 'N/A',
                    'reason_for_visit' => $schedule->reason_for_visit ?? 'General Visit',
                    'schedule' => $schedule->schedule,
                    'formatted_date' => $scheduleDate->format('D, g A'), // Wed, 3 PM
                    'formatted_full_date' => $scheduleDate->format('M d, Y g:i A'),
                    'status' => $schedule->status,
                    'badge_status' => $badgeStatus,
                    'badge_text' => $badgeText,
                    'is_today' => $isToday
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch upcoming schedules: ' . $e->getMessage()
            ], 500);
        }
    }
}
