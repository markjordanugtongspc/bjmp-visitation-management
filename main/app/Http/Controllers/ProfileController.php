<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): View
    {
        return view('profile.edit', [
            'user' => $request->user(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Upload the user's profile picture.
     */
    public function uploadProfilePicture(Request $request)
    {
        $request->validate([
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048'
        ]);

        $user = $request->user();
        
        // Get the original file extension
        $file = $request->file('profile_picture');
        $extension = $file->getClientOriginalExtension();
        
        // Generate filename: {user_id}.{extension}
        $filename = $user->user_id . '.' . $extension;
        
        // Delete old profile picture if exists
        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }
        
        // Store the new file
        $path = $file->storeAs('avatars', $filename, 'public');
        
        // Update user's profile_picture in database
        $user->update(['profile_picture' => $path]);
        
        // Return the new image URL
        return response()->json([
            'success' => true,
            'image_url' => Storage::url($path)
        ]);
    }

    /**
     * Get the current user's data.
     */
    public function getUserData(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'user' => [
                'full_name' => $user->full_name,
                'email' => $user->email,
                'profile_picture_url' => $user->profile_picture_url,
                'role_name' => $user->getRoleName()
            ]
        ]);
    }

    /**
     * Delete the user's account.
     * 
     * Comprehensive account deletion that:
     * - Validates password
     * - Logs out the user
     * - Deletes user account
     * - Clears all session data
     * - Flushes user-specific cache
     * - Prevents browser back button access
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validateWithBag('userDeletion', [
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();
        $userId = $user->user_id;

        // Logout the user
        Auth::logout();

        // Delete user account
        $user->delete();

        // Clear all session data
        Session::flush();

        // Invalidate the session
        $request->session()->invalidate();
        
        // Regenerate CSRF token
        $request->session()->regenerateToken();

        // Clear user-specific cache
        Cache::forget("user.{$userId}");
        Cache::forget("user.{$userId}.permissions");
        Cache::forget("user.{$userId}.roles");

        // Redirect to login with cache-busting headers
        return Redirect::to('/login')
            ->with('status', 'Your account has been deleted.')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
            ->header('Pragma', 'no-cache')
            ->header('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');
    }
}
