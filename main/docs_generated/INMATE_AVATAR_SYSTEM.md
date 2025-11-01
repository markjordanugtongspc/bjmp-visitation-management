# Inmate Avatar Upload System

## Overview
Complete avatar upload and management system for inmates with clickable edit functionality, SVG avatar generation, and responsive design.

## Features Implemented

### 1. **Avatar Upload Modal**
- SweetAlert2-based upload modal
- Live image preview before upload
- File validation (5MB max, image types only)
- Responsive design for mobile and desktop

### 2. **SVG Avatar Generation**
- Automatic generation based on inmate name initials
- Consistent color generation using name hash
- Fallback when no avatar is uploaded

### 3. **Clickable Avatar with Edit Icon**
- Hover effect shows edit icon (small pen)
- Blurred background overlay on hover
- Works on all avatar displays:
  - Table rows
  - Overview modal (desktop & mobile)
  - Medical modal (desktop & mobile)
  - Visitation modal

### 4. **Storage Structure**
```
storage/app/public/inmates/avatars/{inmate_id}/{filename}
```
- Each inmate has their own folder
- Filename format: `{name_with_underscores}_{inmate_id}.{extension}`
- Example: `juan_dela_cruz_1.jpg`

### 5. **Database Schema**
**Table**: `inmates`
- `avatar_path` (VARCHAR, nullable) - Stores: `inmates/avatars/{inmate_id}`
- `avatar_filename` (VARCHAR, nullable) - Stores: `{name}_{id}.{ext}`

## Files Modified

### Frontend (JavaScript)

#### `resources/js/inmates/inmates.js`
**Added Functions**:
1. `generateAvatarSVG(name)` - Generates SVG avatar with initials
2. `openAvatarUploadModal(inmateId, inmateName, currentAvatarUrl)` - Opens upload modal
3. `uploadInmateAvatar(inmateId, file, inmateName)` - Handles file upload
4. `getInmateAvatarUrl(inmate)` - Returns avatar URL with fallback to SVG

**Updated Sections**:
- Table row avatar (line ~2298) - Added clickable with edit icon
- Overview modal desktop avatar (line ~2851) - Added clickable with edit icon
- Overview modal mobile avatar (line ~2878) - Added clickable with edit icon
- Medical modal desktop avatar (line ~3061) - Added clickable with edit icon
- Medical modal mobile avatar (line ~3096) - Added clickable with edit icon

**Event Listeners**:
- Added event delegation for `[data-avatar-upload]` clicks

### Backend (PHP)

#### `app/Http/Controllers/InmateController.php`
**New Method**: `uploadAvatar(Request $request)`
- Validates uploaded file
- Creates directory structure
- Deletes old avatar if exists
- Stores new avatar
- Updates inmate record
- Returns JSON response

**Updated Method**: `transformInmateForFrontend($inmate)`
- Added `avatar_path` field
- Added `avatar_filename` field

#### `app/Models/Inmate.php`
**Updated**:
- Added `avatar_path` to `$fillable`
- Added `avatar_filename` to `$fillable`

#### `routes/api.php`
**New Route**:
```php
Route::post('/upload-avatar', [InmateController::class, 'uploadAvatar'])
    ->name('api.inmates.upload-avatar');
```

## API Endpoint

### POST `/api/inmates/upload-avatar`

**Request**:
```javascript
FormData {
  avatar: File,
  inmate_id: number,
  inmate_name: string
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatar_url": "/storage/inmates/avatars/1/juan_dela_cruz_1.jpg",
    "avatar_path": "inmates/avatars/1",
    "avatar_filename": "juan_dela_cruz_1.jpg"
  }
}
```

**Response (Error)**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "avatar": ["The avatar must be an image."]
  }
}
```

## Usage

### 1. **Upload Avatar**
1. Click on any inmate avatar (shows edit icon on hover)
2. Select image file (PNG, JPG, GIF up to 5MB)
3. Preview shows in modal
4. Click "Upload" button
5. Page reloads to show new avatar

### 2. **Avatar Display Priority**
1. **Uploaded Avatar**: If `avatar_path` and `avatar_filename` exist
2. **Generated SVG**: If no avatar uploaded, generates SVG with initials
3. **Default Logo**: If no name available, shows BJMP logo

### 3. **SVG Avatar Generation**
```javascript
// Example for "Juan Dela Cruz"
Initials: "JD"
Color: hsl(123, 60%, 50%) // Consistent color based on name hash
```

## Responsive Design

### Desktop
- Avatar size: 28x28 (h-28 w-28)
- Edit icon size: 16x16
- Hover effect: Black overlay with 40% opacity

### Mobile/Tablet
- Avatar size: 20x20 to 24x24 (w-20 h-20 sm:w-24 sm:h-24)
- Edit icon size: 14x14
- Touch-friendly clickable area

## Tailwind CSS Classes Used

### Avatar Container
```html
<div class="relative group rounded-full bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 shadow-lg shadow-blue-200/60 p-1 cursor-pointer" data-avatar-upload data-inmate-id="${inmate.id}">
```

### Edit Icon Overlay
```html
<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" class="drop-shadow-lg">
    <path fill="white" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM21.41 6.34l-3.75-3.75l-2.53 2.54l3.75 3.75z" stroke-width="0.3" stroke="white"/>
  </svg>
</div>
```

## Integration with Other Views

### Visitation Request Modal
The avatar system is ready to be integrated into:
- `resources/views/visitation/request/visitor.blade.php`
- `resources/views/nurse/*` (all nurse views)
- Any other view displaying inmate information

**Integration Steps**:
1. Ensure inmate data includes `avatar_path` and `avatar_filename`
2. Use `getInmateAvatarUrl(inmate)` function to get avatar URL
3. Add `data-avatar-upload` and `data-inmate-id` attributes for edit functionality

## Security Considerations

1. **File Validation**: Only image files up to 5MB
2. **Authentication**: Routes use `web` middleware
3. **Storage**: Files stored in `storage/app/public` (not web-accessible directly)
4. **Symbolic Link**: Requires `php artisan storage:link` to be run

## Setup Instructions

1. **Run Migration** (Already done - columns exist):
   ```bash
   php artisan migrate
   ```

2. **Create Storage Link**:
   ```bash
   php artisan storage:link
   ```

3. **Set Permissions**:
   ```bash
   chmod -R 775 storage/app/public/inmates
   ```

## Testing Checklist

- [ ] Upload avatar from table row
- [ ] Upload avatar from overview modal (desktop)
- [ ] Upload avatar from overview modal (mobile)
- [ ] Upload avatar from medical modal (desktop)
- [ ] Upload avatar from medical modal (mobile)
- [ ] Verify SVG generation for inmates without avatars
- [ ] Verify old avatar deletion when uploading new one
- [ ] Test file size validation (>5MB should fail)
- [ ] Test file type validation (non-images should fail)
- [ ] Verify responsive design on mobile devices
- [ ] Check hover effect shows edit icon
- [ ] Verify page reload after successful upload

## Future Enhancements

1. **Crop Functionality**: Add image cropping before upload
2. **Multiple Formats**: Support WebP for better compression
3. **Thumbnail Generation**: Create thumbnails for faster loading
4. **Avatar History**: Keep history of previous avatars
5. **Bulk Upload**: Upload avatars for multiple inmates at once
6. **Camera Capture**: Allow direct camera capture on mobile devices

## Troubleshooting

### Avatar Not Showing
1. Check if storage link exists: `ls -la public/storage`
2. Verify file permissions: `ls -la storage/app/public/inmates`
3. Check browser console for 404 errors
4. Verify database has `avatar_path` and `avatar_filename` values

### Upload Fails
1. Check file size (must be < 5MB)
2. Verify file type (must be image)
3. Check storage permissions
4. Review Laravel logs: `storage/logs/laravel.log`

### SVG Not Generating
1. Check browser console for JavaScript errors
2. Verify inmate has `first_name` and `last_name`
3. Test `generateAvatarSVG()` function in console

## Support

For issues or questions, check:
1. Laravel logs: `storage/logs/laravel.log`
2. Browser console for JavaScript errors
3. Network tab for API request/response details
