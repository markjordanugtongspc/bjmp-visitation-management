<?php

namespace App\Http\Controllers;

use App\Models\ConjugalVisit;
use App\Models\ConjugalVisitLog;
use App\Models\Visitor;
use App\Models\Inmate;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ConjugalVisitController extends Controller
{
    /**
     * Check if visitor has existing conjugal visit registration
     */
    public function checkRegistration(Request $request)
    {
        try {
            $request->validate([
                'visitor_id' => 'required|exists:visitors,id',
                'inmate_id' => 'required|exists:inmates,id',
            ]);

            $conjugalVisit = ConjugalVisit::where('visitor_id', $request->visitor_id)
                ->where('inmate_id', $request->inmate_id)
                ->first();

            if ($conjugalVisit) {
                $validation = $conjugalVisit->calculateValidationStatus();

                return response()->json([
                    'success' => true,
                    'registered' => true,
                    'conjugal_visit' => $conjugalVisit,
                    'status' => $conjugalVisit->status_label,
                    'relationship_start_date' => optional($conjugalVisit->relationship_start_date)->toDateString(),
                    'has_documents' => $conjugalVisit->hasRequiredDocuments(),
                    'validation' => $validation,
                    'eligible' => $conjugalVisit->isValidForConjugalVisit(),
                ]);
            }

            return response()->json([
                'success' => true,
                'registered' => false,
            ]);

        } catch (\Exception $e) {
            Log::error('Error checking conjugal visit registration: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to check registration status',
            ], 500);
        }
    }

    /**
     * Update conjugal visit registration documents or relationship date.
     *
     * This endpoint is primarily used by administrators to refresh uploaded
     * requirements. Initial creation is handled during visitor registration.
     */
    public function storeRegistration(Request $request)
    {
        try {
            $request->validate([
                'visitor_id' => 'required|exists:visitors,id',
                'inmate_id' => 'required|exists:inmates,id',
                'relationship_start_date' => 'nullable|date',
                'cohabitation_cert' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
                'marriage_contract' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            ]);

            DB::beginTransaction();

            $conjugalVisit = ConjugalVisit::where('visitor_id', $request->visitor_id)
                ->where('inmate_id', $request->inmate_id)
                ->first();

            if (!$conjugalVisit) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Conjugal visit registration not found for the specified visitor and inmate.',
                ], 404);
            }

            if ($request->filled('relationship_start_date')) {
                $this->assertRelationshipStartDate($request->relationship_start_date);
                $conjugalVisit->relationship_start_date = $request->relationship_start_date;
            }

            if ($request->hasFile('cohabitation_cert')) {
                $conjugalVisit->cohabitation_cert_path = $this->storeDocument(
                    $request->file('cohabitation_cert'),
                    'conjugal_visits/cohabitation_certificates',
                    $conjugalVisit->cohabitation_cert_path
                );
            }

            if ($request->hasFile('marriage_contract')) {
                $conjugalVisit->marriage_contract_path = $this->storeDocument(
                    $request->file('marriage_contract'),
                    'conjugal_visits/marriage_contracts',
                    $conjugalVisit->marriage_contract_path
                );
            }

            $conjugalVisit->save();

            DB::commit();

            $validation = $conjugalVisit->calculateValidationStatus();

            return response()->json([
                'success' => true,
                'message' => 'Conjugal visit registration updated successfully',
                'conjugal_visit' => $conjugalVisit->fresh(),
                'validation' => $validation,
            ]);

        } catch (ValidationException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating conjugal visit registration: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update registration: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store conjugal visit log (subsequent visits)
     */
    public function storeVisitLog(Request $request)
    {
        try {
            $request->validate([
                'conjugal_visit_id' => 'nullable|exists:conjugal_visits,id',
                'visitor_id' => 'required|exists:visitors,id',
                'inmate_id' => 'required|exists:inmates,id',
                'schedule' => 'required|date',
                'duration_minutes' => 'required|integer|in:30,35,40,45,60,120',
            ]);

            DB::beginTransaction();

            // Resolve associated conjugal visit registration
            $conjugalVisitId = $request->conjugal_visit_id;
            if ($conjugalVisitId) {
                $conjugalVisit = ConjugalVisit::findOrFail($conjugalVisitId);
                if ((int) $conjugalVisit->visitor_id !== (int) $request->visitor_id || (int) $conjugalVisit->inmate_id !== (int) $request->inmate_id) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Conjugal visit registration does not match the provided visitor or inmate.',
                    ], 422);
                }
            } else {
                $conjugalVisit = ConjugalVisit::where('visitor_id', $request->visitor_id)
                    ->where('inmate_id', $request->inmate_id)
                    ->first();

                if (!$conjugalVisit) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'No conjugal visit registration found. Please complete registration first.',
                    ], 422);
                }

                $conjugalVisitId = $conjugalVisit->id;
            }

            if (!$conjugalVisit->isApproved()) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Conjugal visit registration must be approved before requesting a visit.',
                ], 422);
            }

            $validation = $conjugalVisit->calculateValidationStatus();
            if (!$validation['is_valid']) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => $validation['reason'] ?? 'Conjugal visit registration does not meet requirements.',
                    'validation' => $validation,
                ], 422);
            }

            // Generate unique reference number
            $referenceNumber = $this->generateReferenceNumber();

            // Create visit log
            $visitLog = ConjugalVisitLog::create([
                'conjugal_visit_id' => $conjugalVisitId,
                'visitor_id' => $request->visitor_id,
                'inmate_id' => $request->inmate_id,
                'schedule' => $request->schedule,
                'duration_minutes' => $request->duration_minutes,
                'paid' => 'NO',
                'status' => 2, // Pending
                'reference_number' => $referenceNumber,
            ]);

            DB::commit();

            // Send notifications
            $this->sendConjugalVisitNotifications($visitLog);

            return response()->json([
                'success' => true,
                'message' => 'Conjugal visit request submitted successfully',
                'visit_log' => $visitLog,
                'reference_number' => $referenceNumber,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error storing conjugal visit log: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit visit request: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get document metadata for a conjugal visit registration.
     */
    public function getDocuments($id)
    {
        $conjugalVisit = ConjugalVisit::findOrFail($id);

        return response()->json([
            'success' => true,
            'conjugal_visit' => $conjugalVisit,
            'documents' => [
                'cohabitation_cert' => $this->formatDocumentInfo($conjugalVisit->cohabitation_cert_path),
                'marriage_contract' => $this->formatDocumentInfo($conjugalVisit->marriage_contract_path),
            ],
            'relationship_start_date' => $conjugalVisit->relationship_start_date?->toDateString(),
            'validation' => $conjugalVisit->calculateValidationStatus(),
            'status' => $conjugalVisit->status_label,
            'has_documents' => $conjugalVisit->hasRequiredDocuments(),
        ]);
    }

    /**
     * Stream a document for inline viewing.
     */
    public function viewDocument($id, string $type)
    {
        $conjugalVisit = ConjugalVisit::findOrFail($id);
        $column = $this->getDocumentColumnName($type);
        $path = $conjugalVisit->{$column};

        if (!$path || !Storage::disk('public')->exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found.',
            ], 404);
        }

        return response()->file(Storage::disk('public')->path($path));
    }

    /**
     * Download a stored document.
     */
    public function downloadDocument($id, string $type)
    {
        $conjugalVisit = ConjugalVisit::findOrFail($id);
        $column = $this->getDocumentColumnName($type);
        $path = $conjugalVisit->{$column};

        if (!$path || !Storage::disk('public')->exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found.',
            ], 404);
        }

        return Storage::disk('public')->download($path);
    }

    /**
     * Delete a stored document.
     */
    public function deleteDocument($id, string $type)
    {
        $conjugalVisit = ConjugalVisit::findOrFail($id);
        $column = $this->getDocumentColumnName($type);
        $path = $conjugalVisit->{$column};

        if (!$path || !Storage::disk('public')->exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found.',
            ], 404);
        }

        Storage::disk('public')->delete($path);
        $conjugalVisit->{$column} = null;
        $conjugalVisit->save();

        return response()->json([
            'success' => true,
            'message' => ucfirst(str_replace('_', ' ', $type)) . ' deleted successfully.',
            'documents' => [
                'cohabitation_cert' => $this->formatDocumentInfo($conjugalVisit->cohabitation_cert_path),
                'marriage_contract' => $this->formatDocumentInfo($conjugalVisit->marriage_contract_path),
            ],
            'validation' => $conjugalVisit->calculateValidationStatus(),
            'has_documents' => $conjugalVisit->hasRequiredDocuments(),
        ]);
    }

    /**
     * Check eligibility for conjugal visit request.
     */
    public function checkConjugalVisitEligibility(Request $request)
    {
        try {
            $request->validate([
                'visitor_id' => 'required|exists:visitors,id',
                'inmate_id' => 'required|exists:inmates,id',
                'conjugal_visit_id' => 'nullable|exists:conjugal_visits,id',
            ]);

            $query = ConjugalVisit::query();

            if ($request->filled('conjugal_visit_id')) {
                $query->where('id', $request->conjugal_visit_id);
            } else {
                $query->where('visitor_id', $request->visitor_id)
                    ->where('inmate_id', $request->inmate_id);
            }

            $conjugalVisit = $query->first();

            if (!$conjugalVisit) {
                return response()->json([
                    'success' => true,
                    'eligible' => false,
                    'message' => 'No conjugal visit registration found for the provided visitor and inmate.',
                ]);
            }

            $validation = $conjugalVisit->calculateValidationStatus();

            return response()->json([
                'success' => true,
                'eligible' => $conjugalVisit->isValidForConjugalVisit(),
                'conjugal_visit' => $conjugalVisit,
                'relationship_start_date' => $conjugalVisit->relationship_start_date?->toDateString(),
                'status' => $conjugalVisit->status_label,
                'has_documents' => $conjugalVisit->hasRequiredDocuments(),
                'validation' => $validation,
            ]);

        } catch (\Exception $e) {
            Log::error('Error checking conjugal visit eligibility: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'eligible' => false,
                'message' => 'Failed to evaluate eligibility. ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get conjugal visit logs for an inmate
     */
    public function getInmateLogs($inmateId)
    {
        try {
            $logs = ConjugalVisitLog::with(['visitor', 'conjugalVisit'])
                ->where('inmate_id', $inmateId)
                ->orderBy('schedule', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'logs' => $logs,
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching conjugal visit logs: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch logs',
            ], 500);
        }
    }

    /**
     * Update payment status
     */
    public function updatePaymentStatus(Request $request, $logId)
    {
        try {
            $request->validate([
                'paid' => 'required|in:YES,NO',
            ]);

            $log = ConjugalVisitLog::findOrFail($logId);
            $log->paid = $request->paid;
            // If paid YES, auto-approve per spec
            if ($request->paid === 'YES') {
                $log->status = 1; // Approved
            }
            $log->save();

            return response()->json([
                'success' => true,
                'message' => 'Payment status updated successfully',
                'log' => $log,
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating payment status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update payment status',
            ], 500);
        }
    }

    /**
     * Update conjugal visit log status (approve/reject)
     */
    public function updateLogStatus(Request $request, $logId)
    {
        try {
            $request->validate([
                'status' => 'required|integer|in:0,1,2,3', // 0=Denied,1=Approved,2=Pending,3=Completed
                'schedule' => 'nullable|date',
            ]);

            $log = ConjugalVisitLog::findOrFail($logId);
            $log->status = (int) $request->status;
            if ($request->filled('schedule')) {
                $log->schedule = $request->schedule;
            }
            $log->save();

            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully',
                'log' => $log,
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating conjugal log status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status',
            ], 500);
        }
    }

    /**
     * Get pending conjugal visit logs (for notifications)
     */
    public function getPendingLogs()
    {
        try {
            $logs = ConjugalVisitLog::with(['visitor', 'inmate.cell', 'conjugalVisit'])
                ->where('status', 2) // Pending
                ->orderBy('created_at', 'desc')
                ->limit(20)
                ->get()
                ->map(function ($log) {
                    return [
                        'id' => $log->id,
                        'visitor' => $log->visitor ? [
                            'id' => $log->visitor->id,
                            'name' => $log->visitor->name,
                        ] : null,
                        'inmate' => $log->inmate ? [
                            'id' => $log->inmate->id,
                            'first_name' => $log->inmate->first_name,
                            'last_name' => $log->inmate->last_name,
                            'full_name' => $log->inmate->full_name,
                            'name' => $log->inmate->full_name, // Alias for compatibility
                        ] : null,
                        'schedule' => $log->schedule ? $log->schedule->toDateTimeString() : null,
                        'paid' => $log->paid,
                        'status' => $log->status,
                        'status_label' => $log->status_label,
                        'reference_number' => $log->reference_number,
                        'created_at' => $log->created_at ? $log->created_at->toDateTimeString() : null,
                        'conjugal_visit' => $log->conjugalVisit ? [
                            'id' => $log->conjugalVisit->id,
                            'status' => $log->conjugalVisit->status,
                            'status_label' => $log->conjugalVisit->status_label,
                        ] : null,
                    ];
                });

            return response()->json([
                'success' => true,
                'logs' => $logs,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching pending conjugal logs: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch pending logs',
            ], 500);
        }
    }

    /**
     * Get conjugal visit logs for a specific visitor
     */
    public function getVisitorLogs(Request $request)
    {
        try {
            $request->validate([
                'visitor_id' => 'required|exists:visitors,id',
            ]);

            $logs = ConjugalVisitLog::with(['visitor', 'inmate', 'conjugalVisit'])
                ->where('visitor_id', $request->visitor_id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($log) {
                    return [
                        'id' => $log->id,
                        'schedule' => $log->schedule ? $log->schedule->toDateTimeString() : null,
                        'paid' => $log->paid,
                        'status' => $log->status,
                        'status_label' => $log->status_label,
                        'reference_number' => $log->reference_number,
                        'created_at' => $log->created_at ? $log->created_at->toDateTimeString() : null,
                        'conjugal_visit' => $log->conjugalVisit ? [
                            'id' => $log->conjugalVisit->id,
                            'status' => $log->conjugalVisit->status,
                            'status_label' => $log->conjugalVisit->status_label,
                        ] : null,
                    ];
                });

            return response()->json([
                'success' => true,
                'logs' => $logs,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching visitor conjugal logs: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch visitor logs',
            ], 500);
        }
    }

    /**
     * Update conjugal visit registration status (approve/reject)
     */
    public function updateRegistrationStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|integer|in:0,1,2', // 0=Denied,1=Approved,2=Pending
            ]);

            $conjugalVisit = ConjugalVisit::findOrFail($id);
            $conjugalVisit->status = (int) $request->status;
            $conjugalVisit->save();

            $validation = $conjugalVisit->calculateValidationStatus();

            return response()->json([
                'success' => true,
                'message' => 'Conjugal visit registration status updated successfully',
                'conjugal_visit' => $conjugalVisit->fresh(),
                'validation' => $validation,
                'status_label' => $conjugalVisit->status_label,
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating conjugal visit registration status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get pending conjugal visit registrations
     */
    public function getPendingRegistrations()
    {
        try {
            $registrations = ConjugalVisit::with(['visitor', 'inmate'])
                ->where('status', 2) // Pending
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($registration) {
                    $validation = $registration->calculateValidationStatus();
                    return [
                        'id' => $registration->id,
                        'visitor' => $registration->visitor,
                        'inmate' => $registration->inmate,
                        'relationship_start_date' => $registration->relationship_start_date?->toDateString(),
                        'status' => $registration->status_label,
                        'validation' => $validation,
                        'has_documents' => $registration->hasRequiredDocuments(),
                        'created_at' => $registration->created_at,
                        'updated_at' => $registration->updated_at,
                    ];
                });

            return response()->json([
                'success' => true,
                'registrations' => $registrations,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching pending conjugal visit registrations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch pending registrations',
            ], 500);
        }
    }

    /**
     * Generate unique reference number
     */
    private function generateReferenceNumber(): string
    {
        $date = now()->format('Ymd');
        $random = strtoupper(Str::random(4));
        $referenceNumber = "CV-{$date}-{$random}";

        // Ensure uniqueness
        while (ConjugalVisitLog::where('reference_number', $referenceNumber)->exists()) {
            $random = strtoupper(Str::random(4));
            $referenceNumber = "CV-{$date}-{$random}";
        }

        return $referenceNumber;
    }

    /**
     * Validate the provided relationship start date against the 6-year rule.
     *
     * @throws ValidationException
     */
    private function assertRelationshipStartDate(?string $date): void
    {
        if (!$date) {
            throw ValidationException::withMessages([
                'relationship_start_date' => 'Relationship start date is required for conjugal visits.',
            ]);
        }

        $startDate = Carbon::parse($date);
        $now = Carbon::now();

        if ($startDate->isFuture()) {
            throw ValidationException::withMessages([
                'relationship_start_date' => 'Relationship start date cannot be in the future.',
            ]);
        }

        if ($startDate->diffInYears($now) < 6) {
            throw ValidationException::withMessages([
                'relationship_start_date' => 'Couples must be married or living together for at least 6 years to request conjugal visits.',
            ]);
        }
    }

    /**
     * Store a document in the public disk, replacing any existing file.
     */
    private function storeDocument(UploadedFile $file, string $directory, ?string $existingPath = null): string
    {
        if ($existingPath && Storage::disk('public')->exists($existingPath)) {
            Storage::disk('public')->delete($existingPath);
        }

        return $file->store($directory, 'public');
    }

    /**
     * Map a document type to its corresponding database column name.
     *
     * @throws ValidationException
     */
    private function getDocumentColumnName(string $type): string
    {
        return match ($type) {
            'cohabitation_cert', 'cohabitation-certificate', 'cohabitation' => 'cohabitation_cert_path',
            'marriage_contract', 'marriage-contract', 'marriage' => 'marriage_contract_path',
            default => throw ValidationException::withMessages([
                'type' => 'Unsupported document type provided.',
            ]),
        };
    }

    /**
     * Build a structured response for a stored document.
     */
    private function formatDocumentInfo(?string $path): array
    {
        if (!$path || !Storage::disk('public')->exists($path)) {
            return [
                'exists' => false,
                'filename' => null,
                'url' => null,
            ];
        }

        return [
            'exists' => true,
            'filename' => basename($path),
            'url' => Storage::disk('public')->url($path),
        ];
    }

    /**
     * Send notifications for conjugal visit registration
     */
    private function sendConjugalRegistrationNotifications(ConjugalVisit $conjugalVisit)
    {
        try {
            $visitor = Visitor::find($conjugalVisit->visitor_id);
            $inmate = Inmate::find($conjugalVisit->inmate_id);

            // Get users with roles: Admin (1), Warden (2), Assistant Warden (3), Searcher (5)
            $notifiableRoles = [1, 2, 3, 5];
            $users = User::whereIn('role_id', $notifiableRoles)->get();

            $message = "New conjugal visit registration request from {$visitor->name} for inmate {$inmate->full_name}";

            foreach ($users as $user) {
                // Create notification (implement your notification system here)
                // Example: $user->notify(new ConjugalRegistrationNotification($conjugalVisit));
                Log::info("Notification sent to {$user->full_name}: {$message}");
            }

        } catch (\Exception $e) {
            Log::error('Error sending conjugal registration notifications: ' . $e->getMessage());
        }
    }

    /**
     * Send notifications for conjugal visit request
     */
    private function sendConjugalVisitNotifications(ConjugalVisitLog $visitLog)
    {
        try {
            $visitor = Visitor::find($visitLog->visitor_id);
            $inmate = Inmate::find($visitLog->inmate_id);

            // Get users with roles: Admin (1), Warden (2), Assistant Warden (3), Searcher (5)
            $notifiableRoles = [1, 2, 3, 5];
            $users = User::whereIn('role_id', $notifiableRoles)->get();

            $message = "New conjugal visit request from {$visitor->name} for inmate {$inmate->full_name} on {$visitLog->schedule->format('M d, Y h:i A')}";

            foreach ($users as $user) {
                // Create notification (implement your notification system here)
                // Example: $user->notify(new ConjugalVisitNotification($visitLog));
                Log::info("Notification sent to {$user->full_name}: {$message}");
            }

        } catch (\Exception $e) {
            Log::error('Error sending conjugal visit notifications: ' . $e->getMessage());
        }
    }

    /**
     * PUBLIC: Check conjugal visit eligibility (No authentication required)
     * Validates visitor/inmate ID matching before checking eligibility
     */
    public function checkConjugalVisitEligibilityPublic(Request $request)
    {
        try {
            $request->validate([
                'visitor_id' => 'required|exists:visitors,id',
                'inmate_id' => 'required|exists:inmates,id',
                'id_number' => 'required|string',
                'id_type' => 'required|string',
                'conjugal_visit_id' => 'nullable|exists:conjugal_visits,id',
            ]);

            // Security: Verify visitor ID matches the provided ID number and type (password-like validation)
            $visitor = Visitor::findOrFail($request->visitor_id);
            
            if ($visitor->id_number !== trim($request->id_number) || 
                strtolower($visitor->id_type) !== strtolower(trim($request->id_type))) {
                return response()->json([
                    'success' => false,
                    'message' => 'ID verification failed. Please verify your ID details.'
                ], 403);
            }

            // Verify visitor is associated with the inmate
            if ($visitor->inmate_id != $request->inmate_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Visitor is not authorized for this inmate.'
                ], 403);
            }

            $query = ConjugalVisit::query();

            if ($request->filled('conjugal_visit_id')) {
                $query->where('id', $request->conjugal_visit_id);
            } else {
                $query->where('visitor_id', $request->visitor_id)
                    ->where('inmate_id', $request->inmate_id);
            }

            $conjugalVisit = $query->first();

            if (!$conjugalVisit) {
                return response()->json([
                    'success' => true,
                    'eligible' => false,
                    'message' => 'No conjugal visit registration found. Please complete registration first.',
                ]);
            }

            $validation = $conjugalVisit->calculateValidationStatus();

            return response()->json([
                'success' => true,
                'eligible' => $conjugalVisit->isValidForConjugalVisit(),
                'conjugal_visit' => [
                    'id' => $conjugalVisit->id,
                    'status' => $conjugalVisit->status_label,
                    'relationship_start_date' => $conjugalVisit->relationship_start_date?->toDateString(),
                    'has_documents' => $conjugalVisit->hasRequiredDocuments(),
                ],
                'validation' => $validation,
            ]);

        } catch (\Exception $e) {
            Log::error('Public conjugal visit eligibility check failed', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'eligible' => false,
                'message' => 'Failed to check eligibility. Please try again.',
            ], 500);
        }
    }

    /**
     * PUBLIC: Store conjugal visit registration (No authentication required)
     * Validates visitor/inmate ID matching before registration
     */
    public function storeRegistrationPublic(Request $request)
    {
        try {
            $request->validate([
                'visitor_id' => 'required|exists:visitors,id',
                'inmate_id' => 'required|exists:inmates,id',
                'id_number' => 'required|string',
                'id_type' => 'required|string',
                'relationship_start_date' => 'nullable|date',
                'cohabitation_cert' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
                'marriage_contract' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            ]);

            // Security: Verify visitor ID matches the provided ID number and type
            $visitor = Visitor::findOrFail($request->visitor_id);
            
            if ($visitor->id_number !== trim($request->id_number) || 
                strtolower($visitor->id_type) !== strtolower(trim($request->id_type))) {
                return response()->json([
                    'success' => false,
                    'message' => 'ID verification failed. Please verify your ID details.'
                ], 403);
            }

            // Verify visitor is associated with the inmate
            if ($visitor->inmate_id != $request->inmate_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Visitor is not authorized for this inmate.'
                ], 403);
            }

            DB::beginTransaction();

            $conjugalVisit = ConjugalVisit::where('visitor_id', $request->visitor_id)
                ->where('inmate_id', $request->inmate_id)
                ->first();

            if (!$conjugalVisit) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Conjugal visit registration not found. Please contact administrator to register first.',
                ], 404);
            }

            if ($request->filled('relationship_start_date')) {
                $this->assertRelationshipStartDate($request->relationship_start_date);
                $conjugalVisit->relationship_start_date = $request->relationship_start_date;
            }

            if ($request->hasFile('cohabitation_cert')) {
                $conjugalVisit->cohabitation_cert_path = $this->storeDocument(
                    $request->file('cohabitation_cert'),
                    'conjugal_visits/cohabitation_certificates',
                    $conjugalVisit->cohabitation_cert_path
                );
            }

            if ($request->hasFile('marriage_contract')) {
                $conjugalVisit->marriage_contract_path = $this->storeDocument(
                    $request->file('marriage_contract'),
                    'conjugal_visits/marriage_contracts',
                    $conjugalVisit->marriage_contract_path
                );
            }

            $conjugalVisit->save();

            DB::commit();

            $validation = $conjugalVisit->calculateValidationStatus();

            return response()->json([
                'success' => true,
                'message' => 'Conjugal visit registration updated successfully',
                'conjugal_visit' => [
                    'id' => $conjugalVisit->id,
                    'status' => $conjugalVisit->status_label,
                ],
                'validation' => $validation,
            ]);

        } catch (ValidationException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Public conjugal visit registration update failed', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update registration. Please try again.',
            ], 500);
        }
    }

    /**
     * PUBLIC: Store conjugal visit log (No authentication required)
     * Validates visitor/inmate ID matching before creating request
     */
    public function storeVisitLogPublic(Request $request)
    {
        try {
            $request->validate([
                'conjugal_visit_id' => 'nullable|exists:conjugal_visits,id',
                'visitor_id' => 'required|exists:visitors,id',
                'inmate_id' => 'required|exists:inmates,id',
                'id_number' => 'required|string',
                'id_type' => 'required|string',
                'schedule' => 'required|date',
                'duration_minutes' => 'required|integer|in:30,35,40,45,60,120',
            ]);

            // Security: Verify visitor ID matches the provided ID number and type
            $visitor = Visitor::findOrFail($request->visitor_id);
            
            if ($visitor->id_number !== trim($request->id_number) || 
                strtolower($visitor->id_type) !== strtolower(trim($request->id_type))) {
                return response()->json([
                    'success' => false,
                    'message' => 'ID verification failed. Please verify your ID details.'
                ], 403);
            }

            // Verify visitor is associated with the inmate
            if ($visitor->inmate_id != $request->inmate_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Visitor is not authorized for this inmate.'
                ], 403);
            }

            DB::beginTransaction();

            // Resolve associated conjugal visit registration
            $conjugalVisitId = $request->conjugal_visit_id;
            if ($conjugalVisitId) {
                $conjugalVisit = ConjugalVisit::findOrFail($conjugalVisitId);
                if ((int) $conjugalVisit->visitor_id !== (int) $request->visitor_id || 
                    (int) $conjugalVisit->inmate_id !== (int) $request->inmate_id) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Conjugal visit registration does not match the provided visitor or inmate.',
                    ], 422);
                }
            } else {
                $conjugalVisit = ConjugalVisit::where('visitor_id', $request->visitor_id)
                    ->where('inmate_id', $request->inmate_id)
                    ->first();

                if (!$conjugalVisit) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'No conjugal visit registration found. Please complete registration first.',
                    ], 422);
                }

                $conjugalVisitId = $conjugalVisit->id;
            }

            if (!$conjugalVisit->isApproved()) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Conjugal visit registration must be approved before requesting a visit.',
                ], 422);
            }

            $validation = $conjugalVisit->calculateValidationStatus();
            if (!$validation['is_valid']) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => $validation['reason'] ?? 'Conjugal visit registration does not meet requirements.',
                    'validation' => $validation,
                ], 422);
            }

            // Generate unique reference number
            $referenceNumber = $this->generateReferenceNumber();

            // Create visit log
            $visitLog = ConjugalVisitLog::create([
                'conjugal_visit_id' => $conjugalVisitId,
                'visitor_id' => $request->visitor_id,
                'inmate_id' => $request->inmate_id,
                'schedule' => $request->schedule,
                'duration_minutes' => $request->duration_minutes,
                'paid' => 'NO',
                'status' => 2, // Pending
                'reference_number' => $referenceNumber,
            ]);

            DB::commit();

            // Send notifications (silent failure for public endpoints)
            try {
                $this->sendConjugalVisitNotifications($visitLog);
            } catch (\Exception $e) {
                // Silent failure - notifications are not critical for public requests
            }

            return response()->json([
                'success' => true,
                'message' => 'Conjugal visit request submitted successfully',
                'visit_log' => [
                    'id' => $visitLog->id,
                    'reference_number' => $referenceNumber,
                    'status' => 'Pending',
                ],
                'reference_number' => $referenceNumber,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Public conjugal visit log creation failed', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit visit request. Please try again.',
            ], 500);
        }
    }
}
