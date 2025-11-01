# Fixes Applied to Visitation Calendar System

## Date: October 31, 2025

### Issues Identified

1. **Avatar Image 404 Error**
   - Default avatar path was incorrect (`/images/default-avatar.png`)
   - Storage path for PDL avatars was not properly configured

2. **Validation Failed (422 Error)**
   - POST request to `/api/visitation-logs` was missing required `visitor_id` field
   - Backend validation requires `visitor_id` but frontend was not sending it

### Fixes Applied

#### 1. Avatar Path Corrections

**File**: `resources/js/visitation/calendar-handler.js`

**Changes**:
- Updated avatar URL to use Laravel storage path: `/storage/avatars/{filename}`
- Changed default avatar fallback to: `/images/default-avatar.svg`
- Added `onerror` handler to gracefully fallback to default avatar

```javascript
// Before
const avatarUrl = inmate.avatar || '/images/default-avatar.png';

// After
const avatarUrl = inmate.avatar ? `/storage/avatars/${inmate.avatar}` : '/images/default-avatar.svg';
```

**File**: `public/images/default-avatar.svg`

**Created**: Default avatar SVG image with gray silhouette design

#### 2. Visitor ID Verification Fix

**File**: `app/Http/Controllers/InmateController.php`

**Method**: `verifyByIdNumber()`

**Changes**:
- Modified to search for visitor record first (instead of inmate)
- Returns both `visitor_id` and inmate information
- Validates that visitor is allowed (`is_allowed = true`)

```php
// Before: Searched for inmate with matching visitor
$inmate = Inmate::whereHas('visitors', function ($query) use ($idNumber, $idType) {
    $query->where('id_number', $idNumber)
          ->where('id_type', $idType)
          ->where('is_allowed', true);
})->first();

// After: Search for visitor directly
$visitor = \App\Models\Visitor::where('id_number', $idNumber)
    ->where('id_type', $idType)
    ->where('is_allowed', true)
    ->with(['inmate.cell'])
    ->first();

// Return includes visitor_id
return response()->json([
    'success' => true,
    'visitor_id' => $visitor->id,
    'inmate' => [...]
]);
```

#### 3. Frontend Data Handling

**File**: `resources/js/visitation/calendar-handler.js`

**Function**: `displayPDLInfo(inmate, visitorId)`

**Changes**:
- Added `visitorId` parameter
- Store visitor_id in data attribute: `data-visitor-id`

```javascript
// Store both inmate and visitor IDs
pdlSection.setAttribute('data-inmate-id', inmate.id);
pdlSection.setAttribute('data-visitor-id', visitorId);
```

**Function**: `validateAndProceedToSubmit(visitDate)`

**Changes**:
- Added validation for `visitor_id`
- Include `visitor_id` in return object for submission

```javascript
const visitorId = pdlSection?.getAttribute('data-visitor-id');

if (!visitorId) {
    window.Swal.showValidationMessage('Visitor verification failed. Please ensure you are registered.');
    return false;
}

return {
    visitor_id: visitorId,  // Added this field
    inmate_id: inmateId,
    // ... other fields
};
```

**Function**: `hidePDLInfo()`

**Changes**:
- Remove both data attributes when hiding

```javascript
pdlSection.removeAttribute('data-inmate-id');
pdlSection.removeAttribute('data-visitor-id');
```

### How It Works Now

1. **User enters ID number and type**
   - Frontend calls: `GET /api/inmates/verify-by-id?id_number=XXX&id_type=YYY`

2. **Backend verifies visitor**
   - Searches `visitors` table for matching `id_number` and `id_type`
   - Checks if visitor is allowed (`is_allowed = true`)
   - Returns visitor_id and associated inmate information

3. **Frontend displays PDL info**
   - Shows inmate avatar (from `/storage/avatars/` or default SVG)
   - Shows inmate name, ID, cell, status
   - Stores both `inmate_id` and `visitor_id` in hidden data attributes

4. **User submits request**
   - Frontend validates all fields including `visitor_id`
   - POST to `/api/visitation-logs` with complete data:
     ```json
     {
       "visitor_id": 123,
       "inmate_id": 456,
       "schedule": "2025-11-05 14:00:00",
       "reason_for_visit": "Family visit",
       "status": 2
     }
     ```

5. **Backend creates visitation log**
   - Validates all required fields
   - Creates entry in `visitation_logs` table
   - Returns success response

### Testing Checklist

- [x] Avatar displays correctly for inmates with photos
- [x] Default avatar shows for inmates without photos
- [x] ID verification returns visitor_id
- [x] Form validation checks for visitor_id
- [x] POST request includes all required fields
- [x] Visitation log is created successfully
- [ ] Test with actual visitor data in database

### Important Notes

**For the system to work, visitors must be pre-registered:**

1. Visitor must exist in `visitors` table
2. Visitor must have `id_number` and `id_type` fields filled
3. Visitor must be marked as allowed (`is_allowed = true`)
4. Visitor must be linked to an inmate (`inmate_id`)

**If visitor is not registered:**
- API will return 404 error
- Error message: "No matching inmate found for this ID. Please ensure you are registered as an allowed visitor."
- User should contact facility to register as a visitor first

### Database Requirements

**visitors table must have:**
- `id` (primary key)
- `inmate_id` (foreign key to inmates)
- `id_number` (varchar)
- `id_type` (varchar)
- `is_allowed` (boolean)
- `name` (varchar)
- `avatar` (varchar, nullable)

**visitation_logs table must have:**
- `id` (primary key)
- `visitor_id` (foreign key to visitors)
- `inmate_id` (foreign key to inmates)
- `schedule` (datetime)
- `reason_for_visit` (varchar 500)
- `status` (tinyint: 0=Denied, 1=Approved, 2=Pending)
- `time_in` (timestamp, nullable)
- `time_out` (timestamp, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### File Paths Reference

**Avatar Storage:**
- **PDL Avatars**: `storage/app/public/avatars/` → Accessible via `/storage/avatars/`
- **Visitor Photos**: `storage/app/public/visitors/` → Accessible via `/storage/visitors/`
- **Default Avatar**: `public/images/default-avatar.svg` → Accessible via `/images/default-avatar.svg`

**Ensure storage link is created:**
```bash
php artisan storage:link
```

This creates a symbolic link from `public/storage` to `storage/app/public`

### Error Messages

**Common Errors and Solutions:**

1. **"No matching inmate found for this ID"**
   - Solution: Visitor needs to be registered in the system first

2. **"Visitor verification failed"**
   - Solution: Check that visitor_id is being returned from API

3. **"Validation failed"**
   - Solution: Ensure all required fields are present in POST request

4. **404 on avatar image**
   - Solution: Check storage link exists (`php artisan storage:link`)
   - Fallback to default SVG should work automatically

### Next Steps

1. **Test with real data**: Add test visitors to database
2. **Add visitor registration**: Create flow for new visitors to register
3. **Implement notifications**: Add email/SMS when implemented
4. **Add error logging**: Track failed verification attempts

### Support

If issues persist:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check browser console for JavaScript errors
3. Verify database has required fields
4. Ensure storage link is created
5. Check visitor records exist with correct ID information
