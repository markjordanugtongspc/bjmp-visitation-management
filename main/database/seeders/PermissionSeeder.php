<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Role management
            'role.view',
            'role.create',
            'role.update',
            'role.delete',

            // Permission management
            'permission.view',
            'permission.create',
            'permission.update',
            'permission.delete',

            // Users
            'user.view',
            'user.create',
            'user.update',
            'user.delete',

            // Visitation
            'visitation.request.create',
            'visitation.request.approve',
            'visitation.request.reject',
            'visitation.schedule.view',
            'visitation.schedule.manage',

            // Inmates
            'inmate.view',
            'inmate.create',
            'inmate.update',
            'inmate.delete',

            // Analytics
            'analytics.view',
        ];

        foreach ($permissions as $name) {
            Permission::firstOrCreate([
                'name' => $name,
                'guard_name' => 'web',
            ]);
        }
    }
}
