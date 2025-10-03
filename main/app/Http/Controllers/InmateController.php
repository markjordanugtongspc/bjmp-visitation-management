<?php

namespace App\Http\Controllers;

use App\Models\Inmate;
use App\Services\InmateService;
use App\Http\Requests\StoreInmateRequest;
use App\Http\Requests\UpdateInmateRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class InmateController extends Controller
{
    public function __construct(
        private InmateService $inmateService
    ) {}

        /**
         * Display a listing of inmates.
         */
        public function index(Request $request): JsonResponse
        {
            try {
                $filters = $request->only(['search', 'status', 'gender', 'medical_status', 'cell_id']);
                $perPage = $request->get('per_page', 15);
                
                $inmates = $this->inmateService->getAll($filters, $perPage);
                $statistics = $this->inmateService->getStatistics();

                // Transform inmates data to match frontend expectations
                $transformedInmates = $inmates->getCollection()->map(function ($inmate) {
                    return $this->transformInmateForFrontend($inmate);
                });

                $inmates->setCollection($transformedInmates);

                return response()->json([
                    'success' => true,
                    'data' => $inmates,
                    'statistics' => $statistics,
                    'message' => 'Inmates retrieved successfully'
                ]);

            } catch (\Exception $e) {
                Log::error('Failed to retrieve inmates', [
                    'error' => $e->getMessage(),
                    'filters' => $request->only(['search', 'status', 'gender', 'medical_status', 'cell_id'])
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to retrieve inmates',
                    'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }

        /**
         * Store a newly created inmate.
         */
        public function store(StoreInmateRequest $request): JsonResponse
        {
            try {
                $inmate = $this->inmateService->create($request);

                return response()->json([
                    'success' => true,
                    'data' => $this->transformInmateForFrontend($inmate->load(['admittedBy', 'cell'])),
                    'message' => 'Inmate created successfully'
                ], Response::HTTP_CREATED);

            } catch (\Exception $e) {
                Log::error('Failed to create inmate', [
                    'error' => $e->getMessage(),
                    'data' => $request->validated()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create inmate',
                    'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }

        /**
         * Display the specified inmate.
         */
        public function show(int $id): JsonResponse
        {
            try {
                $inmate = $this->inmateService->getById($id);

                if (!$inmate) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Inmate not found'
                    ], Response::HTTP_NOT_FOUND);
                }

                return response()->json([
                    'success' => true,
                    'data' => $this->transformInmateForFrontend($inmate),
                    'message' => 'Inmate retrieved successfully'
                ]);

            } catch (\Exception $e) {
                Log::error('Failed to retrieve inmate', [
                    'inmate_id' => $id,
                    'error' => $e->getMessage()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to retrieve inmate',
                    'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }

        /**
         * Update the specified inmate.
         */
        public function update(UpdateInmateRequest $request, int $id): JsonResponse
        {
            try {
                $inmate = $this->inmateService->update($id, $request);

                return response()->json([
                    'success' => true,
                    'data' => $this->transformInmateForFrontend($inmate),
                    'message' => 'Inmate updated successfully'
                ]);

            } catch (\Exception $e) {
                Log::error('Failed to update inmate', [
                    'inmate_id' => $id,
                    'error' => $e->getMessage(),
                    'data' => $request->validated()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update inmate',
                    'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }

    /**
     * Remove the specified inmate.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->inmateService->delete($id);

            return response()->json([
                'success' => true,
                'message' => 'Inmate deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to delete inmate', [
                'inmate_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete inmate',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get inmates statistics.
     */
    public function statistics(): JsonResponse
    {
        try {
            $statistics = $this->inmateService->getStatistics();

            return response()->json([
                'success' => true,
                'data' => $statistics,
                'message' => 'Statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve statistics', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update inmate points.
     */
    public function updatePoints(Request $request, int $id): JsonResponse
    {
        try {
            $request->validate([
                'points' => ['required', 'integer'],
                'activity' => ['required', 'string', 'max:255'],
                'note' => ['nullable', 'string']
            ]);

            $inmate = $this->inmateService->updatePoints(
                $id,
                $request->input('points'),
                $request->input('activity'),
                $request->input('note')
            );

            return response()->json([
                'success' => true,
                'data' => $inmate,
                'message' => 'Points updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update inmate points', [
                'inmate_id' => $id,
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update points',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Search inmates by name.
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'query' => ['required', 'string', 'min:2', 'max:255']
            ]);

            $inmates = Inmate::search($request->input('query'))
                ->with(['admittedBy', 'cell'])
                ->limit(10)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $inmates,
                'message' => 'Search completed successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to search inmates', [
                'query' => $request->input('query'),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to search inmates',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }

        /**
         * Transform inmate data from backend format to frontend format
         */
        private function transformInmateForFrontend($inmate)
        {
            return [
                'id' => $inmate->id,
                'firstName' => $inmate->first_name,
                'middleName' => $inmate->middle_name,
                'lastName' => $inmate->last_name,
                'fullName' => $inmate->full_name,
                'dateOfBirth' => $inmate->birthdate?->format('Y-m-d'),
                'age' => $inmate->age,
                'gender' => $inmate->gender,
                'civilStatus' => $inmate->civil_status,
                'addressLine1' => $inmate->address_line1,
                'addressLine2' => $inmate->address_line2,
                'city' => $inmate->city,
                'province' => $inmate->province,
                'postalCode' => $inmate->postal_code,
                'country' => $inmate->country,
                'fullAddress' => $inmate->full_address,
                'crime' => $inmate->crime,
                'sentence' => $inmate->sentence,
                'job' => $inmate->job,
                'admissionDate' => $inmate->date_of_admission?->format('Y-m-d'),
                'status' => $inmate->status,
                'cellId' => $inmate->cell_id,
                'cellNumber' => $inmate->cell ? $inmate->cell->name : 'Not Assigned',
                'admittedByUserId' => $inmate->admitted_by_user_id,
                'admittedBy' => $inmate->admittedBy ? $inmate->admittedBy->name : null,
                'medicalStatus' => $inmate->medical_status,
                'lastMedicalCheck' => $inmate->last_medical_check?->format('Y-m-d'),
                'medicalNotes' => $inmate->medical_notes,
                'initialPoints' => $inmate->initial_points,
                'currentPoints' => $inmate->current_points,
                'daysInCustody' => $inmate->days_in_custody,
                'createdAt' => $inmate->created_at?->format('Y-m-d H:i:s'),
                'updatedAt' => $inmate->updated_at?->format('Y-m-d H:i:s'),
            ];
        }
    }
