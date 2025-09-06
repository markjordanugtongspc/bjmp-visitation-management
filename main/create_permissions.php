<?php

use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    // Create permission
    $permission = Permission::firstOrCreate(['name' => 'view.announcement', 'guard_name' => 'web']);
    echo "Permission created: view.announcement\n";

    // Create roles if they don't exist
    $superadmin = Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);
    $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    $warden = Role::firstOrCreate(['name' => 'warden', 'guard_name' => 'web']);
    echo "Roles created/confirmed: superadmin, admin, warden\n";

    // Assign permission only to superadmin
    $superadmin->givePermissionTo('view.announcement');
    echo "Permission 'view.announcement' assigned to superadmin role\n";

    // Get first user and assign superadmin role for testing
    $user = \App\Models\User::first();
    if ($user) {
        $user->assignRole('superadmin');
        echo "Role 'superadmin' assigned to first user: {$user->username} (ID: {$user->user_id})\n";
    } else {
        echo "No users found in database\n";
    }

    echo "Done!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
