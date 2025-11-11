/**
 * Conjugal Validation Helper Module
 * Handles eligibility checking and status display for conjugal visits
 */

// Use public endpoint for visitor requests
const API_BASE_PUBLIC = '/visitor/conjugal-visits';

/**
 * Check eligibility for conjugal visit request (Public endpoint)
 * @param {number} visitorId - The ID of the visitor
 * @param {number} inmateId - The ID of the inmate
 * @param {string} idNumber - Visitor ID number (for verification)
 * @param {string} idType - Visitor ID type (for verification)
 * @param {number} [conjugalVisitId] - Optional conjugal visit ID
 * @returns {Promise<Object>} Eligibility information
 */
export async function checkEligibility(visitorId, inmateId, idNumber = null, idType = null, conjugalVisitId = null) {
  try {
    const params = new URLSearchParams({
      visitor_id: visitorId,
      inmate_id: inmateId,
    });
    
    // Security: Include ID verification for public endpoints
    if (idNumber && idType) {
      params.append('id_number', idNumber);
      params.append('id_type', idType);
    }
    
    if (conjugalVisitId) {
      params.append('conjugal_visit_id', conjugalVisitId);
    }

    // Use public endpoint for visitor requests
    const response = await fetch(`${API_BASE_PUBLIC}/check-eligibility?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'same-origin',
    });

    if (!response.ok) {
      let errorMessage = 'Failed to check eligibility';
      
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch (parseError) {
        // If response is not JSON, use status-based message
        if (response.status === 404) {
          errorMessage = 'Eligibility check service unavailable. Please try again later.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (response.status === 403) {
          errorMessage = 'ID verification failed. Please verify your ID details.';
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Security: Generic error handling - don't expose sensitive data
    // Re-throw with sanitized message if needed
    if (error.message) {
      throw error;
    }
    throw new Error('Failed to check eligibility. Please try again.');
  }
}

/**
 * Get validation status badge HTML
 * @param {Object} validationStatus - Validation status object from API
 * @returns {string} HTML string for the badge
 */
export function getValidationStatusBadge(validationStatus) {
  if (!validationStatus) {
    return '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Unknown</span>';
  }

  if (validationStatus.is_valid) {
    return '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">VALID</span>';
  } else {
    return '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">NOT VALID</span>';
  }
}

/**
 * Format years since a given date
 * @param {string|Date} date - The date to calculate from
 * @returns {string} Formatted string (e.g., "6 years", "5.5 years")
 */
export function formatYearsSinceDate(date) {
  if (!date) return 'N/A';
  
  try {
    const startDate = new Date(date);
    const now = new Date();
    const diffTime = now - startDate;
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    
    if (diffYears < 0) {
      return 'Future date';
    }
    
    const years = Math.floor(diffYears);
    const months = Math.floor((diffYears - years) * 12);
    
    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else if (months === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
    }
  } catch (error) {
    // Security: Generic error logging
    return 'Invalid date';
  }
}

/**
 * Calculate years difference from a date to now
 * @param {string|Date} date - The date to calculate from
 * @returns {number} Number of years (can be negative if date is in the future)
 */
export function calculateYearsDifference(date) {
  if (!date) return null;
  
  try {
    const startDate = new Date(date);
    const now = new Date();
    const diffTime = now - startDate;
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return diffYears;
  } catch (error) {
    // Security: Generic error logging
    return null;
  }
}

/**
 * Get validation status message
 * @param {Object} validationStatus - Validation status object from API
 * @returns {string} Human-readable validation message
 */
export function getValidationStatusMessage(validationStatus) {
  if (!validationStatus) {
    return 'Validation status unknown';
  }

  if (validationStatus.is_valid) {
    return `Valid - ${validationStatus.years} years since relationship start`;
  } else {
    return `Not Valid - ${validationStatus.reason || 'Requirements not met'}`;
  }
}
