<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\JsonResponse;

class WardenController extends Controller
{
    /**
     * Display the warden dashboard.
     */
    public function dashboard()
    {
        return view('warden.dashboard');
    }
    
    /**
     * Display the inmates management page for warden.
     */
    public function inmates()
    {
        return view('warden.inmates.inmates');
    }
    
    /**
     * Display the officers management page for warden.
     */
    public function officers()
    {
        $hasTitle = Schema::hasColumn('users', 'title');
        $hasSubtitle = Schema::hasColumn('users', 'subtitle');

        $select = ['user_id', 'full_name', 'email', 'is_active', 'profile_picture'];
        if ($hasTitle) {
            $select[] = 'title';
        }
        if ($hasSubtitle) {
            $select[] = 'subtitle';
        }

        $officers = User::query()
            ->orderBy('user_id')
            ->get($select)
            ->map(function (User $user) use ($hasTitle, $hasSubtitle) {
                $hasProfilePicture = !empty($user->profile_picture) && Storage::disk('public')->exists($user->profile_picture);
                return [
                    'id' => $user->user_id,
                    'name' => $user->full_name,
                    'email' => $user->email,
                    'title' => $hasTitle ? ($user->title ?? 'N/A') : 'N/A',
                    'subtitle' => $hasSubtitle ? ($user->subtitle ?? 'N/A') : 'N/A',
                    'status' => $user->is_active ? 'Active' : 'Inactive',
                    'profile_picture_url' => $hasProfilePicture ? Storage::url($user->profile_picture) : null,
                    'has_profile_picture' => $hasProfilePicture,
                ];
            });

        return view('warden.officers.officers', compact('officers'));
    }
    
    /**
     * Display the visitors management page for warden.
     */
    public function visitors()
    {
        return view('warden.visitors.visitors');
    }
    
    /**
     * Display the visitor requests management page for warden.
     */
    public function requests()
    {
        return view('warden.visitors.requests');
    }

    /**
     * Store a newly created officer into users table.
     */
    public function storeOfficer(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'title' => ['nullable', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:Active,Inactive'],
        ]);

        // Generate unique username from email prefix or slug of name
        $base = strtolower(Str::slug(explode('@', $validated['email'])[0] ?: $validated['name'], '.'));
        $username = $base ?: strtolower(Str::slug($validated['name'], '.'));
        $suffix = 1;
        while (User::where('username', $username)->exists()) {
            $username = $base . $suffix;
            $suffix++;
        }

        // Create user within a transaction to safely calculate role_id
        $user = DB::transaction(function () use ($validated, $username) {
            // Get the current max user_id with lock to prevent race conditions
            $nextUserId = DB::table('users')->lockForUpdate()->max('user_id');
            if ($nextUserId === null) {
                $nextUserId = 0; // First user if table is empty
            }
            $nextUserId += 1;

            $user = User::create([
                'username' => $username,
                'email' => $validated['email'],
                'password' => Hash::make('password'),
                'full_name' => $validated['name'],
                'role_id' => $nextUserId,
                'is_active' => $validated['status'] === 'Active',
                'title' => $validated['title'] ?? null,
                'subtitle' => $validated['subtitle'] ?? null,
            ]);

            return $user;
        });

        $hasProfilePicture = !empty($user->profile_picture) && Storage::disk('public')->exists($user->profile_picture);
        return response()->json([
            'id' => $user->user_id,
            'name' => $user->full_name,
            'email' => $user->email,
            'title' => $user->title ?? 'N/A',
            'subtitle' => $user->subtitle ?? 'N/A',
            'status' => $validated['status'],
            'profile_picture_url' => $hasProfilePicture ? Storage::url($user->profile_picture) : null,
            'has_profile_picture' => $hasProfilePicture,
        ], 201);
    }

    /**
     * Return list of officers (from users table) for frontend rendering.
     */
    public function listOfficers(Request $request)
    {
        $hasTitle = Schema::hasColumn('users', 'title');
        $hasSubtitle = Schema::hasColumn('users', 'subtitle');

        $select = ['user_id', 'full_name', 'email', 'is_active', 'profile_picture'];
        if ($hasTitle) {
            $select[] = 'title';
        }
        if ($hasSubtitle) {
            $select[] = 'subtitle';
        }

        $users = User::query()
            ->orderBy('user_id')
            ->get($select);

        $items = $users->map(function (User $u) use ($hasTitle, $hasSubtitle) {
            $hasProfilePicture = !empty($u->profile_picture) && Storage::disk('public')->exists($u->profile_picture);
            return [
                'id' => $u->user_id,
                'name' => $u->full_name,
                'email' => $u->email,
                'title' => $hasTitle ? ($u->title ?? 'N/A') : 'N/A',
                'subtitle' => $hasSubtitle ? ($u->subtitle ?? 'N/A') : 'N/A',
                'status' => $u->is_active ? 'Active' : 'Inactive',
                'profile_picture_url' => $hasProfilePicture ? Storage::url($u->profile_picture) : null,
                'has_profile_picture' => $hasProfilePicture,
            ];
        });

        return response()->json($items);
    }

    /**
     * Update an officer (user) fields: name, title, subtitle, email, status.
     */
    public function updateOfficer(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', 'unique:users,email,'.$user->user_id.',user_id'],
            'title' => ['nullable', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'in:Active,Inactive'],
        ]);

        if (array_key_exists('name', $validated)) {
            $user->full_name = $validated['name'];
        }
        if (array_key_exists('email', $validated)) {
            $user->email = $validated['email'];
        }
        if (array_key_exists('title', $validated)) {
            $user->title = $validated['title'];
        }
        if (array_key_exists('subtitle', $validated)) {
            $user->subtitle = $validated['subtitle'];
        }
        if (array_key_exists('status', $validated)) {
            $user->is_active = $validated['status'] === 'Active';
        }
        $user->save();

        return response()->json([
            'id' => $user->user_id,
            'name' => $user->full_name,
            'email' => $user->email,
            'title' => $user->title ?? 'N/A',
            'subtitle' => $user->subtitle ?? 'N/A',
            'status' => $user->is_active ? 'Active' : 'Inactive',
            'profile_picture_url' => $user->profile_picture_url,
        ]);
    }

    /**
     * Upload avatar for an officer (user).
     */
    public function uploadOfficerAvatar(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
        ]);

        try {
            $file = $request->file('avatar');
            $extension = $file->getClientOriginalExtension();
            
            // Generate filename: {user_id}.{extension}
            $filename = $user->user_id . '.' . $extension;
            
            // Delete old avatar if exists
            if ($user->profile_picture) {
                Storage::disk('public')->delete($user->profile_picture);
            }
            
            // Store the new file
            $path = $file->storeAs('avatars', $filename, 'public');
            
            // Update user's profile_picture in database
            $user->update(['profile_picture' => $path]);
            
            // Refresh user to get updated profile_picture
            $user->refresh();
            
            return response()->json([
                'success' => true,
                'message' => 'Avatar uploaded successfully',
                'image_url' => Storage::url($path),
                'profile_picture_url' => Storage::url($path),
                'has_profile_picture' => true
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload avatar: ' . $e->getMessage()
            ], 500);
        }
    }
}
