<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
    public function bulkSync(Request $request)
    {
        $data = $request->validate([
            'permissions' => ['array'],
            'permissions.*.name' => ['required','string','max:255'],
            'permissions.*.guard_name' => ['nullable','string','max:25'],
        ]);

        $items = $data['permissions'] ?? [];
        DB::transaction(function () use ($items) {
            foreach ($items as $item) {
                Permission::firstOrCreate([
                    'name' => $item['name'],
                    'guard_name' => $item['guard_name'] ?? 'web',
                ]);
            }
        });

        return response()->json(['status' => 'ok']);
    }

    public function list(Request $request): JsonResponse
    {
        $minId = (int) ($request->query('min_id', 23));
        $perPage = (int) ($request->query('per_page', 6));
        $permissions = Permission::query()
            ->select(['id','name','guard_name'])
            ->where('id', '>=', $minId)
            ->orderBy('id')
            ->paginate($perPage);
        return response()->json(['permissions' => $permissions]);
    }

    public function update(Request $request, Permission $permission): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'guard_name' => ['nullable','string','max:25'],
        ]);

        $permission->name = $data['name'];
        if (!empty($data['guard_name'])) {
            $permission->guard_name = $data['guard_name'];
        }
        $permission->save();

        return response()->json(['status' => 'ok']);
    }

    public function destroy(Permission $permission): JsonResponse
    {
        DB::transaction(function () use ($permission) {
            $permission->delete();
            // Reset AUTO_INCREMENT to last id + 1
            $next = (int) (Permission::max('id') ?? 0) + 1;
            DB::statement('ALTER TABLE permissions AUTO_INCREMENT = ' . $next);
        });

        return response()->json(['status' => 'ok']);
    }
}


