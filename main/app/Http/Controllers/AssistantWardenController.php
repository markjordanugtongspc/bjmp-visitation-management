<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\WardenMessage;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class AssistantWardenController extends Controller
{
    /**
     * Display the assistant warden dashboard.
     */
    public function dashboard()
    {
        return view('assistant_warden.dashboard');
    }
    
    /**
     * Display the inmates management page for assistant warden.
     */
    public function inmates()
    {
        return view('assistant_warden.inmates.inmates');
    }
    
    /**
     * Display the officers management page for assistant warden.
     */
    public function officers()
    {
        return view('assistant_warden.officers.officers');
    }
    
    /**
     * Display the visitors management page for assistant warden.
     */
    public function visitors()
    {
        return view('assistant_warden.visitors.visitors');
    }
    
    /**
     * Display the visitor requests management page for assistant warden.
     */
    public function requests()
    {
        return view('assistant_warden.visitors.requests');
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

        return response()->json([
            'id' => $user->user_id,
            'name' => $user->full_name,
            'email' => $user->email,
            'title' => $user->title ?? 'N/A',
            'subtitle' => $user->subtitle ?? 'N/A',
            'status' => $validated['status'],
        ], 201);
    }

    /**
     * Return list of officers (from users table) for frontend rendering.
     */
    public function listOfficers(Request $request)
    {
        $hasTitle = Schema::hasColumn('users', 'title');
        $hasSubtitle = Schema::hasColumn('users', 'subtitle');

        $select = ['user_id', 'full_name', 'email', 'is_active'];
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
            return [
                'id' => $u->user_id,
                'name' => $u->full_name,
                'email' => $u->email,
                'title' => $hasTitle ? ($u->title ?? 'N/A') : 'N/A',
                'subtitle' => $hasSubtitle ? ($u->subtitle ?? 'N/A') : 'N/A',
                'status' => $u->is_active ? 'Active' : 'Inactive',
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
        ]);
    }
    
    /**
     * Send a bump message to the warden.
     */
    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
            'priority' => ['sometimes', 'in:normal,high,urgent'],
            'recipient_id' => ['required', 'exists:users,user_id'],
        ]);

        $message = WardenMessage::create([
            'sender_id' => Auth::id(),
            'recipient_id' => $validated['recipient_id'],
            'message' => $validated['message'],
            'priority' => $validated['priority'] ?? 'normal',
            'is_read' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully',
            'data' => $message,
        ], 201);
    }
    
    /**
     * Get messages for the current user.
     * For notification bell, only fetch unread messages.
     */
    public function getMessages(Request $request)
    {
        $messages = WardenMessage::with(['sender:user_id,full_name', 'recipient:user_id,full_name'])
            ->where(function ($query) {
                $query->where('recipient_id', Auth::id())
                      ->orWhere('sender_id', Auth::id());
            })
            ->where('is_read', false) // Only fetch unread messages for notification bell
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($messages);
    }
    
    /**
     * Mark message as read.
     */
    public function markAsRead(Request $request, $id)
    {
        $message = WardenMessage::findOrFail($id);
        
        // Only the recipient can mark as read
        if ($message->recipient_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $message->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Message marked as read',
        ]);
    }
    
    /**
     * Mark all messages as read for the current user.
     */
    public function markAllAsRead(Request $request)
    {
        $updated = WardenMessage::where('recipient_id', Auth::id())
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'All messages marked as read',
            'count' => $updated,
        ]);
    }
    
    /**
     * Get unread message count.
     */
    public function getUnreadCount(Request $request)
    {
        $count = WardenMessage::where('recipient_id', Auth::id())
            ->where('is_read', false)
            ->count();

        return response()->json(['count' => $count]);
    }
}
