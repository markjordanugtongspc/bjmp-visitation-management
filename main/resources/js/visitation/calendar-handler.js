/**
 * Visitation Calendar Handler
 * Manages calendar date selection, cookie storage, and date highlighting
 * Note: All modals are handled in visitmodal.js
 */

// Cookie utility functions
const CookieManager = {
    set(name, value, days = 7) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
    },
    
    get(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
        }
        return null;
    },
    
    remove(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    }
};

// Calendar configuration
const CalendarConfig = {
    // Saturday & Sunday (6, 0) and Tuesday to Thursday (2, 3, 4) are allowed
    allowedDays: [0, 2, 3, 4, 6], // Sunday, Tuesday, Wednesday, Thursday, Saturday
    
    // Monday & Friday are not available (1, 5)
    unavailableDays: [1, 5], // Monday, Friday
    
    // All possible time slots
    allTimeSlots: [
        { value: '08:00', label: '8:00 AM' },
        { value: '09:00', label: '9:00 AM' },
        { value: '10:00', label: '10:00 AM' },
        { value: '11:00', label: '11:00 AM' },
        { value: '12:00', label: '12:00 PM' },
        { value: '13:00', label: '1:00 PM' },
        { value: '14:00', label: '2:00 PM' },
        { value: '15:00', label: '3:00 PM' },
        { value: '16:00', label: '4:00 PM' }
    ],
    
    // Maintenance/blocked dates (format: 'YYYY-MM-DD')
    blockedDates: [
        // Add specific dates here when needed
        // Example: '2025-11-15', '2025-12-25'
    ],
    
    /**
     * Get time slots for a specific date
     * @param {string} dateString - Date in YYYY-MM-DD format
     * @returns {Array} Array of time slot objects
     */
    getTimeSlotsForDate(dateString) {
        const date = new Date(dateString);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        
        // Saturday (6) & Sunday (0): 08:00 AM - 4:00 PM
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return this.allTimeSlots.filter(slot => {
                const hour = parseInt(slot.value.split(':')[0]);
                return hour >= 8 && hour <= 16;
            });
        }
        
        // Tuesday (2) to Thursday (4): 12:00 NN - 4:00 PM
        if (dayOfWeek >= 2 && dayOfWeek <= 4) {
            return this.allTimeSlots.filter(slot => {
                const hour = parseInt(slot.value.split(':')[0]);
                return hour >= 12 && hour <= 16;
            });
        }
        
        // Monday & Friday: No time slots available
        return [];
    },
    
    isDateAllowed(dateString) {
        // Check if date is in blocked list
        if (this.blockedDates.includes(dateString)) {
            return false;
        }
        
        const date = new Date(dateString);
        const dayOfWeek = date.getDay();
        
        // Check if day of week is allowed
        return this.allowedDays.includes(dayOfWeek);
    }
};

// Calendar state management
let selectedDate = null;

/**
 * Initialize calendar functionality
 */
export function initializeCalendar() {
    const calendarButtons = document.querySelectorAll('[data-calendar-day]');
    
    calendarButtons.forEach(button => {
        button.addEventListener('click', handleDateSelection);
    });
    
    // Restore previously selected date from cookie
    const savedDate = CookieManager.get('selected_visit_date');
    if (savedDate) {
        selectedDate = savedDate;
        highlightSelectedDate(savedDate);
    }
}

/**
 * Handle date selection on calendar
 */
async function handleDateSelection(event) {
    const button = event.currentTarget;
    const day = button.getAttribute('data-calendar-day');
    const month = button.getAttribute('data-calendar-month');
    const year = button.getAttribute('data-calendar-year');
    const isOpen = button.getAttribute('data-is-open') === 'true';
    
    if (!isOpen) {
        // Import modal function dynamically to avoid circular dependency
        const { showDateNotAvailableModal } = await import('./request/visitmodal.js');
        await showDateNotAvailableModal();
        return;
    }
    
    // Format date as YYYY-MM-DD
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Check if date is blocked
    if (!CalendarConfig.isDateAllowed(dateString)) {
        const { showDateBlockedModal } = await import('./request/visitmodal.js');
        await showDateBlockedModal();
        return;
    }
    
    // Check if this date is already selected (before saving)
    const currentSelectedDate = selectedDate || CookieManager.get('selected_visit_date');
    
    // If date was already selected, directly open the manual request modal without showing confirmation
    if (currentSelectedDate === dateString) {
        // Date already selected, open modal directly
        const { openManualRequestModal } = await import('./request/visitmodal.js');
        await openManualRequestModal();
        return;
    }
    
    // Save selected date (only if it's a new selection)
    selectedDate = dateString;
    CookieManager.set('selected_visit_date', dateString, 7);
    
    // Update UI
    highlightSelectedDate(dateString);
    
    // Show confirmation only if it's a new selection
    const { showDateSelectedModal } = await import('./request/visitmodal.js');
    await showDateSelectedModal(dateString);
}

/**
 * Highlight the selected date on calendar
 */
function highlightSelectedDate(dateString) {
    // Get theme-aware colors from ThemeManager
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    // Remove previous selection (ring indicators only, preserve isToday styling)
    document.querySelectorAll('[data-calendar-day]').forEach(btn => {
        btn.classList.remove('ring-4', 'ring-blue-500', 'ring-offset-2', 'ring-offset-gray-900');
        btn.classList.remove('ring-offset-white');
        // Only remove bg-blue-500 if it exists (user selection), not bg-blue-600 (isToday)
        if (btn.classList.contains('bg-blue-500')) {
            btn.classList.remove('bg-blue-500', '!text-white');
            // Only remove !text-gray-900 if it was added as part of selection
            btn.classList.remove('!text-gray-900');
        }
    });
    
    // Add selection to new date
    const [year, month, day] = dateString.split('-');
    const button = document.querySelector(
        `[data-calendar-day="${parseInt(day)}"][data-calendar-month="${parseInt(month)}"][data-calendar-year="${year}"]`
    );
    
    if (button) {
        // Check if this is the current day (has bg-blue-600)
        const isToday = button.classList.contains('bg-blue-600');
        
        // Apply selection ring
        button.classList.add('ring-4', 'ring-blue-500', 'ring-offset-2');
        
        // Theme-aware ring offset
        if (isDarkMode) {
            button.classList.add('ring-offset-gray-900');
        } else {
            button.classList.add('ring-offset-white');
        }
        
        // Apply background color only if NOT today
        // If isToday, keep bg-blue-600 and just add the ring
        if (!isToday) {
            // Theme-aware text color for selected date
            if (isDarkMode) {
                // Dark mode: white text on blue background
                button.classList.add('bg-blue-500', '!text-white');
            } else {
                // Light mode: black text on blue background
                button.classList.add('bg-blue-500', '!text-gray-900');
            }
        }
        // If isToday, the existing bg-blue-600 text-white classes remain unchanged
    }
}

/**
 * Get the currently selected date
 */
export function getSelectedDate() {
    return selectedDate || CookieManager.get('selected_visit_date');
}

// Export CalendarConfig and CookieManager for use in visitmodal.js
export { CalendarConfig, CookieManager };

/**
 * Send decline reason notification via SMS and Email
 * This function is called when a visitation request is declined
 * 
 * NOTE: This is a commented/template function for future implementation.
 * When the backend SMS/Email service is ready, uncomment and implement this function.
 * 
 * @param {string} visitorName - Name of the visitor
 * @param {string} visitorPhone - Phone number of the visitor (optional)
 * @param {string} visitorEmail - Email address of the visitor (optional)
 * @param {string} declineReason - Reason for declining the request
 * @param {string} inmateName - Name of the inmate (optional)
 * @param {string} scheduleDate - Scheduled date of visit (optional)
 * 
 * @example
 * // Usage in notifications.js:
 * // sendDeclineReasonNotification(visitorName, declineReason);
 * 
 * @example
 * // Full usage with all parameters:
 * // sendDeclineReasonNotification(
 * //   'John Doe',
 * //   '+1234567890',
 * //   'john@example.com',
 * //   'Schedule conflict with facility maintenance',
 * //   'Jane Smith',
 * //   '2025-01-15'
 * // );
 */
// async function sendDeclineReasonNotification(
//   visitorName,
//   visitorPhone = null,
//   visitorEmail = null,
//   declineReason,
//   inmateName = null,
//   scheduleDate = null
// ) {
//   try {
//     // Format the decline message
//     const message = `
//       Dear ${visitorName || 'Visitor'},
//       
//       We regret to inform you that your visitation request${inmateName ? ` for ${inmateName}` : ''}${scheduleDate ? ` scheduled on ${scheduleDate}` : ''} has been declined.
//       
//       Reason: ${declineReason}
//       
//       If you have any questions or would like to reschedule, please contact the facility administration.
//       
//       Thank you for your understanding.
//       
//       - BJMP Iligan Visitation Management System
//     `.trim();

//     // Send SMS notification (if phone number is available)
//     if (visitorPhone) {
//       try {
//         // Example SMS API call (adjust based on your SMS service provider)
//         // const smsResponse = await fetch('/api/send-sms', {
//         //   method: 'POST',
//         //   headers: {
//         //     'Content-Type': 'application/json',
//         //     'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
//         //   },
//         //   body: JSON.stringify({
//         //     phone: visitorPhone,
//         //     message: message
//         //   })
//         // });
//         
//         // if (!smsResponse.ok) {
//         //   console.error('Failed to send SMS notification');
//         // } else {
//         //   console.log('SMS notification sent successfully');
//         // }
//         
//         console.log('SMS notification (commented):', {
//           phone: visitorPhone,
//           message: message.substring(0, 50) + '...'
//         });
//       } catch (smsError) {
//         console.error('Error sending SMS notification:', smsError);
//       }
//     }

//     // Send Email notification (if email address is available)
//     if (visitorEmail) {
//       try {
//         // Example Email API call (adjust based on your email service)
//         // const emailResponse = await fetch('/api/send-email', {
//         //   method: 'POST',
//         //   headers: {
//         //     'Content-Type': 'application/json',
//         //     'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
//         //   },
//         //   body: JSON.stringify({
//         //     email: visitorEmail,
//         //     subject: 'Visitation Request Declined - BJMP Iligan',
//         //     message: message,
//         //     html: `
//         //       <html>
//         //         <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
//         //           <h2>Visitation Request Declined</h2>
//         //           <p>Dear ${visitorName || 'Visitor'},</p>
//         //           <p>We regret to inform you that your visitation request${inmateName ? ` for <strong>${inmateName}</strong>` : ''}${scheduleDate ? ` scheduled on <strong>${scheduleDate}</strong>` : ''} has been declined.</p>
//         //           <p><strong>Reason:</strong> ${declineReason}</p>
//         //           <p>If you have any questions or would like to reschedule, please contact the facility administration.</p>
//         //           <p>Thank you for your understanding.</p>
//         //           <p>- BJMP Iligan Visitation Management System</p>
//         //         </body>
//         //       </html>
//         //     `
//         //   })
//         // });
//         
//         // if (!emailResponse.ok) {
//         //   console.error('Failed to send email notification');
//         // } else {
//         //   console.log('Email notification sent successfully');
//         // }
//         
//         console.log('Email notification (commented):', {
//           email: visitorEmail,
//           subject: 'Visitation Request Declined - BJMP Iligan',
//           message: message.substring(0, 50) + '...'
//         });
//       } catch (emailError) {
//         console.error('Error sending email notification:', emailError);
//       }
//     }

//     // Log the decline reason (for audit purposes)
//     console.log('Decline reason notification prepared:', {
//       visitorName,
//       visitorPhone,
//       visitorEmail,
//       declineReason,
//       inmateName,
//       scheduleDate,
//       timestamp: new Date().toISOString()
//     });

//   } catch (error) {
//     console.error('Error in sendDeclineReasonNotification:', error);
//     // Don't throw error to prevent blocking the decline action
//     // The request has already been declined, so we just log the notification error
//   }
// }

// Export the function (commented) for potential future use
// export { sendDeclineReasonNotification };
