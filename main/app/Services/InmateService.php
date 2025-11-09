<?php

namespace App\Services;

use App\Models\Inmate;
use App\Models\Cell;
use App\Models\Visitor;
use App\Models\ConjugalVisit;
use App\Http\Requests\StoreInmateRequest;
use App\Http\Requests\UpdateInmateRequest;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Carbon\Carbon;

class InmateService
{
    /**
     * Get all inmates with optional filtering and pagination.
     */
    public function getAll(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Inmate::with(['admittedBy', 'cell']);

        // Apply filters
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['status'])) {
            $query->byStatus($filters['status']);
        }

        if (!empty($filters['gender'])) {
            $query->byGender($filters['gender']);
        }

        if (!empty($filters['medical_status'])) {
            $query->byMedicalStatus($filters['medical_status']);
        }

        if (!empty($filters['cell_id'])) {
            $query->where('cell_id', $filters['cell_id']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Get a single inmate by ID.
     */
    public function getById(int $id): ?Inmate
    {
        return Inmate::with([
            'admittedBy',
            'cell',
            'pointsHistory'
        ])->find($id);
    }

    /**
     * Create a new inmate.
     */
    public function create(StoreInmateRequest $request): Inmate
    {
        try {
            DB::beginTransaction();

            $data = $this->prepareInmateData($request->validated());
            $data['admitted_by_user_id'] = auth()->id(); // Set the current user as the one who admitted

            $inmate = Inmate::create($data);


            // Handle additional data if provided
            $this->handleAdditionalData($inmate, $request->validated());

            // Ensure cell occupancy is recalculated if inmate assigned to a cell
            if (!empty($inmate->cell_id)) {
                Cell::find($inmate->cell_id)?->updateCurrentCount();
            }

            DB::commit();

            Log::info('Inmate created successfully', [
                'inmate_id' => $inmate->id,
                'name' => $inmate->full_name,
                'cell_id' => $inmate->cell_id,
                'created_by' => auth()->id()
            ]);

            return $inmate;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create inmate', [
                'error' => $e->getMessage(),
                'data' => $request->validated()
            ]);
            throw $e;
        }
    }

    /**
     * Update an existing inmate.
     */
    public function update(int $id, UpdateInmateRequest $request): Inmate
    {
        try {
            DB::beginTransaction();

            $inmate = Inmate::findOrFail($id);
            $oldCellId = $inmate->cell_id;
            $oldStatus = $inmate->status;
            $data = $this->prepareInmateData($request->validated());
            $newCellId = $data['cell_id'] ?? null;

            // Track if points changed
            $pointsChanged = isset($data['current_points']) && $inmate->current_points != $data['current_points'];
            
            // Update the inmate
            $inmate->update($data);

            // Recalculate sentence reduction if points changed
            if ($pointsChanged && $inmate->original_sentence_days) {
                $pointsService = app(\App\Services\PointsService::class);
                $reduction = $pointsService->calculateSentenceReduction($inmate->current_points);
                $inmate->reduced_sentence_days = $reduction;
                
                if ($inmate->date_of_admission) {
                    $adjustedDays = max(0, $inmate->original_sentence_days - $reduction);
                    $inmate->adjusted_release_date = $inmate->date_of_admission->copy()->addDays($adjustedDays);
                }
                
                $inmate->save();
            }

            // Handle additional data if provided
            $this->handleAdditionalData($inmate, $request->validated());

            // Recalculate occupancy for affected cells when cell assignment or status changes
            $newStatus = $inmate->status;
            $cellChanged = (int)($oldCellId) !== (int)($newCellId);
            $statusAffectsCount = ($oldStatus === 'Active') !== ($newStatus === 'Active');

            if ($cellChanged || $statusAffectsCount) {
                // Update old cell count (if any)
                if ($oldCellId) {
                    Cell::find($oldCellId)?->updateCurrentCount();
                }

                // Update new cell count (if any)
                if ($newCellId) {
                    Cell::find($newCellId)?->updateCurrentCount();
                }
            }

            DB::commit();

            Log::info('Inmate updated successfully', [
                'inmate_id' => $inmate->id,
                'name' => $inmate->full_name,
                'old_cell_id' => $oldCellId,
                'new_cell_id' => $newCellId,
                'updated_by' => auth()->id()
            ]);

            return $inmate->fresh(['cell']);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update inmate', [
                'inmate_id' => $id,
                'error' => $e->getMessage(),
                'data' => $request->validated()
            ]);
            throw $e;
        }
    }

    /**
     * Delete an inmate (soft delete).
     */
    public function delete(int $id): bool
    {
        try {
            DB::beginTransaction();

            $inmate = Inmate::findOrFail($id);
            $cellId = $inmate->cell_id;


            $result = $inmate->delete();

            // After deletion, recalculate the occupancy for the previous cell
            if ($cellId) {
                Cell::find($cellId)?->updateCurrentCount();
            }

            DB::commit();

            Log::info('Inmate deleted successfully', [
                'inmate_id' => $id,
                'name' => $inmate->full_name,
                'cell_id' => $cellId,
                'deleted_by' => auth()->id()
            ]);

            return $result;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete inmate', [
                'inmate_id' => $id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get inmates statistics.
     */
    public function getStatistics(): array
    {
        return [
            'total' => Inmate::count(),
            'active' => Inmate::active()->count(),
            'released' => Inmate::byStatus('Released')->count(),
            'transferred' => Inmate::byStatus('Transferred')->count(),
            'medical' => Inmate::byStatus('Medical')->count(),
            'male' => Inmate::byGender('Male')->count(),
            'female' => Inmate::byGender('Female')->count(),
            'healthy' => Inmate::byMedicalStatus('Healthy')->count(),
            'under_treatment' => Inmate::byMedicalStatus('Under Treatment')->count(),
            'critical' => Inmate::byMedicalStatus('Critical')->count(),
            'not_assessed' => Inmate::byMedicalStatus('Not Assessed')->count(),
        ];
    }

    /**
     * Update inmate points.
     */
    public function updatePoints(int $inmateId, int $points, string $activity, string $note = null): Inmate
    {
        try {
            $inmate = Inmate::findOrFail($inmateId);
            
            $oldPoints = $inmate->current_points;
            $inmate->current_points += $points;
            $inmate->save();

            Log::info('Inmate points updated', [
                'inmate_id' => $inmateId,
                'old_points' => $oldPoints,
                'new_points' => $inmate->current_points,
                'points_change' => $points,
                'activity' => $activity,
                'note' => $note,
                'updated_by' => auth()->id()
            ]);

            return $inmate;

        } catch (\Exception $e) {
            Log::error('Failed to update inmate points', [
                'inmate_id' => $inmateId,
                'points' => $points,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Prepare inmate data for database insertion.
     */
    private function prepareInmateData(array $data): array
    {
        // Parse sentence text to days if provided
        $originalSentenceDays = null;
        if (!empty($data['sentence'])) {
            $originalSentenceDays = \App\Helpers\SentenceParser::parseToDays($data['sentence']);
        }
        
        return [
            'first_name' => $data['first_name'],
            'middle_name' => $data['middle_name'],
            'last_name' => $data['last_name'],
            'birthdate' => $data['birthdate'],
            'gender' => $data['gender'],
            // 'civil_status' => $data['civil_status'] ?? null, // Column doesn't exist in database
            'address_line1' => $data['address_line1'],
            'address_line2' => $data['address_line2'] ?? null,
            'city' => $data['city'],
            'province' => $data['province'],
            'postal_code' => $data['postal_code'] ?? null,
            'country' => $data['country'],
            'crime' => $data['crime'],
            'sentence' => $data['sentence'],
            'original_sentence_days' => $originalSentenceDays,
            'job' => $data['job'] ?? null,
            'date_of_admission' => $data['date_of_admission'],
            'status' => $data['status'],
            'released_at' => $data['released_at'] ?? null,
            'transferred_at' => $data['transferred_at'] ?? null,
            'transfer_destination' => $data['transfer_destination'] ?? null,
            'cell_id' => $data['cell_id'] ?? null,
            'medical_status' => $data['medical_status'],
            'last_medical_check' => $data['last_medical_check'] ?? null,
            'medical_notes' => $data['medical_notes'] ?? null,
            'initial_points' => $data['initial_points'],
            'current_points' => $data['current_points'],
        ];
    }


    /**
     * Handle additional data like points history, allowed visitors, etc.
     */
    private function handleAdditionalData(Inmate $inmate, array $data): void
    {
        // Handle points history if provided
        if (!empty($data['points_history'])) {
            // This would be implemented when we create the PointsHistory model
            // For now, we'll just log it
            Log::info('Points history data received', [
                'inmate_id' => $inmate->id,
                'points_history' => $data['points_history']
            ]);
        }

        // Handle allowed visitors if provided
        if (!empty($data['allowed_visitors'])) {
            // Delete existing visitors first
            Visitor::where('inmate_id', $inmate->id)->delete();
            
            // Create new visitors
            foreach ($data['allowed_visitors'] as $visitorData) {
                $visitor = Visitor::create([
                    'inmate_id' => $inmate->id,
                    'name' => $visitorData['name'] ?? null,
                    'phone' => $visitorData['phone'] ?? $visitorData['contact_number'] ?? null, // Support both old and new field names
                    'email' => $visitorData['email'] ?? null,
                    'relationship' => $visitorData['relationship'] ?? null,
                    'id_type' => $visitorData['id_type'] ?? null,
                    'id_number' => $visitorData['id_number'] ?? null,
                    'address' => $visitorData['address'] ?? null,
                    'avatar_path' => $visitorData['avatar_path'] ?? null,
                    'avatar_filename' => $visitorData['avatar_filename'] ?? null,
                    'life_status' => $visitorData['life_status'] ?? 'alive',
                    'is_allowed' => isset($visitorData['is_allowed']) ? (bool) $visitorData['is_allowed'] : true,
                    'created_by_user_id' => auth()->id(),
                    'updated_by_user_id' => auth()->id(),
                ]);

                $relationship = strtolower((string) ($visitorData['relationship'] ?? ''));

                if ($this->requiresConjugalRegistration($relationship)) {
                    $relationshipStartDate = $visitorData['relationship_start_date'] ?? null;
                    $this->assertRelationshipStartDate($relationshipStartDate);

                    $cohabitationFile = $visitorData['cohabitation_cert'] ?? null;
                    $marriageFile = $visitorData['marriage_contract'] ?? null;

                    $cohabitationPath = $cohabitationFile instanceof UploadedFile
                        ? $this->storeDocument($cohabitationFile, 'conjugal_visits/cohabitation_certificates')
                        : ($visitorData['cohabitation_cert_path'] ?? null);

                    $marriagePath = $marriageFile instanceof UploadedFile
                        ? $this->storeDocument($marriageFile, 'conjugal_visits/marriage_contracts')
                        : ($visitorData['marriage_contract_path'] ?? null);

                    if (!$cohabitationPath || !$marriagePath) {
                        throw new \RuntimeException('Conjugal visit documents are required for spouse registrations.');
                    }

                    ConjugalVisit::create([
                        'visitor_id' => $visitor->id,
                        'inmate_id' => $inmate->id,
                        'cohabitation_cert_path' => $cohabitationPath,
                        'marriage_contract_path' => $marriagePath,
                        'relationship_start_date' => $relationshipStartDate,
                        'status' => 2,
                    ]);
                }
            }
        }

        // Handle recent visits if provided
        if (!empty($data['recent_visits'])) {
            // This would be implemented when we create the VisitationLog model
            // For now, we'll just log it
            Log::info('Recent visits data received', [
                'inmate_id' => $inmate->id,
                'recent_visits' => $data['recent_visits']
            ]);
        }
    }

    private function requiresConjugalRegistration(?string $relationship): bool
    {
        if (!$relationship) {
            return false;
        }

        return in_array(strtolower($relationship), ['wife', 'husband', 'spouse'], true);
    }

    private function assertRelationshipStartDate(?string $date): void
    {
        if (!$date) {
            throw new \RuntimeException('Relationship start date is required for conjugal visit registrations.');
        }

        $startDate = Carbon::parse($date);
        $now = Carbon::now();

        if ($startDate->isFuture()) {
            throw new \RuntimeException('Relationship start date cannot be in the future.');
        }

        if ($startDate->diffInYears($now) < 6) {
            throw new \RuntimeException('Couples must be married or living together for at least 6 years to request conjugal visits.');
        }
    }

    private function storeDocument(UploadedFile $file, string $directory): string
    {
        return $file->store($directory, 'public');
    }
}
