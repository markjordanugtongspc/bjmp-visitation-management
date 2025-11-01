# Visitation Calendar Feature Documentation

## Overview
This document describes the newly implemented interactive calendar system for the BJMP Visitation Management System. The feature allows visitors to select available dates, verify their identity, and submit visitation requests through an intuitive interface.

## Features Implemented

### 1. Interactive Calendar
- **Location**: `resources/views/visitation/request/visitor.blade.php`
- **Functionality**:
  - Displays current month with day-of-week indicators
  - Tuesday to Sunday are marked as available (green indicator)
  - Monday is marked as closed (red indicator)
  - Today's date is highlighted in blue
  - Clicking a date saves selection to browser cookies
  - Selected date shows a blue ring highlight
  - Responsive design for mobile, tablet, and desktop

### 2. Date Selection Rules
- **Allowed Days**: Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- **Blocked Days**: Monday (and any dates added to maintenance list)
- **Available Hours**: 
  - Morning: 9:00 AM - 12:00 PM
  - Afternoon: 2:00 PM - 5:00 PM

### 3. Manual Request Modal
- **Trigger**: Click "Manual Request" button after selecting a date
- **Form Fields**:
  - ID Type (dropdown with 16+ ID options)
  - ID Number (text input with auto-verification)
  - Preferred Time (dropdown with 8 time slots)
  - Reason for Visit (textarea, max 500 characters)

### 4. ID Verification System
- **Real-time Verification**: As user types ID number, system checks database
- **PDL Information Display**: When match found, shows:
  - PDL Name
  - PDL ID Number
  - Cell Assignment
  - Status
  - Avatar (if available)
- **Validation**: Only allows submission if PDL is verified

### 5. Cookie-Based State Management
- **Cookie Name**: `selected_visit_date`
- **Expiration**: 7 days
- **Purpose**: Persists selected date across page refreshes
- **Auto-clear**: Removed after successful submission

## File Structure

```
resources/
├── js/
│   └── visitation/
│       ├── calendar-handler.js          # Main calendar logic
│       └── request/
│           └── visitmodal.js            # Existing modal handlers
└── views/
    └── visitation/
        └── request/
            └── visitor.blade.php         # Calendar UI

app/
└── Http/
    └── Controllers/
        └── InmateController.php          # Added verifyByIdNumber()

routes/
└── api.php                               # Added /api/inmates/verify-by-id
```

## API Endpoints

### Verify PDL by ID
```
GET /api/inmates/verify-by-id
Query Parameters:
  - id_number: string (required)
  - id_type: string (required)

Response (Success):
{
  "success": true,
  "inmate": {
    "id": 1,
    "first_name": "Juan",
    "last_name": "Dela Cruz",
    "name": "Juan Dela Cruz",
    "status": "Active",
    "cell": {
      "id": 1,
      "name": "Cell A-1"
    },
    "avatar": null
  }
}

Response (Not Found):
{
  "success": false,
  "message": "No matching inmate found for this ID"
}
```

### Submit Visitation Request
```
POST /api/visitation-logs
Headers:
  - Content-Type: application/json
  - X-CSRF-TOKEN: {token}

Body:
{
  "inmate_id": 1,
  "id_type": "Driver's License",
  "id_number": "N01-12-345678",
  "schedule": "2025-11-05 14:00:00",
  "reason_for_visit": "Family visit",
  "status": 2  // Pending
}

Response:
{
  "success": true,
  "data": {
    "id": 123,
    ...
  },
  "message": "Visitation request created successfully"
}
```

## JavaScript Functions

### Core Functions (calendar-handler.js)

#### `initializeCalendar()`
Initializes calendar event listeners and restores saved date from cookies.

#### `handleDateSelection(event)`
Handles click events on calendar dates, validates availability, and saves to cookies.

#### `getSelectedDate()`
Returns currently selected date from memory or cookies.

#### `openManualRequestModal()`
Opens the manual request modal with pre-filled date and time selection.

#### `verifyPDLByID(idNumber, idType)`
Calls backend API to verify PDL information based on visitor's ID.

#### `submitVisitationRequest(requestData)`
Submits the visitation request to backend and handles response.

### Placeholder Functions (For Future Implementation)

#### `sendVisitationReminder(requestData)`
**Purpose**: Send confirmation and reminder to visitor
**Implementation Notes**:
- Check if visitor has email or phone number
- If email exists: send email reminder
- If phone exists: send SMS reminder
- If both exist: send both notifications

#### `sendEmailReminder(emailData)`
**Purpose**: Send email notification using Laravel Mail
**TODO**: 
- Integrate with Laravel's mail system
- Create email template
- Configure SMTP settings

#### `sendSMSReminder(smsData)`
**Purpose**: Send SMS notification
**TODO**:
- Integrate with SMS gateway (Semaphore, Twilio, etc.)
- Add phone number validation
- Handle SMS delivery status

## Configuration

### Calendar Configuration (calendar-handler.js)
```javascript
const CalendarConfig = {
    // Days allowed for visitation (0=Sunday, 1=Monday, ..., 6=Saturday)
    allowedDays: [2, 3, 4, 5, 6, 0],  // Tue-Sun
    
    // Available time slots
    timeSlots: [
        { value: '09:00', label: '9:00 AM' },
        { value: '10:00', label: '10:00 AM' },
        // ... more slots
    ],
    
    // Maintenance/blocked dates
    blockedDates: [
        // Add dates here when needed
        // Example: '2025-11-15', '2025-12-25'
    ]
};
```

### Adding Blocked Dates
To block specific dates (e.g., during riots or special events):

1. Open `resources/js/visitation/calendar-handler.js`
2. Find the `CalendarConfig.blockedDates` array
3. Add date strings in 'YYYY-MM-DD' format:
```javascript
blockedDates: [
    '2025-11-15',  // Blocked for maintenance
    '2025-12-25',  // Christmas Day
]
```

## Database Schema

### visitation_logs Table
```sql
- id (primary key)
- inmate_id (foreign key to inmates)
- visitor_id (foreign key to visitors, nullable)
- schedule (datetime)
- status (tinyint: 0=Denied, 1=Approved, 2=Pending)
- time_in (timestamp, nullable)
- time_out (timestamp, nullable)
- reason_for_visit (varchar 500, nullable)
- created_at
- updated_at
```

## User Flow

1. **Select Date**
   - User views calendar
   - Clicks on available date (Tue-Sun)
   - Date is highlighted and saved to cookies
   - Confirmation toast appears

2. **Open Manual Request**
   - User clicks "Manual Request" button
   - System checks if date is selected
   - Modal opens with selected date pre-filled

3. **Fill Form**
   - User selects ID type
   - User enters ID number
   - System auto-verifies and displays PDL info
   - User selects time slot
   - User enters reason for visit

4. **Submit Request**
   - User clicks "Submit"
   - System validates all fields
   - POST request sent to backend
   - Success message with reference number
   - Cookie cleared
   - Page reloads

5. **Notification** (Future)
   - Email/SMS sent to visitor
   - Warden receives notification
   - Request appears in warden's dashboard

## Responsive Design

### Mobile (< 640px)
- Calendar grid: 7 columns, compact spacing
- Modal: Full width with padding
- Buttons: Stack vertically
- Form fields: Full width

### Tablet (640px - 1024px)
- Calendar: 2/3 width
- Actions sidebar: 1/3 width
- Modal: 90% viewport width
- Form fields: 2-column grid

### Desktop (> 1024px)
- Calendar: 2/3 width with larger cells
- Actions sidebar: 1/3 width
- Modal: 70% viewport width, max 56rem
- Form fields: 2-column grid with larger spacing

## SweetAlert2 Integration

All modals use SweetAlert2 with consistent styling:
- **Background**: `#111827` (gray-900)
- **Text Color**: `#F9FAFB` (gray-50)
- **Confirm Button**: Blue gradient
- **Cancel Button**: Gray
- **Icons**: Success (green), Warning (yellow), Error (red)

## Security Considerations

1. **CSRF Protection**: All POST requests include CSRF token
2. **ID Verification**: Only registered visitors with matching IDs can submit
3. **Input Validation**: Frontend and backend validation
4. **SQL Injection Prevention**: Using Eloquent ORM
5. **XSS Prevention**: All user inputs are escaped

## Future Enhancements

### Priority 1 (Essential)
- [ ] Implement email notification system
- [ ] Implement SMS notification system
- [ ] Add visitor registration from manual request
- [ ] Add automatic request functionality

### Priority 2 (Important)
- [ ] Add calendar month navigation (prev/next)
- [ ] Add multi-month view
- [ ] Add capacity limits per time slot
- [ ] Add waiting list functionality

### Priority 3 (Nice to Have)
- [ ] Add recurring visit scheduling
- [ ] Add visitor history view
- [ ] Add QR code generation for approved visits
- [ ] Add real-time availability updates

## Testing Checklist

### Frontend
- [ ] Calendar displays correctly on all screen sizes
- [ ] Date selection works and persists in cookies
- [ ] Modal opens with correct pre-filled data
- [ ] ID verification triggers on input
- [ ] Form validation works for all fields
- [ ] Success/error messages display correctly

### Backend
- [ ] API endpoint returns correct PDL data
- [ ] Visitation log is created in database
- [ ] Status is set to "Pending" (2)
- [ ] Timestamps are recorded correctly
- [ ] Error handling works for invalid data

### Integration
- [ ] Full flow from date selection to submission
- [ ] Cookie management works across sessions
- [ ] Page reload preserves selected date
- [ ] Notification system triggers (when implemented)

## Troubleshooting

### Issue: Calendar dates not clickable
**Solution**: Ensure `calendar-handler.js` is loaded via Vite in blade template

### Issue: ID verification not working
**Solution**: Check API route is registered and InmateController method exists

### Issue: CSRF token mismatch
**Solution**: Verify meta tag is present in blade template head section

### Issue: Modal not displaying
**Solution**: Ensure SweetAlert2 is loaded globally (check app.js)

### Issue: Selected date not persisting
**Solution**: Check browser cookies are enabled and not being blocked

## Support

For questions or issues related to this feature:
1. Check this documentation first
2. Review the code comments in `calendar-handler.js`
3. Check Laravel logs in `storage/logs/laravel.log`
4. Check browser console for JavaScript errors

## Version History

- **v1.0.0** (2025-10-31): Initial implementation
  - Interactive calendar with date selection
  - Manual request modal with ID verification
  - Cookie-based state management
  - Backend API integration
  - Placeholder notification functions
