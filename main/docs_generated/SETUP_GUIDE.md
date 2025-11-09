# Setup Guide - Assistant Warden & Status Tracking

## Quick Start

Follow these steps to complete the implementation:

### Step 1: Create Assistant Warden Views

Run the PowerShell script to automatically create all Assistant Warden views:

```powershell
# From the project root directory
.\create_assistant_warden_views.ps1
```

This will:
- Copy all warden views to `resources/views/assistant_warden/`
- Update all route references from `warden.*` to `assistant-warden.*`
- Update page titles and headings

### Step 2: Run Database Migrations

Execute the migrations to add new database tables and columns:

```bash
php artisan migrate
```

This will create:
- `released_at`, `transferred_at`, `transfer_destination` columns in `inmates` table
- `warden_messages` table for Assistant Warden messaging

### Step 3: Clear Application Cache

```bash
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
```

### Step 4: Verify Installation

#### Test Inmate Status Tracking:

1. Navigate to Inmates page (Admin or Warden)
2. Click "Add Inmate" or edit existing inmate
3. Select status as "Released"
   - Verify release date/time field appears
   - Verify current datetime auto-populates
4. Select status as "Transferred"
   - Verify transfer date/time field appears
   - Verify transfer destination textarea appears
5. Save and view inmate details
   - Verify timestamps display correctly

#### Test Assistant Warden Login:

1. Create or update a user with `role_id = 2`
2. Login with that user
3. Verify redirect to `/assistant-warden/dashboard`
4. Verify navigation shows correct links
5. Test all pages (Inmates, Officers, Visitors, Supervision)

---

## Manual View Creation (Alternative)

If you prefer to create views manually instead of using the script:

### 1. Create Directory Structure

```bash
mkdir -p resources/views/assistant_warden/inmates
mkdir -p resources/views/assistant_warden/officers
mkdir -p resources/views/assistant_warden/visitors
mkdir -p resources/views/assistant_warden/supervision
```

### 2. Copy Files

Copy the following files from `resources/views/warden/` to `resources/views/assistant_warden/`:

- `dashboard.blade.php`
- `inmates/inmates.blade.php`
- `officers/officers.blade.php`
- `visitors/visitors.blade.php`
- `visitors/requests.blade.php`
- `supervision/supervision.blade.php`

### 3. Update Route References

In each copied file, replace:
- `route('warden.` → `route('assistant-warden.`
- `/warden/` → `/assistant-warden/`
- `Warden Dashboard` → `Assistant Warden Dashboard`

---

## Database Seeder (Optional)

Create a test Assistant Warden user:

```php
// database/seeders/AssistantWardenSeeder.php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AssistantWardenSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'username' => 'assistant.warden',
            'email' => 'assistant.warden@bjmp.gov.ph',
            'password' => Hash::make('password'),
            'full_name' => 'Assistant Warden',
            'role_id' => 2,
            'is_active' => true,
            'title' => 'Assistant Warden',
            'subtitle' => 'BJMP Iligan City Jail',
        ]);
    }
}
```

Run the seeder:
```bash
php artisan db:seed --class=AssistantWardenSeeder
```

---

## Testing Checklist

### Inmate Status Tracking

- [ ] Add new inmate with "Released" status
- [ ] Add new inmate with "Transferred" status
- [ ] Edit existing inmate to "Released" status
- [ ] Edit existing inmate to "Transferred" status
- [ ] Verify release timestamp saves correctly
- [ ] Verify transfer timestamp saves correctly
- [ ] Verify transfer destination saves correctly
- [ ] View inmate details - verify timestamps display
- [ ] View inmate details - verify transfer destination displays
- [ ] Check mobile responsive design
- [ ] Check dark mode compatibility

### Assistant Warden Role

- [ ] Login as Assistant Warden (role_id=2)
- [ ] Verify redirect to `/assistant-warden/dashboard`
- [ ] Navigate to Inmates page
- [ ] Navigate to Officers page
- [ ] Navigate to Visitors page
- [ ] Navigate to Visitor Requests page
- [ ] Navigate to Supervision page
- [ ] Verify all CRUD operations work
- [ ] Check navigation highlighting
- [ ] Check mobile responsive design

### Messaging System (API)

Test using Postman or similar:

**Send Message:**
```http
POST /api/warden-messages
Content-Type: application/json
Authorization: Bearer {token}

{
  "recipient_id": 1,
  "message": "Test message from Assistant Warden",
  "priority": "normal"
}
```

**Get Messages:**
```http
GET /api/warden-messages
Authorization: Bearer {token}
```

**Mark as Read:**
```http
PATCH /api/warden-messages/1/read
Authorization: Bearer {token}
```

**Get Unread Count:**
```http
GET /api/warden-messages/unread-count
Authorization: Bearer {token}
```

---

## Troubleshooting

### Issue: Views not found (404 error)

**Solution:**
```bash
php artisan view:clear
php artisan config:clear
```

### Issue: Routes not working

**Solution:**
```bash
php artisan route:clear
php artisan route:cache
```

### Issue: Migration already exists

**Solution:**
If migrations were already run, you can rollback:
```bash
php artisan migrate:rollback --step=1
php artisan migrate
```

### Issue: JavaScript not loading conditional fields

**Solution:**
Clear browser cache and check console for errors:
```bash
npm run build
# or
npm run dev
```

### Issue: Dark mode not working

**Solution:**
Ensure ThemeManager is loaded:
```javascript
// Check in browser console
console.log(window.ThemeManager);
```

---

## File Checklist

Verify all these files were created/modified:

### Database
- [x] `database/migrations/2025_11_02_000000_add_status_tracking_to_inmates_table.php`
- [x] `database/migrations/2025_11_02_000001_create_warden_messages_table.php`

### Models
- [x] `app/Models/Inmate.php` (updated)
- [x] `app/Models/WardenMessage.php` (new)

### Controllers
- [x] `app/Http/Controllers/AssistantWardenController.php` (new)
- [x] `app/Http/Controllers/InmateController.php` (updated)

### Services
- [x] `app/Services/InmateService.php` (updated)

### Routes
- [x] `routes/web.php` (updated)
- [x] `routes/api.php` (updated)

### Frontend
- [x] `resources/js/inmates/inmates.jsx` (updated)
- [x] `resources/js/dashboard/components/role-based.js` (updated)

### Views
- [ ] `resources/views/assistant_warden/dashboard.blade.php`
- [ ] `resources/views/assistant_warden/inmates/inmates.blade.php`
- [ ] `resources/views/assistant_warden/officers/officers.blade.php`
- [ ] `resources/views/assistant_warden/visitors/visitors.blade.php`
- [ ] `resources/views/assistant_warden/visitors/requests.blade.php`
- [ ] `resources/views/assistant_warden/supervision/supervision.blade.php`

### Documentation
- [x] `ASSISTANT_WARDEN_STATUS_TRACKING_IMPLEMENTATION.md`
- [x] `SETUP_GUIDE.md`
- [x] `create_assistant_warden_views.ps1`

---

## Next Steps

After completing the setup:

1. **Add Messaging UI:**
   - Create a floating "Message Warden" button for Assistant Warden
   - Integrate with notification bell for Warden
   - Add message history view

2. **Testing:**
   - Perform comprehensive testing
   - Test on mobile devices
   - Test dark mode

3. **Documentation:**
   - Update ERD with new tables
   - Document API endpoints
   - Create user guide

4. **Deployment:**
   - Test on staging environment
   - Run migrations on production
   - Monitor for issues

---

## Support

If you encounter any issues:

1. Check the console for JavaScript errors
2. Check Laravel logs: `storage/logs/laravel.log`
3. Verify database migrations ran successfully
4. Ensure all files are in correct locations
5. Clear all caches

For questions, refer to `ASSISTANT_WARDEN_STATUS_TRACKING_IMPLEMENTATION.md` for detailed implementation notes.
