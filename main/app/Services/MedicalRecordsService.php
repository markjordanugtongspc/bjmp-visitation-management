<?php

namespace App\Services;

use App\Models\Inmate;
use App\Models\MedicalRecord;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class MedicalRecordsService
{
    /**
     * Add medical record to an inmate
     */
    public function addMedicalRecord(
        Inmate $inmate, 
        string $diagnosis, 
        string $treatment, 
        ?string $notes, 
        Carbon $date, 
        ?array $vitals = null,
        ?array $allergies = null,
        ?array $medications = null,
        ?string $medicalStatus = null
    ): Inmate {
        return DB::transaction(function() use ($inmate, $diagnosis, $treatment, $notes, $date, $vitals, $allergies, $medications, $medicalStatus) {
            // Create medical record
            MedicalRecord::create([
                'inmate_id' => $inmate->id,
                'record_date' => $date,
                'diagnosis' => $diagnosis,
                'treatment' => $treatment,
                'doctor_notes' => $notes,
                'vitals' => $vitals,
                'allergies' => $allergies,
                'medications' => $medications,
                'created_by_user_id' => auth()->id()
            ]);

            // Update inmate's medical status and last check date if provided
            if ($medicalStatus) {
                $inmate->medical_status = $medicalStatus;
                $inmate->last_medical_check = $date;
                $inmate->save();
            }

            Log::info('Medical record added to inmate', [
                'inmate_id' => $inmate->id,
                'diagnosis' => $diagnosis,
                'treatment' => $treatment,
                'record_date' => $date->format('Y-m-d'),
                'medical_status_updated' => $medicalStatus ? true : false,
                'created_by' => auth()->id()
            ]);

            return $inmate->fresh(['medicalRecords.createdBy']);
        });
    }
}
