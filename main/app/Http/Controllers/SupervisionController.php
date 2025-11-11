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
            'category' => 'required|string|in:Operations,Intake,Safety,Medical,Visitation,Training,Discipline,Emergency,Conjugal',
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

            // Decide disk by category (Conjugal => public, others => private)
            $disk = ($category === 'Conjugal') ? 'public' : 'private';

            // Check if file exists and append timestamp if needed
            $categoryPath = 'supervision/' . $category; // Use category as-is (capitalized)
            $fullPath = $categoryPath . '/' . $filename;

            // If file exists, append timestamp to make unique
            if (Storage::disk($disk)->exists($fullPath)) {
                $timestamp = now()->timestamp;
                $filename = $sanitizedTitle . '_' . $timestamp . '.' . $extension;
            }

            // Store the file on the selected disk
            $filePath = $file->storeAs($categoryPath, $filename, $disk);
            
            if (!$filePath) {
                throw new \Exception('Failed to store file');
            }

            // Create database record
            $supervisionFile = SupervisionFile::create([
                'title' => $title,
                'category' => $category,
                'storage_type' => $disk,
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
                    'storage_type' => $supervisionFile->storage_type,
                    'file_path' => $supervisionFile->file_path,
                    'public_url' => asset('storage/' . $supervisionFile->file_path), // Direct public access URL
                    'api_preview_url' => route('api.supervision.preview', $supervisionFile->id), // Public API preview URL
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
                    'storage_type' => $file->storage_type,
                    'file_path' => $file->file_path,
                    'public_url' => asset('storage/' . $file->file_path), // Direct public access URL
                    'api_preview_url' => route('api.supervision.preview', $file->id), // Public API preview URL
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
                    'storage_type' => $file->storage_type,
                    'file_path' => $file->file_path,
                    'public_url' => asset('storage/' . $file->file_path), // Direct public access URL
                    'api_preview_url' => route('api.supervision.preview', $file->id), // Public API preview URL
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
            
            $disk = $file->storage_type === 'public' ? 'public' : 'private';

            if (!Storage::disk($disk)->exists($file->file_path)) {
                abort(404, 'File not found in storage');
            }
            
            $fileContent = Storage::disk($disk)->get($file->file_path);
            
            return response($fileContent)
                ->header('Content-Type', $file->file_type)
                ->header('Content-Disposition', 'inline; filename="' . $file->file_name . '"');
        } catch (\Exception $e) {
            abort(404, 'File not found');
        }
    }

    /**
     * Public preview supervision file (API)
     * No auth required; serves file content for embedding in iframes
     *
     * @param int $id
     * @return Response
     */
    public function previewApi(int $id): Response
    {
        try {
            $file = SupervisionFile::findOrFail($id);

            $disk = $file->storage_type === 'public' ? 'public' : 'private';

            if (!Storage::disk($disk)->exists($file->file_path)) {
                abort(404, 'File not found in storage');
            }

            $fileContent = Storage::disk($disk)->get($file->file_path);

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
            $disk = $file->storage_type === 'public' ? 'public' : 'private';
            if (!Storage::disk($disk)->exists($file->file_path)) {
                abort(404, 'File not found in storage');
            }

            return Storage::disk($disk)->download(
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
            $disk = $file->storage_type === 'public' ? 'public' : 'private';
            if (Storage::disk($disk)->exists($file->file_path)) {
                Storage::disk($disk)->delete($file->file_path);
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
     * Diagnostics for supervision storage (local env only)
     */
    public function diagnostics(): JsonResponse
    {
        if (!app()->environment('local')) {
            return response()->json([
                'success' => false,
                'message' => 'Diagnostics available only in local environment'
            ], 403);
        }

        $summary = [
            'counts' => [
                'public' => SupervisionFile::where('storage_type', 'public')->count(),
                'private' => SupervisionFile::where('storage_type', 'private')->count(),
                'total' => SupervisionFile::count(),
            ],
            'samples' => [
                'public' => SupervisionFile::where('storage_type', 'public')->orderBy('id', 'desc')->limit(3)->get(['id','category','file_path','file_name']),
                'private' => SupervisionFile::where('storage_type', 'private')->orderBy('id', 'desc')->limit(3)->get(['id','category','file_path','file_name']),
            ],
            'paths' => [
                'public_root' => storage_path('app/public/supervision'),
                'private_root' => storage_path('app/private/supervision'),
            ],
            'link_exists' => file_exists(public_path('storage'))
        ];

        return response()->json([
            'success' => true,
            'data' => $summary
        ]);
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
            'Emergency' => 'M12 2a9 9 0 00-9 9v4a3 3 0 003 3h1v2a1 1 0 001.555.832L12 19h6a3 3 0 003-3v-4a9 9 0 00-9-9z',
            'Conjugal' => 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
        ];

        return $icons[$category] ?? $icons['Operations'];
    }

    /**
     * PUBLIC: Get supervision documents (No authentication required)
     * Only returns Conjugal category documents for public access
     */
    public function indexPublic(Request $request): JsonResponse
    {
        try {
            // Only allow Conjugal category for public access
            $query = SupervisionFile::where('category', 'Conjugal')
                ->where('storage_type', 'public'); // Only public files

            // Filter by category if provided (but only Conjugal is allowed)
            if ($request->has('category') && $request->category === 'Conjugal') {
                $query->byCategory('Conjugal');
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
                    'upload_date' => $file->created_at->format('M j, Y'),
                    'public_url' => asset('storage/' . $file->file_path),
                    'api_preview_url' => route('api.supervision.preview', $file->id),
                    'iconSvg' => $this->getCategoryIcon($file->category),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Supervision documents retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Public supervision documents retrieval failed', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve documents. Please try again.'
            ], 500);
        }
    }
}