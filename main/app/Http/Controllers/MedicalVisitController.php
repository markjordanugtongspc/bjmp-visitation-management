<?php

namespace App\Http\Controllers;

use App\Models\MedicalVisit;
use App\Models\Inmate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class MedicalVisitController extends Controller
{
    /**
     * Display a listing of medical visits for a specific inmate.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'inmate_id' => 'required|exists:inmates,id',
            'status' => 'sometimes|in:scheduled,completed,missed,cancelled',
            'visit_type' => 'sometimes|in:one-time,recurring',
        ]);

        $query = MedicalVisit::with(['inmate', 'creator'])
            ->forInmate($request->inmate_id)
            ->orderBy('scheduled_at', 'desc');

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by visit type if provided
        if ($request->has('visit_type')) {
            $query->where('visit_type', $request->visit_type);
        }

        $visits = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $visits->items(),
            'pagination' => [
                'current_page' => $visits->currentPage(),
                'last_page' => $visits->lastPage(),
                'per_page' => $visits->perPage(),
                'total' => $visits->total(),
            ]
        ]);
    }

    /**
     * Store a newly created medical visit.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'inmate_id' => 'required|exists:inmates,id',
            'scheduled_at' => 'required|date|after:now',
            'visit_type' => 'required|in:one-time,recurring',
            'recurring_frequency' => 'required_if:visit_type,recurring|in:daily,weekly,monthly',
            'recurring_until' => 'required_if:visit_type,recurring|date|after:scheduled_at',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Check if user has permission to create medical visits
        $user = auth()->user();
        if (!$user->isHeadNurse() && !$user->isNurse()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only nurses can schedule medical visits.'
            ], 403);
        }

        $visit = MedicalVisit::create([
            'inmate_id' => $request->inmate_id,
            'scheduled_at' => $request->scheduled_at,
            'visit_type' => $request->visit_type,
            'recurring_frequency' => $request->recurring_frequency,
            'recurring_until' => $request->recurring_until,
            'notes' => $request->notes,
            'created_by' => $user->id,
        ]);

        // Load relationships for response
        $visit->load(['inmate', 'creator']);

        return response()->json([
            'success' => true,
            'message' => 'Medical visit scheduled successfully.',
            'data' => $visit
        ], 201);
    }

    /**
     * Display the specified medical visit.
     */
    public function show(string $id): JsonResponse
    {
        $visit = MedicalVisit::with(['inmate', 'creator'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $visit
        ]);
    }

    /**
     * Update the specified medical visit.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $visit = MedicalVisit::findOrFail($id);

        $request->validate([
            'scheduled_at' => 'sometimes|date|after:now',
            'visit_type' => 'sometimes|in:one-time,recurring',
            'recurring_frequency' => 'required_if:visit_type,recurring|in:daily,weekly,monthly',
            'recurring_until' => 'required_if:visit_type,recurring|date|after:scheduled_at',
            'status' => 'sometimes|in:scheduled,completed,missed,cancelled',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Check if user has permission to update medical visits
        $user = auth()->user();
        if (!$user->isHeadNurse() && !$user->isNurse()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only nurses can update medical visits.'
            ], 403);
        }

        $visit->update($request->only([
            'scheduled_at',
            'visit_type',
            'recurring_frequency',
            'recurring_until',
            'status',
            'notes'
        ]));

        // Load relationships for response
        $visit->load(['inmate', 'creator']);

        return response()->json([
            'success' => true,
            'message' => 'Medical visit updated successfully.',
            'data' => $visit
        ]);
    }

    /**
     * Remove the specified medical visit from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $visit = MedicalVisit::findOrFail($id);

        // Check if user has permission to delete medical visits
        $user = auth()->user();
        if (!$user->isHeadNurse() && !$user->isNurse()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only nurses can delete medical visits.'
            ], 403);
        }

        $visit->delete();

        return response()->json([
            'success' => true,
            'message' => 'Medical visit deleted successfully.'
        ]);
    }

    /**
     * Get upcoming medical visits for all inmates.
     */
    public function upcoming(Request $request): JsonResponse
    {
        $query = MedicalVisit::with(['inmate', 'creator'])
            ->upcoming()
            ->orderBy('scheduled_at', 'asc');

        // Filter by date range if provided
        if ($request->has('from')) {
            $query->where('scheduled_at', '>=', $request->from);
        }

        if ($request->has('to')) {
            $query->where('scheduled_at', '<=', $request->to);
        }

        $visits = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $visits->items(),
            'pagination' => [
                'current_page' => $visits->currentPage(),
                'last_page' => $visits->lastPage(),
                'per_page' => $visits->perPage(),
                'total' => $visits->total(),
            ]
        ]);
    }

    /**
     * Mark a medical visit as completed.
     */
    public function markCompleted(Request $request, string $id): JsonResponse
    {
        $visit = MedicalVisit::findOrFail($id);

        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        // Check if user has permission to mark visits as completed
        $user = auth()->user();
        if (!$user->isHeadNurse() && !$user->isNurse()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only nurses can mark visits as completed.'
            ], 403);
        }

        $visit->update([
            'status' => 'completed',
            'notes' => $request->notes ? $visit->notes . "\n\nCompleted: " . $request->notes : $visit->notes
        ]);

        // Load relationships for response
        $visit->load(['inmate', 'creator']);

        return response()->json([
            'success' => true,
            'message' => 'Medical visit marked as completed.',
            'data' => $visit
        ]);
    }

    /**
     * Get medical visit statistics.
     */
    public function statistics(Request $request): JsonResponse
    {
        $query = MedicalVisit::query();

        // Filter by inmate if provided
        if ($request->has('inmate_id')) {
            $query->forInmate($request->inmate_id);
        }

        // Filter by date range if provided
        if ($request->has('from')) {
            $query->where('scheduled_at', '>=', $request->from);
        }

        if ($request->has('to')) {
            $query->where('scheduled_at', '<=', $request->to);
        }

        $statistics = [
            'total' => $query->count(),
            'scheduled' => $query->clone()->scheduled()->count(),
            'completed' => $query->clone()->completed()->count(),
            'missed' => $query->clone()->where('status', 'missed')->count(),
            'cancelled' => $query->clone()->where('status', 'cancelled')->count(),
            'one_time' => $query->clone()->where('visit_type', 'one-time')->count(),
            'recurring' => $query->clone()->where('visit_type', 'recurring')->count(),
            'upcoming' => $query->clone()->upcoming()->count(),
            'overdue' => $query->clone()->where('scheduled_at', '<', now())->scheduled()->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $statistics
        ]);
    }
}
