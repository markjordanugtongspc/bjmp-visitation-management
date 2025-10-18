<?php

namespace App\Http\Controllers;

use App\Models\SupervisionFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

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

            // Get file details
            $extension = $file->getClientOriginalExtension();
            $originalName = $file->getClientOriginalName();

            // Use title as filename (sanitize it)
            $sanitizedTitle = preg_replace('/[^A-Za-z0-9_\-]/', '_', $title);
            $filename = $sanitizedTitle . '.' . $extension;

            // Check if file exists and append timestamp if needed
            $categoryPath = 'supervision/' . $category; // Use category as-is (capitalized)
            $fullPath = $categoryPath . '/' . $filename;

            // If file exists, append timestamp to make unique
            if (Storage::disk('local')->exists($fullPath)) {
                $timestamp = now()->timestamp;
                $filename = $sanitizedTitle . '_' . $timestamp . '.' . $extension;
            }

            // Store the file in private storage (local disk)
            $filePath = $file->storeAs($categoryPath, $filename, 'local');
            
            if (!$filePath) {
                throw new \Exception('Failed to store file');
            }

            // Create database record
            $supervisionFile = SupervisionFile::create([
                'title' => $title,
                'category' => $category,
                'summary' => $summary,
                'file_path' => $filePath,
                'file_name' => $originalName,
                'file_size' => $file->getSize(),
                'file_type' => $file->getMimeType(),
                'uploaded_by' => auth()->id()
            ]);

            // Return success response
            return response()->json([
                'success' => true,
                'message' => 'File uploaded successfully',
                'data' => [
                    'id' => $supervisionFile->id,
                    'title' => $supervisionFile->title,
                    'category' => $supervisionFile->category,
                    'filename' => $supervisionFile->file_name,
                    'file_size' => $supervisionFile->file_size,
                    'formatted_file_size' => $supervisionFile->formatted_file_size,
                    'file_type' => $supervisionFile->file_type,
                    'summary' => $supervisionFile->summary,
                    'uploaded_by' => $supervisionFile->user->full_name ?? 'Unknown',
                    'upload_date' => $supervisionFile->created_at->format('M j, Y'),
                    'download_url' => route('warden.supervision.download', $supervisionFile->id),
                    'preview_url' => route('warden.supervision.preview', $supervisionFile->id),
                    'iconSvg' => $this->getCategoryIcon($supervisionFile->category),
                    'can_delete' => true
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
            $query = SupervisionFile::with('user');

            // Filter by category if provided
            if ($request->has('category') && $request->category) {
                $query->byCategory($request->category);
            }

            // Filter by uploader if provided
            if ($request->has('uploaded_by') && $request->uploaded_by) {
                $query->byUploader($request->uploaded_by);
            }

            $files = $query->orderBy('created_at', 'desc')->get();

            $data = $files->map(function ($file) {
                return [
                    'id' => $file->id,
                    'title' => $file->title,
                    'category' => $file->category,
                    'summary' => $file->summary,
                    'file_name' => $file->file_name,
                    'file_size' => $file->file_size,
                    'formatted_file_size' => $file->formatted_file_size,
                    'file_type' => $file->file_type,
                    'file_extension' => $file->file_extension,
                    'uploaded_by' => $file->user->full_name ?? 'Unknown',
                    'upload_date' => $file->created_at->format('M j, Y'),
                    'download_url' => route('warden.supervision.download', $file->id),
                    'preview_url' => route('warden.supervision.preview', $file->id),
                    'iconSvg' => $this->getCategoryIcon($file->category),
                    'can_delete' => auth()->id() === $file->uploaded_by || auth()->user()->role_id === 0 // Admin or uploader
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Supervision documents retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve documents: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show supervision file metadata
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $file = SupervisionFile::with('user')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $file->id,
                    'title' => $file->title,
                    'category' => $file->category,
                    'summary' => $file->summary,
                    'file_name' => $file->file_name,
                    'file_size' => $file->file_size,
                    'formatted_file_size' => $file->formatted_file_size,
                    'file_type' => $file->file_type,
                    'file_extension' => $file->file_extension,
                    'uploaded_by' => $file->user->full_name ?? 'Unknown',
                    'upload_date' => $file->created_at->format('M j, Y'),
                    'download_url' => route('warden.supervision.download', $file->id),
                    'preview_url' => route('warden.supervision.preview', $file->id),
                    'can_delete' => auth()->id() === $file->uploaded_by || auth()->user()->role_id === 0
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'File not found'
            ], 404);
        }
    }

    /**
     * Preview supervision file
     *
     * @param int $id
     * @return Response
     */
    public function preview(int $id): Response
    {
        try {
            $file = SupervisionFile::findOrFail($id);
            
            if (!Storage::disk('local')->exists($file->file_path)) {
                abort(404, 'File not found in storage');
            }
            
            $fileContent = Storage::disk('local')->get($file->file_path);
            
            return response($fileContent)
                ->header('Content-Type', $file->file_type)
                ->header('Content-Disposition', 'inline; filename="' . $file->file_name . '"');
        } catch (\Exception $e) {
            abort(404, 'File not found');
        }
    }

    /**
     * Download supervision file
     *
     * @param int $id
     * @return \Symfony\Component\HttpFoundation\StreamedResponse
     */
    public function download(int $id): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        try {
            $file = SupervisionFile::findOrFail($id);

            // Check if file exists in storage
            if (!Storage::disk('local')->exists($file->file_path)) {
                abort(404, 'File not found in storage');
            }

            return Storage::disk('local')->download(
                $file->file_path,
                $file->file_name,
                [
                    'Content-Type' => $file->file_type,
                    'Content-Disposition' => 'attachment; filename="' . $file->file_name . '"'
                ]
            );
        } catch (\Exception $e) {
            abort(404, 'File not found');
        }
    }

    /**
     * Delete supervision file
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $file = SupervisionFile::findOrFail($id);

            // Check authorization (only uploader or admin can delete)
            if (auth()->id() !== $file->uploaded_by && auth()->user()->role_id !== 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to delete this file'
                ], 403);
            }

            // Delete file from storage
            if (Storage::disk('local')->exists($file->file_path)) {
                Storage::disk('local')->delete($file->file_path);
            }

            // Delete database record
            $file->delete();

            return response()->json([
                'success' => true,
                'message' => 'File deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete file: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get category icon SVG path
     *
     * @param string $category
     * @return string
     */
    private function getCategoryIcon(string $category): string
    {
        $icons = [
            'Operations' => 'M21.246 4.86L13.527.411a3.07 3.07 0 0 0-3.071 0l-2.34 1.344v6.209l3.104-1.793a1.52 1.52 0 0 1 1.544 0l3.884 2.241c.482.282.764.78.764 1.328v4.482a1.54 1.54 0 0 1-.764 1.328l-3.884 2.241V24l8.482-4.897a3.08 3.08 0 0 0 1.544-2.656V7.532a3.05 3.05 0 0 0-1.544-2.672M6.588 14.222V2.652L2.754 4.876A3.08 3.08 0 0 0 1.21 7.532v8.915c0 1.095.581 2.108 1.544 2.656L11.236 24v-6.209L7.352 15.55a1.53 1.53 0 0 1-.764-1.328',
            'Intake' => 'M8.75 2.75A2.75 2.75 0 006 5.5v13a2.75 2.75 0 002.75 2.75h8.5A2.75 2.75 0 0020 18.5v-13A2.75 2.75 0 0017.25 2.75zM9.5 6h7v1.5h-7zM9.5 9h7v1.5h-7zM9.5 12h7v1.5h-7z',
            'Safety' => 'M12 2a7 7 0 017 7v2a7 7 0 01-14 0V9a7 7 0 017-7z M11 14h2v6h-2z',
            'Medical' => 'M3 7a4 4 0 014-4h10a4 4 0 014 4v2H3z M21 10H3v7a4 4 0 004 4h10a4 4 0 004-4z',
            'Visitation' => 'M7 7h10v2H7zM7 11h10v2H7zM7 15h10v2H7z',
            'Training' => 'M12 2a7 7 0 00-7 7v2a7 7 0 0014 0V9a7 7 0 00-7-7zm0 12a3 3 0 113-3 3 3 0 01-3 3z',
            'Discipline' => 'M5 3a2 2 0 00-2 2v9.764A3.236 3.236 0 006.236 18H18a3 3 0 003-3V5a2 2 0 00-2-2z M7 21a1 1 0 01-1-1v-2h12v2a1 1 0 01-1 1z',
            'Emergency' => 'M12 2a9 9 0 00-9 9v4a3 3 0 003 3h1v2a1 1 0 001.555.832L12 19h6a3 3 0 003-3v-4a9 9 0 00-9-9z'
        ];

        return $icons[$category] ?? $icons['Operations'];
    }
}