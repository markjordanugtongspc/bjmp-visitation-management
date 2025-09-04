<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $superAdmin = Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $warden = Role::firstOrCreate(['name' => 'warden', 'guard_name' => 'web']);

        // Assign all permissions to superadmin
        $superAdmin->syncPermissions(Permission::pluck('name')->toArray());

        // Admin: management focused, not destructive deletes
        $adminPermissions = [
            // role & permission: view and update
            'role.view', 'role.create', 'role.update',
            'permission.view', 'permission.create', 'permission.update',

            // users
            'user.view', 'user.create', 'user.update',

            // visitation
            'visitation.request.create', 'visitation.request.approve', 'visitation.request.reject',
            'visitation.schedule.view', 'visitation.schedule.manage',

            // inmates
            'inmate.view', 'inmate.create', 'inmate.update',

            // analytics
            'analytics.view',
        ];
        $admin->syncPermissions($adminPermissions);

        // Warden: operational permissions
        $wardenPermissions = [
            'visitation.request.create', 'visitation.request.approve', 'visitation.request.reject',
            'visitation.schedule.view', 'visitation.schedule.manage',
            'inmate.view', 'inmate.update',
            'analytics.view',
        ];
        $warden->syncPermissions($wardenPermissions);
    }
}
