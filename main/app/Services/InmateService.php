<?php

namespace App\Services;

use App\Models\Inmate;
use App\Http\Requests\StoreInmateRequest;
use App\Http\Requests\UpdateInmateRequest;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
            'medicalRecords',
            'disciplinaryActions',
            'visitationLogs',
            'allowedVisitors'
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

            DB::commit();

            Log::info('Inmate created successfully', [
                'inmate_id' => $inmate->id,
                'name' => $inmate->full_name,
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
            $data = $this->prepareInmateData($request->validated());
            $newCellId = $data['cell_id'];

            // Update the inmate
            $inmate->update($data);

            // Handle cell assignment changes and update cell counts
            $this->handleCellAssignmentChange($inmate, $oldCellId, $newCellId);

            // Handle additional data if provided
            $this->handleAdditionalData($inmate, $request->validated());

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
            $inmate = Inmate::findOrFail($id);
            $result = $inmate->delete();

            Log::info('Inmate deleted successfully', [
                'inmate_id' => $id,
                'name' => $inmate->full_name,
                'deleted_by' => auth()->id()
            ]);

            return $result;

        } catch (\Exception $e) {
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
        return [
            'first_name' => $data['first_name'],
            'middle_name' => $data['middle_name'],
            'last_name' => $data['last_name'],
            'birthdate' => $data['birthdate'],
            'gender' => $data['gender'],
            'civil_status' => $data['civil_status'] ?? null,
            'address_line1' => $data['address_line1'],
            'address_line2' => $data['address_line2'] ?? null,
            'city' => $data['city'],
            'province' => $data['province'],
            'postal_code' => $data['postal_code'] ?? null,
            'country' => $data['country'],
            'crime' => $data['crime'],
            'sentence' => $data['sentence'],
            'job' => $data['job'] ?? null,
            'date_of_admission' => $data['date_of_admission'],
            'status' => $data['status'],
            'cell_id' => $data['cell_id'] ?? null,
            'medical_status' => $data['medical_status'],
            'last_medical_check' => $data['last_medical_check'] ?? null,
            'medical_notes' => $data['medical_notes'] ?? null,
            'initial_points' => $data['initial_points'],
            'current_points' => $data['current_points'],
        ];
    }

    /**
     * Handle cell assignment changes and update cell counts accordingly.
     */
    private function handleCellAssignmentChange(Inmate $inmate, ?int $oldCellId, ?int $newCellId): void
    {
        Log::info('Handling cell assignment change', [
            'inmate_id' => $inmate->id,
            'inmate_name' => $inmate->full_name,
            'inmate_gender' => $inmate->gender,
            'inmate_status' => $inmate->status,
            'old_cell_id' => $oldCellId,
            'new_cell_id' => $newCellId
        ]);

        // Only update cell counts if there's a change in cell assignment
        if ($oldCellId !== $newCellId) {
            // Decrease count for old cell if inmate was assigned to one
            if ($oldCellId) {
                $oldCell = \App\Models\Cell::find($oldCellId);
                if ($oldCell) {
                    $oldCell->current_count = max(0, $oldCell->current_count - 1);
                    $oldCell->save();
                    
                    Log::info('Decreased cell count', [
                        'cell_id' => $oldCellId,
                        'cell_name' => $oldCell->name,
                        'cell_type' => $oldCell->type,
                        'new_count' => $oldCell->current_count,
                        'inmate_id' => $inmate->id,
                        'inmate_gender' => $inmate->gender
                    ]);
                }
            }

            // Increase count for new cell if inmate is assigned to one
            if ($newCellId) {
                $newCell = \App\Models\Cell::find($newCellId);
                if ($newCell) {
                    // Check if cell has available space (only for Active inmates)
                    if ($inmate->status === 'Active' && !$newCell->hasAvailableSpace()) {
                        Log::warning('Attempted to assign inmate to full cell', [
                            'cell_id' => $newCellId,
                            'cell_name' => $newCell->name,
                            'current_count' => $newCell->current_count,
                            'capacity' => $newCell->capacity,
                            'inmate_id' => $inmate->id
                        ]);
                    }
                    
                    // Only increment count for Active inmates
                    if ($inmate->status === 'Active') {
                        $newCell->current_count = min($newCell->capacity, $newCell->current_count + 1);
                        $newCell->save();
                        
                        Log::info('Increased cell count', [
                            'cell_id' => $newCellId,
                            'cell_name' => $newCell->name,
                            'cell_type' => $newCell->type,
                            'new_count' => $newCell->current_count,
                            'inmate_id' => $inmate->id,
                            'inmate_gender' => $inmate->gender
                        ]);
                    }
                }
            }
        }
        
        // Handle status changes that affect cell counts
        if ($oldCellId && $inmate->status !== 'Active') {
            // If inmate status changed from Active to something else, decrease old cell count
            $oldCell = \App\Models\Cell::find($oldCellId);
            if ($oldCell) {
                $oldCell->current_count = max(0, $oldCell->current_count - 1);
                $oldCell->save();
                
                Log::info('Decreased cell count due to status change', [
                    'cell_id' => $oldCellId,
                    'cell_name' => $oldCell->name,
                    'new_count' => $oldCell->current_count,
                    'inmate_id' => $inmate->id,
                    'new_status' => $inmate->status
                ]);
            }
        } elseif ($newCellId && $inmate->status === 'Active') {
            // If inmate status is Active and assigned to a cell, ensure count is correct
            $newCell = \App\Models\Cell::find($newCellId);
            if ($newCell) {
                // Recalculate to ensure accuracy
                $newCell->updateCurrentCount();
                
                Log::info('Recalculated cell count', [
                    'cell_id' => $newCellId,
                    'cell_name' => $newCell->name,
                    'new_count' => $newCell->current_count,
                    'inmate_id' => $inmate->id
                ]);
            }
        }
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
            // This would be implemented when we create the InmateAllowedVisitor model
            // For now, we'll just log it
            Log::info('Allowed visitors data received', [
                'inmate_id' => $inmate->id,
                'allowed_visitors' => $data['allowed_visitors']
            ]);
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
}
