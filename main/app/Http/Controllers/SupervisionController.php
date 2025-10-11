<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class SupervisionController extends Controller
{
    /**
     * Upload supervision document
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function upload(Request $request): JsonResponse
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:pdf,doc,docx|max:15360', // 15MB max
            'title' => 'required|string|max:255',
            'category' => 'required|string|in:Operations,Intake,Safety,Medical,Visitation,Training,Discipline,Emergency',
            'summary' => 'nullable|string|max:1000',
            'filename' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('file');
            $category = $request->input('category');
            $title = $request->input('title');
            $summary = $request->input('summary', '');
            $customFilename = $request->input('filename');

            // Generate filename
            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            
            if ($customFilename) {
                $filename = $customFilename;
            } else {
                $timestamp = now()->timestamp;
                $baseName = pathinfo($originalName, PATHINFO_FILENAME);
                $filename = $baseName . '_' . $timestamp . '.' . $extension;
            }

            // Create category directory path
            $categoryPath = 'supervision/' . strtolower($category);
            
            // Store the file
            $filePath = $file->storeAs($categoryPath, $filename, 'public');
            
            if (!$filePath) {
                throw new \Exception('Failed to store file');
            }

            // Generate public URL
            $publicUrl = Storage::url($filePath);

            // Return success response
            return response()->json([
                'success' => true,
                'message' => 'File uploaded successfully',
                'data' => [
                    'id' => time(),
                    'title' => $title,
                    'category' => $category,
                    'filename' => $filename,
                    'originalFilename' => $originalName,
                    'path' => $publicUrl,
                    'fullPath' => storage_path('app/public/' . $filePath),
                    'size' => $file->getSize(),
                    'type' => $file->getMimeType(),
                    'extension' => $extension,
                    'summary' => $summary,
                    'uploadDate' => now()->format('M j, Y'),
                    'pages' => rand(5, 25) // Random page count for demo
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get supervision documents
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // In a real implementation, this would fetch from database
            // For now, return empty array as files are stored in localStorage
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'Supervision documents retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve documents: ' . $e->getMessage()
            ], 500);
        }
    }
}