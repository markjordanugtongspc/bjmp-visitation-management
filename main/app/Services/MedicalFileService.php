<?php

namespace App\Services;

use App\Models\Inmate;
use App\Models\MedicalFile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MedicalFileService
{
    /**
     * Upload medical files for an inmate
     * Files are stored in private storage with organized folder structure
     * 
     * @param int $inmateId
     * @param array $files
     * @param string $category
     * @param string|null $notes
     * @param int $uploadedBy
     * @return array
     */
    public function uploadFiles(int $inmateId, array $files, string $category, ?string $notes, int $uploadedBy): array
    {
        $inmate = Inmate::findOrFail($inmateId);
        $uploadedFiles = [];
        
        // Create inmate full name for folder structure
        $inmateFullName = $this->sanitizeInmateName($inmate);
        
        // Create category folder name
        $categoryFolder = $this->getCategoryFolderName($category);
        
        foreach ($files as $file) {
            try {
                // Validate file
                if (!$file->isValid()) {
                    throw new \Exception('File upload is not valid: ' . $file->getErrorMessage());
                }
                
                // Generate unique filename
                $originalName = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();
                $timestamp = now()->format('Ymd_His');
                $uniqueId = Str::random(8);
                $fileName = "{$timestamp}_{$uniqueId}_{$originalName}";
                
                // Build path: private/medical/records/{InmateFullName}/{Category}/
                $storagePath = "medical/records/{$inmateFullName}/{$categoryFolder}";
                
                Log::info('Attempting to store file', [
                    'inmate_id' => $inmateId,
                    'original_name' => $originalName,
                    'storage_path' => $storagePath,
                    'file_name' => $fileName,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType()
                ]);
                
                // Store file in private disk
                $filePath = $file->storeAs($storagePath, $fileName, 'private');
                
                if (!$filePath) {
                    throw new \Exception('Failed to store file in private storage');
                }
                
                // Create database record
                $medicalFile = MedicalFile::create([
                    'inmate_id' => $inmateId,
                    'file_name' => $originalName,
                    'file_path' => $filePath,
                    'file_type' => $extension,
                    'category' => $category,
                    'file_size' => $file->getSize(),
                    'notes' => $notes,
                    'uploaded_by' => $uploadedBy
                ]);
                
                $uploadedFiles[] = $medicalFile;
                
                Log::info('Medical file uploaded successfully', [
                    'inmate_id' => $inmateId,
                    'file_id' => $medicalFile->id,
                    'file_name' => $originalName,
                    'file_path' => $filePath,
                    'category' => $category
                ]);
                
            } catch (\Exception $e) {
                Log::error('Failed to upload medical file', [
                    'inmate_id' => $inmateId,
                    'file_name' => $file->getClientOriginalName(),
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }
        }
        
        return $uploadedFiles;
    }
    
    /**
     * Download a medical file
     * 
     * @param int $fileId
     * @return \Symfony\Component\HttpFoundation\StreamedResponse
     */
    public function downloadFile(int $fileId)
    {
        $file = MedicalFile::findOrFail($fileId);
        
        Log::info('Attempting to download medical file', [
            'file_id' => $fileId,
            'file_name' => $file->file_name,
            'file_path' => $file->file_path,
            'inmate_id' => $file->inmate_id,
            'storage_path' => storage_path('app/private/' . $file->file_path)
        ]);
        
        // Check if file exists in storage
        if (!Storage::disk('private')->exists($file->file_path)) {
            Log::error('Medical file not found in storage', [
                'file_id' => $fileId,
                'file_path' => $file->file_path,
                'expected_path' => storage_path('app/private/' . $file->file_path),
                'disk_root' => Storage::disk('private')->path('')
            ]);
            throw new \Exception('File not found in storage');
        }
        
        // Get the full path to verify
        $fullPath = Storage::disk('private')->path($file->file_path);
        
        Log::info('Medical file download successful', [
            'file_id' => $fileId,
            'file_name' => $file->file_name,
            'full_path' => $fullPath,
            'file_size' => Storage::disk('private')->size($file->file_path)
        ]);
        
        return Storage::disk('private')->download($file->file_path, $file->file_name);
    }
    
    /**
     * Delete a medical file
     * 
     * @param int $fileId
     * @return bool
     */
    public function deleteFile(int $fileId): bool
    {
        $file = MedicalFile::findOrFail($fileId);
        
        try {
            // Delete from storage
            if (Storage::disk('private')->exists($file->file_path)) {
                Storage::disk('private')->delete($file->file_path);
            }
            
            // Delete from database
            $file->delete();
            
            Log::info('Medical file deleted successfully', [
                'file_id' => $fileId,
                'file_name' => $file->file_name,
                'inmate_id' => $file->inmate_id
            ]);
            
            return true;
            
        } catch (\Exception $e) {
            Log::error('Failed to delete medical file', [
                'file_id' => $fileId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
    
    /**
     * Sanitize inmate name for folder creation
     * Combines first, middle, and last name with underscores
     * 
     * @param Inmate $inmate
     * @return string
     */
    private function sanitizeInmateName(Inmate $inmate): string
    {
        $nameParts = array_filter([
            $inmate->first_name,
            $inmate->middle_name,
            $inmate->last_name
        ]);
        
        $fullName = implode(' ', $nameParts);
        
        // Replace spaces with underscores and remove special characters
        $sanitized = preg_replace('/[^A-Za-z0-9\s]/', '', $fullName);
        $sanitized = str_replace(' ', '_', $sanitized);
        
        return $sanitized;
    }
    
    /**
     * Get folder name for category
     * 
     * @param string $category
     * @return string
     */
    private function getCategoryFolderName(string $category): string
    {
        $categoryMap = [
            'lab_results' => 'Lab_Results',
            'medical_certificate' => 'Medical_Certificate',
            'prescription' => 'Prescription',
            'xray_scan' => 'XRay_Scan',
            'diagnosis_report' => 'Diagnosis_Report',
            'treatment_plan' => 'Treatment_Plan',
            'other' => 'Other'
        ];
        
        return $categoryMap[$category] ?? 'Other';
    }
}
