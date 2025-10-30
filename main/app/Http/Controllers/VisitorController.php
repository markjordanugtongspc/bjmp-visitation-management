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
}
