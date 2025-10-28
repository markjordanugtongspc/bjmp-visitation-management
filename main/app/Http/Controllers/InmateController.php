<?php

namespace App\Http\Controllers;

use App\Models\Inmate;
use App\Models\MedicalFile;
use App\Services\InmateService;
use App\Services\PointsService;
use App\Http\Requests\StoreInmateRequest;
use App\Http\Requests\UpdateInmateRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

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
                $inmate->load(['medicalRecords.createdBy', 'medicalFiles.uploader', 'visitors']);

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
     * Add points entry to inmate.
     */
    public function addPointsEntry(Request $request, int $id): JsonResponse
    {
        try {
            $request->validate([
                'points' => ['required', 'integer'],
                'activity' => ['required', 'string', 'max:255'],
                'notes' => ['nullable', 'string'],
                'date' => ['required', 'date']
            ]);

            $pointsService = app(PointsService::class);
            $inmate = Inmate::with('pointsHistory')->findOrFail($id);

            $pointsService->addPoints(
                $inmate,
                $request->input('points'),
                $request->input('activity'),
                $request->input('notes'),
                Carbon::parse($request->input('date'))
            );

            return response()->json([
                'success' => true,
                'data' => $this->transformInmateForFrontend($inmate->fresh(['pointsHistory', 'cell', 'admittedBy'])),
                'message' => 'Points added successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to add points entry', [
                'inmate_id' => $id,
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to add points entry',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Add medical record entry to inmate.
     */
    public function addMedicalRecord(Request $request, int $id): JsonResponse
    {
        try {
            $request->validate([
                'record_date' => ['required', 'date'],
                'diagnosis' => ['required', 'string', 'max:255'],
                'treatment' => ['required', 'string'],
                'notes' => ['nullable', 'string'],
                'vitals' => ['nullable', 'array'],
                'allergies' => ['nullable', 'array'],
                'medications' => ['nullable', 'array'],
                'medical_status' => ['nullable', 'string']
            ]);

            $medicalRecordsService = app(\App\Services\MedicalRecordsService::class);
            $inmate = Inmate::with('medicalRecords.createdBy')->findOrFail($id);

            $medicalRecordsService->addMedicalRecord(
                $inmate,
                $request->input('diagnosis'),
                $request->input('treatment'),
                $request->input('notes'),
                Carbon::parse($request->input('record_date')),
                $request->input('vitals'),
                $request->input('allergies'),
                $request->input('medications'),
                $request->input('medical_status')
            );

            return response()->json([
                'success' => true,
                'data' => $this->transformInmateForFrontend($inmate->fresh(['medicalRecords.createdBy', 'cell', 'admittedBy'])),
                'message' => 'Medical record added successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to add medical record', [
                'inmate_id' => $id,
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to add medical record',
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
            $q = $request->input('query', $request->input('q'));
            if (!is_string($q) || mb_strlen(trim($q)) < 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'The query field must be at least 2 characters.',
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $q = trim($q);

            if (method_exists(Inmate::class, 'search')) {
                $inmates = Inmate::search($q)
                    ->take(10)
                    ->get();
                $inmates->load(['admittedBy', 'cell']);
            } else {
                // Use model scopeSearch (first/middle/last name, crime, sentence, cell name)
                $inmates = Inmate::query()
                    ->with(['admittedBy', 'cell'])
                    ->search($q)
                    ->limit(10)
                    ->get();
            }

            // Transform inmates data to match frontend expectations
            $transformedInmates = $inmates->map(function ($inmate) {
                return $this->transformInmateForFrontend($inmate);
            });

            return response()->json([
                'success' => true,
                'data' => $transformedInmates,
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
                'cell_id' => $inmate->cell_id,
                'cell' => $inmate->cell ? [
                    'id' => $inmate->cell->id,
                    'name' => $inmate->cell->name,
                    'capacity' => $inmate->cell->capacity,
                    'current_count' => $inmate->cell->current_count,
                    'type' => $inmate->cell->type,
                    'location' => $inmate->cell->location,
                    'status' => $inmate->cell->status,
                ] : null,
                'cellNumber' => $inmate->cell ? $inmate->cell->name : 'Not Assigned',
                'admittedByUserId' => $inmate->admitted_by_user_id,
                'admittedBy' => $inmate->admittedBy ? $inmate->admittedBy->full_name : null,
                'medicalStatus' => $inmate->medical_status,
                'lastMedicalCheck' => $inmate->last_medical_check?->format('Y-m-d'),
                'medicalNotes' => $inmate->medical_notes,
                'initialPoints' => $inmate->initial_points,
                'currentPoints' => $inmate->current_points,
                'originalSentenceDays' => $inmate->original_sentence_days ?? null,
                'reducedSentenceDays' => $inmate->reduced_sentence_days ?? 0,
                'expectedReleaseDate' => $inmate->expected_release_date?->format('Y-m-d'),
                'adjustedReleaseDate' => $inmate->adjusted_release_date?->format('Y-m-d'),
                'pointsHistory' => $inmate->relationLoaded('pointsHistory') 
                    ? $inmate->pointsHistory->map(fn($h) => [
                        'id' => $h->id,
                        'date' => $h->activity_date->format('Y-m-d'),
                        'points' => $h->points_delta,
                        'activity' => $h->activity,
                        'note' => $h->notes,
                        'pointsBefore' => $h->points_before,
                        'pointsAfter' => $h->points_after,
                    ])->toArray()
                    : [],
                'medicalRecords' => $inmate->relationLoaded('medicalRecords') 
                    ? $inmate->medicalRecords->map(fn($m) => [
                        'id' => $m->id,
                        'date' => $m->record_date->format('Y-m-d'),
                        'diagnosis' => $m->diagnosis,
                        'treatment' => $m->treatment,
                        'notes' => $m->doctor_notes,
                        'vitals' => $m->vitals,
                        'allergies' => $m->allergies,
                        'medications' => $m->medications,
                        'recordedBy' => $m->createdBy?->full_name,
                    ])->toArray()
                    : [],
                'medicalFiles' => $inmate->relationLoaded('medicalFiles') 
                    ? $inmate->medicalFiles->map(fn($f) => [
                        'id' => $f->id,
                        'file_name' => $f->file_name,
                        'file_path' => $f->file_path,
                        'file_type' => $f->file_type,
                        'category' => $f->category,
                        'file_size' => $f->file_size,
                        'notes' => $f->notes,
                        'uploaded_by' => $f->uploader?->full_name,
                        'created_at' => $f->created_at?->format('Y-m-d H:i:s'),
                        'updated_at' => $f->updated_at?->format('Y-m-d H:i:s'),
                    ])->toArray()
                    : [],
                'allowedVisitors' => $inmate->relationLoaded('visitors') 
                    ? $inmate->visitors->map(fn($v) => [
                        'id' => $v->id,
                        'name' => $v->name,
                        'phone' => $v->phone,
                        'email' => $v->email,
                        'relationship' => $v->relationship,
                        'id_type' => $v->id_type,
                        'id_number' => $v->id_number,
                        'address' => $v->address,
                        'avatar_path' => $v->avatar_path,
                        'avatar_filename' => $v->avatar_filename,
                        'avatar_url' => $v->avatar_url,
                        'created_at' => $v->created_at?->format('Y-m-d H:i:s'),
                        'updated_at' => $v->updated_at?->format('Y-m-d H:i:s'),
                    ])->toArray()
                    : [],
                'daysInCustody' => $inmate->days_in_custody,
                'createdAt' => $inmate->created_at?->format('Y-m-d H:i:s'),
                'updatedAt' => $inmate->updated_at?->format('Y-m-d H:i:s'),
            ];
        }

    /**
     * Upload medical files for an inmate
     */
    public function uploadMedicalFile(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'files.*' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            'category' => 'required|string',
            'notes' => 'nullable|string|max:200'
        ]);
        
        $inmate = Inmate::findOrFail($id);
        $uploadedFiles = [];
        
        foreach ($request->file('files') as $file) {
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('medical/' . $inmate->id, $fileName, 'public');
            
            $medicalFile = MedicalFile::create([
                'inmate_id' => $inmate->id,
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $filePath,
                'file_type' => $file->getClientOriginalExtension(),
                'category' => $request->category,
                'file_size' => $file->getSize(),
                'notes' => $request->notes,
                'uploaded_by' => auth()->id()
            ]);
            
            $uploadedFiles[] = $medicalFile;
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Files uploaded successfully',
            'data' => $uploadedFiles
        ]);
    }

    /**
     * Get medical file details
     */
    public function getMedicalFile(int $fileId): JsonResponse
    {
        $file = MedicalFile::with(['inmate', 'uploader'])->findOrFail($fileId);
        
        return response()->json([
            'success' => true,
            'data' => $file
        ]);
    }

    /**
     * Download medical file
     */
    public function downloadMedicalFile(int $fileId)
    {
        $file = MedicalFile::findOrFail($fileId);
        
        if (!Storage::disk('public')->exists($file->file_path)) {
            abort(404, 'File not found');
        }
        
        return Storage::disk('public')->download($file->file_path, $file->file_name);
    }

    /**
     * Update medical file
     */
    public function updateMedicalFile(Request $request, int $fileId): JsonResponse
    {
        $validated = $request->validate([
            'notes' => 'nullable|string|max:200',
            'category' => 'nullable|string'
        ]);
        
        $file = MedicalFile::findOrFail($fileId);
        $file->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'File updated successfully',
            'data' => $file
        ]);
    }

    /**
     * Delete medical file
     */
    public function deleteMedicalFile(int $fileId): JsonResponse
    {
        $file = MedicalFile::findOrFail($fileId);
        
        // Delete from storage
        if (Storage::disk('public')->exists($file->file_path)) {
            Storage::disk('public')->delete($file->file_path);
        }
        
        // Delete from database
        $file->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'File deleted successfully'
        ]);
    }
}
