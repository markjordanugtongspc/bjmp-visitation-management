<?php

namespace App\Http\Controllers;

use App\Models\FacialRecognitionLog;
use App\Models\FacialRecognitionVisitationRequest;
use App\Models\Visitor;
use App\Models\Inmate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;

class FacialRecognitionController extends Controller
{
    /**
     * Display facial recognition page
     */
    public function index()
    {
        return view('facial-recognition');
    }

    /**
     * Get all registered visitor faces for matching
     */
    public function getRegisteredFaces()
    {
        try {
            $visitors = Visitor::whereNotNull('avatar_path')
                ->whereNotNull('avatar_filename')
                ->where('is_allowed', true)
                ->with('inmate')
                ->get()
                ->map(function ($visitor) {
                    $avatarUrl = null;
                    if ($visitor->avatar_path && $visitor->avatar_filename) {
                        $fullPath = $visitor->avatar_path . '/' . $visitor->avatar_filename;
                        $avatarUrl = Storage::url($fullPath);
                    }

                    $allowedInmates = [];
                    if ($visitor->inmate) {
                        $allowedInmates[] = [
                            'id' => $visitor->inmate->id,
                            'name' => $visitor->inmate->first_name . ' ' . $visitor->inmate->last_name,
                            'inmate_number' => 'INM-' . str_pad($visitor->inmate->id, 6, '0', STR_PAD_LEFT),
                            'cell_location' => $this->getCellLocation($visitor->inmate),
                        ];
                    }

                    return [
                        'id' => $visitor->id,
                        'name' => $visitor->name,
                        'avatar_url' => $avatarUrl,
                        'allowed_inmates' => $allowedInmates,
                    ];
                });

            return response()->json([
                'success' => true,
                'visitors' => $visitors,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching registered faces: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching registered faces: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Match detected face against registered visitors
     */
    public function matchFace(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'face_descriptor' => 'required|array',
            'detected_age' => 'nullable|integer',
            'detected_gender' => 'nullable|string|in:male,female,unknown',
            'landmarks_count' => 'nullable|integer',
            'detection_metadata' => 'nullable|array',
            'confidence_threshold' => 'nullable|numeric|min:0|max:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $faceDescriptor = $request->face_descriptor;
            $confidenceThreshold = $request->confidence_threshold ?? 0.7;

            // Create facial recognition log
            $log = FacialRecognitionLog::create([
                'detected_age' => $request->detected_age,
                'detected_gender' => $request->detected_gender ?? 'unknown',
                'landmarks_count' => $request->landmarks_count ?? 68,
                'confidence_threshold' => $confidenceThreshold,
                'face_descriptor' => $faceDescriptor,
                'detection_metadata' => $request->detection_metadata,
                'session_id' => session()->getId(),
                'device_info' => $request->header('User-Agent'),
                'ip_address' => $request->ip(),
                'detection_timestamp' => now(),
                'processed_by' => auth()->id(),
            ]);

            // Note: Actual face matching would be done on the frontend with face-api.js
            // This endpoint is for logging and preparing data
            // The frontend will send back the matched visitor ID

            return response()->json([
                'success' => true,
                'log_id' => $log->id,
                'message' => 'Face detection logged successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Error in face matching: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error processing face match',
            ], 500);
        }
    }

    /**
     * Confirm match and update log with matched visitor
     */
    public function confirmMatch(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'log_id' => 'required|exists:facial_recognition_logs,id',
            'visitor_id' => 'required|exists:visitors,id',
            'match_confidence' => 'required|numeric|min:0|max:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $log = FacialRecognitionLog::findOrFail($request->log_id);
            $visitor = Visitor::with('inmate')->findOrFail($request->visitor_id);

            $log->update([
                'matched_visitor_id' => $visitor->id,
                'match_confidence' => $request->match_confidence,
                'match_status' => 'matched',
                'is_match_successful' => true,
                'processed_by' => auth()->id(),
            ]);

            $allowedInmates = [];
            if ($visitor->inmate) {
                $allowedInmates[] = [
                    'id' => $visitor->inmate->id,
                    'name' => $visitor->inmate->first_name . ' ' . $visitor->inmate->last_name,
                    'inmate_number' => 'INM-' . str_pad($visitor->inmate->id, 6, '0', STR_PAD_LEFT),
                    'cell_location' => $this->getCellLocation($visitor->inmate),
                ];
            }

            return response()->json([
                'success' => true,
                'visitor' => [
                    'id' => $visitor->id,
                    'name' => $visitor->name,
                    'email' => $visitor->email,
                    'phone' => $visitor->phone,
                    'allowed_inmates' => $allowedInmates,
                ],
                'message' => 'Face match confirmed successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Error confirming face match: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error confirming face match: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create visitation request from facial recognition
     */
    public function createVisitationRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'log_id' => 'required|exists:facial_recognition_logs,id',
            'visitor_id' => 'required|exists:visitors,id',
            'inmate_id' => 'required|exists:inmates,id',
            'visit_date' => 'required|date|after_or_equal:today',
            'visit_time' => 'required|date_format:H:i',
            'duration_minutes' => 'nullable|integer|min:15|max:120',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Verify that the visitor is allowed to visit this inmate
            $visitor = Visitor::findOrFail($request->visitor_id);
            
            // Check if the visitor is associated with this specific inmate
            if ($visitor->inmate_id != $request->inmate_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Visitor is not authorized to visit this inmate',
                ], 403);
            }

            // Create visitation request
            $visitationRequest = FacialRecognitionVisitationRequest::create([
                'facial_recognition_log_id' => $request->log_id,
                'visitor_id' => $request->visitor_id,
                'inmate_id' => $request->inmate_id,
                'visit_date' => $request->visit_date,
                'visit_time' => $request->visit_time,
                'duration_minutes' => $request->duration_minutes ?? 30,
                'notes' => $request->notes,
                'status' => 'pending',
                'is_auto_generated' => true,
            ]);

            $visitationRequest->load(['visitor', 'inmate', 'facialRecognitionLog']);

            return response()->json([
                'success' => true,
                'visitation_request' => [
                    'id' => $visitationRequest->id,
                    'visitor_name' => $visitationRequest->visitor->first_name . ' ' . $visitationRequest->visitor->last_name,
                    'inmate_name' => $visitationRequest->inmate->first_name . ' ' . $visitationRequest->inmate->last_name,
                    'visit_date' => $visitationRequest->visit_date->format('Y-m-d'),
                    'visit_time' => $visitationRequest->visit_time->format('H:i'),
                    'status' => $visitationRequest->status,
                    'confidence' => $visitationRequest->facialRecognitionLog->confidence_percentage,
                ],
                'message' => 'Visitation request created successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating visitation request: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error creating visitation request: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get recent facial recognition logs
     */
    public function getRecentLogs(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 10);
            $logs = FacialRecognitionLog::with(['matchedVisitor', 'visitationRequest.inmate'])
                ->orderBy('detection_timestamp', 'desc')
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'logs' => $logs,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching logs: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching logs',
            ], 500);
        }
    }

    /**
     * Get visitation requests
     */
    public function getVisitationRequests(Request $request)
    {
        try {
            $status = $request->get('status');
            $perPage = $request->get('per_page', 10);

            $query = FacialRecognitionVisitationRequest::with([
                'visitor',
                'inmate',
                'facialRecognitionLog',
                'approvedBy'
            ])->orderBy('created_at', 'desc');

            if ($status) {
                $query->where('status', $status);
            }

            $requests = $query->paginate($perPage);

            // Transform the data to include full inmate details
            $requests->getCollection()->transform(function ($request) {
                $inmateData = null;
                if ($request->inmate) {
                    $inmateData = [
                        'id' => $request->inmate->id,
                        'name' => $request->inmate->first_name . ' ' . $request->inmate->last_name,
                        'full_name' => $request->inmate->first_name . ' ' . $request->inmate->last_name,
                        'first_name' => $request->inmate->first_name,
                        'last_name' => $request->inmate->last_name,
                        'inmate_number' => 'INM-' . str_pad($request->inmate->id, 6, '0', STR_PAD_LEFT),
                        'current_facility' => $this->getCellLocation($request->inmate),
                    ];
                }

                $visitorData = null;
                if ($request->visitor) {
                    $visitorData = [
                        'id' => $request->visitor->id,
                        'name' => $request->visitor->name,
                        'full_name' => $request->visitor->name,
                    ];
                }

                $frLogData = null;
                if ($request->facialRecognitionLog) {
                    $frLogData = [
                        'id' => $request->facialRecognitionLog->id,
                        'confidence_percentage' => round($request->facialRecognitionLog->match_confidence * 100, 0),
                        'match_status' => $request->facialRecognitionLog->match_status,
                    ];
                }

                return [
                    'id' => $request->id,
                    'visitor' => $visitorData,
                    'inmate' => $inmateData,
                    'facial_recognition_log' => $frLogData,
                    'visit_date' => $request->visit_date,
                    'visit_time' => $request->visit_time,
                    'duration_minutes' => $request->duration_minutes,
                    'status' => $request->status,
                    'notes' => $request->notes,
                    'checked_in_at' => $request->checked_in_at,
                    'checked_out_at' => $request->checked_out_at,
                    'created_at' => $request->created_at,
                    'updated_at' => $request->updated_at,
                ];
            });

            return response()->json([
                'success' => true,
                'requests' => $requests,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching visitation requests: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching visitation requests',
            ], 500);
        }
    }

    /**
     * Get pending visitation requests for notifications
     */
    public function getPendingVisitationRequests()
    {
        try {
            $requests = FacialRecognitionVisitationRequest::with([
                'visitor',
                'inmate',
                'facialRecognitionLog'
            ])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

            // Transform the data to match notification format
            $requests = $requests->map(function ($request) {
                $inmateData = null;
                if ($request->inmate) {
                    $inmateData = [
                        'id' => $request->inmate->id,
                        'inmate_id' => $request->inmate->id,
                        'name' => $request->inmate->first_name . ' ' . $request->inmate->last_name,
                        'full_name' => $request->inmate->first_name . ' ' . $request->inmate->last_name,
                        'first_name' => $request->inmate->first_name,
                        'last_name' => $request->inmate->last_name,
                        'current_facility' => $this->getCellLocation($request->inmate),
                    ];
                }

                $visitorData = null;
                if ($request->visitor) {
                    $nameParts = $request->visitor->name ? explode(' ', $request->visitor->name, 2) : [];
                    $visitorData = [
                        'id' => $request->visitor->id,
                        'visitor_id' => $request->visitor->id,
                        'name' => $request->visitor->name,
                        'full_name' => $request->visitor->name,
                        'first_name' => $nameParts[0] ?? null,
                        'last_name' => $nameParts[1] ?? null,
                    ];
                }

                $frLogData = null;
                if ($request->facialRecognitionLog) {
                    $frLogData = [
                        'id' => $request->facialRecognitionLog->id,
                        'confidence_percentage' => round($request->facialRecognitionLog->match_confidence * 100, 0),
                        'match_status' => $request->facialRecognitionLog->match_status,
                    ];
                }

                return [
                    'id' => $request->id,
                    'visitor' => $visitorData,
                    'inmate' => $inmateData,
                    'facial_recognition_log' => $frLogData,
                    'visit_date' => $request->visit_date,
                    'visit_time' => $request->visit_time,
                    'duration_minutes' => $request->duration_minutes,
                    'status' => $request->status,
                    'notes' => $request->notes,
                    'created_at' => $request->created_at,
                    'updated_at' => $request->updated_at,
                ];
            });

            return response()->json([
                'success' => true,
                'requests' => $requests,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching pending facial recognition requests: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching pending requests',
                'requests' => [],
            ], 500);
        }
    }

    /**
     * Approve a facial recognition visitation request
     */
    public function approveVisitationRequest($id)
    {
        try {
            $request = FacialRecognitionVisitationRequest::findOrFail($id);
            
            if ($request->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Request is not pending',
                ], 400);
            }
            
            $request->update([
                'status' => 'approved',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Visitation request approved successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Error approving facial recognition request: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error approving request',
            ], 500);
        }
    }

    /**
     * Decline a facial recognition visitation request
     */
    public function declineVisitationRequest(Request $request, $id)
    {
        try {
            $visitationRequest = FacialRecognitionVisitationRequest::findOrFail($id);
            
            if ($visitationRequest->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Request is not pending',
                ], 400);
            }
            
            $validator = Validator::make($request->all(), [
                'reason' => 'required|string|min:10|max:1000',
                'visitor_id' => 'nullable|exists:visitors,id',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }
            
            $visitationRequest->update([
                'status' => 'rejected',
                'rejection_reason' => $request->reason,
            ]);
            
            // TODO: Send notification to visitor if visitor_id is provided
            
            return response()->json([
                'success' => true,
                'message' => 'Visitation request declined successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Error declining facial recognition request: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error declining request',
            ], 500);
        }
    }

    /**
     * Get cell location for an inmate
     */
    private function getCellLocation($inmate)
    {
        if (!$inmate->cell_id) {
            return 'Not Assigned';
        }
        
        $cell = \DB::table('cells')->find($inmate->cell_id);
        if ($cell) {
            return $cell->name ?: $cell->location ?: 'Cell ' . $inmate->cell_id;
        }
        
        return 'Unknown';
    }

    /**
     * PUBLIC: Get all registered visitor faces for matching (No authentication required)
     */
    public function getRegisteredFacesPublic()
    {
        try {
            $visitors = Visitor::whereNotNull('avatar_path')
                ->whereNotNull('avatar_filename')
                ->where('is_allowed', true)
                ->with('inmate')
                ->get()
                ->map(function ($visitor) {
                    $avatarUrl = null;
                    if ($visitor->avatar_path && $visitor->avatar_filename) {
                        $fullPath = $visitor->avatar_path . '/' . $visitor->avatar_filename;
                        // Use asset() to ensure absolute URL
                        $avatarUrl = asset('storage/' . $fullPath);
                    }

                    $allowedInmates = [];
                    if ($visitor->inmate) {
                        $allowedInmates[] = [
                            'id' => $visitor->inmate->id,
                            'name' => $visitor->inmate->first_name . ' ' . $visitor->inmate->last_name,
                            'inmate_number' => 'INM-' . str_pad($visitor->inmate->id, 6, '0', STR_PAD_LEFT),
                            'cell_location' => $this->getCellLocation($visitor->inmate),
                        ];
                    }

                    return [
                        'id' => $visitor->id,
                        'name' => $visitor->name,
                        'avatar_url' => $avatarUrl,
                        'allowed_inmates' => $allowedInmates,
                    ];
                });

            return response()->json([
                'success' => true,
                'visitors' => $visitors,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching registered faces (public): ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching registered faces',
                'visitors' => [],
            ], 500);
        }
    }

    /**
     * PUBLIC: Match detected face against registered visitors (No authentication required)
     */
    public function matchFacePublic(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'face_descriptor' => 'required|array',
            'detected_age' => 'nullable|integer',
            'detected_gender' => 'nullable|string|in:male,female,unknown',
            'landmarks_count' => 'nullable|integer',
            'detection_metadata' => 'nullable|array',
            'confidence_threshold' => 'nullable|numeric|min:0|max:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $faceDescriptor = $request->face_descriptor;
            $confidenceThreshold = $request->confidence_threshold ?? 0.7;

            // Create facial recognition log (no auth required for public)
            $log = FacialRecognitionLog::create([
                'detected_age' => $request->detected_age,
                'detected_gender' => $request->detected_gender ?? 'unknown',
                'landmarks_count' => $request->landmarks_count ?? 68,
                'confidence_threshold' => $confidenceThreshold,
                'face_descriptor' => $faceDescriptor,
                'detection_metadata' => $request->detection_metadata,
                'session_id' => session()->getId(),
                'device_info' => $request->header('User-Agent'),
                'ip_address' => $request->ip(),
                'detection_timestamp' => now(),
                'processed_by' => null, // No auth required for public
            ]);

            return response()->json([
                'success' => true,
                'log_id' => $log->id,
                'message' => 'Face detection logged successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Error in face matching (public): ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error processing face match',
            ], 500);
        }
    }

    /**
     * PUBLIC: Confirm match and update log with matched visitor (No authentication required)
     */
    public function confirmMatchPublic(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'log_id' => 'required|exists:facial_recognition_logs,id',
            'visitor_id' => 'required|exists:visitors,id',
            'match_confidence' => 'required|numeric|min:0|max:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $log = FacialRecognitionLog::findOrFail($request->log_id);
            $visitor = Visitor::with('inmate')->findOrFail($request->visitor_id);

            $log->update([
                'matched_visitor_id' => $visitor->id,
                'match_confidence' => $request->match_confidence,
                'match_status' => 'matched',
                'is_match_successful' => true,
                'processed_by' => null, // No auth required for public
            ]);

            $allowedInmates = [];
            if ($visitor->inmate) {
                $allowedInmates[] = [
                    'id' => $visitor->inmate->id,
                    'name' => $visitor->inmate->first_name . ' ' . $visitor->inmate->last_name,
                    'inmate_number' => 'INM-' . str_pad($visitor->inmate->id, 6, '0', STR_PAD_LEFT),
                    'cell_location' => $this->getCellLocation($visitor->inmate),
                ];
            }

            return response()->json([
                'success' => true,
                'visitor' => [
                    'id' => $visitor->id,
                    'name' => $visitor->name,
                    'email' => $visitor->email,
                    'phone' => $visitor->phone,
                    'allowed_inmates' => $allowedInmates,
                ],
                'message' => 'Face match confirmed successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Error confirming face match (public): ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error confirming face match',
            ], 500);
        }
    }

    /**
     * PUBLIC: Create visitation request from facial recognition (No authentication required)
     */
    public function createVisitationRequestPublic(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'log_id' => 'required|exists:facial_recognition_logs,id',
            'visitor_id' => 'required|exists:visitors,id',
            'inmate_id' => 'required|exists:inmates,id',
            'visit_date' => 'required|date|after_or_equal:today',
            'visit_time' => 'required|date_format:H:i',
            'duration_minutes' => 'nullable|integer|min:15|max:120',
            'reason' => 'nullable|string|max:1000',
            'match_confidence' => 'nullable|numeric|min:0|max:1',
        ]);

        if ($validator->fails()) {
            Log::warning('Facial recognition request validation failed', [
                'errors' => $validator->errors(),
                'request_data' => $request->except(['match_confidence'])
            ]);
            
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Validation failed',
            ], 422);
        }

        try {
            // Verify that the visitor is allowed to visit this inmate
            $visitor = Visitor::findOrFail($request->visitor_id);
            
            // Check if the visitor is associated with this specific inmate
            if ($visitor->inmate_id != $request->inmate_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Visitor is not authorized to visit this inmate',
                ], 403);
            }

            // Create visitation request
            $visitationRequest = FacialRecognitionVisitationRequest::create([
                'facial_recognition_log_id' => $request->log_id,
                'visitor_id' => $request->visitor_id,
                'inmate_id' => $request->inmate_id,
                'visit_date' => $request->visit_date,
                'visit_time' => $request->visit_time,
                'duration_minutes' => $request->duration_minutes ?? 30,
                'notes' => $request->reason ?? $request->notes,
                'status' => 'pending',
                'is_auto_generated' => true,
            ]);

            $visitationRequest->load(['visitor', 'inmate', 'facialRecognitionLog']);

            return response()->json([
                'success' => true,
                'visitation_request' => [
                    'id' => $visitationRequest->id,
                    'visitor_name' => $visitationRequest->visitor->name,
                    'inmate_name' => $visitationRequest->inmate->first_name . ' ' . $visitationRequest->inmate->last_name,
                    'visit_date' => $visitationRequest->visit_date->format('Y-m-d'),
                    'visit_time' => $visitationRequest->visit_time->format('H:i'),
                    'status' => $visitationRequest->status,
                ],
                'message' => 'Visitation request created successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating visitation request (public): ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error creating visitation request: ' . $e->getMessage(),
            ], 500);
        }
    }
}
