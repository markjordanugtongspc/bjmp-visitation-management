/**
 * Conjugal Validation Helper Module
 * Handles eligibility checking and status display for conjugal visits
 */

const API_BASE = '/api/conjugal-visits';

/**
 * Check eligibility for conjugal visit request
 * @param {number} visitorId - The ID of the visitor
 * @param {number} inmateId - The ID of the inmate
 * @param {number} [conjugalVisitId] - Optional conjugal visit ID
 * @returns {Promise<Object>} Eligibility information
 */
export async function checkEligibility(visitorId, inmateId, conjugalVisitId = null) {
  try {
    const params = new URLSearchParams({
      visitor_id: visitorId,
      inmate_id: inmateId,
    });
    
    if (conjugalVisitId) {
      params.append('conjugal_visit_id', conjugalVisitId);
    }

    const response = await fetch(`${API_BASE}/check-eligibility?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'same-origin',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to check eligibility');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking eligibility:', error);
    throw error;
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
    console.error('Error formatting years since date:', error);
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
    console.error('Error calculating years difference:', error);
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
