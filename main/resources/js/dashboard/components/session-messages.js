/**
 * Session Messages Handler
 * Displays session flash messages (success, error, etc.) on dashboard pages
 * Integrates with ThemeManager for dark mode support
 */

export function initSessionMessages() {
  // Wait for ThemeManager to be available
  const checkThemeManager = setInterval(() => {
    if (window.ThemeManager && window.Swal) {
      clearInterval(checkThemeManager);
      handleSessionMessages();
    }
  }, 100);
}

function handleSessionMessages() {
  // Check for error messages from session (server-side redirects)
  const errorMessage = getSessionMessage('error');
  const successMessage = getSessionMessage('status');
  
  // Smart error filtering to prevent false positives while maintaining security
  if (errorMessage) {
    const currentPath = window.location.pathname;
    const isPermissionError = errorMessage.toLowerCase().includes('permission') || 
                             errorMessage.toLowerCase().includes('access') ||
                             errorMessage.toLowerCase().includes('denied') ||
                             errorMessage.toLowerCase().includes('unauthorized');
    
    // Get user's role from DOM
    const userRoleElement = document.querySelector('[data-user-role]');
    const userRole = userRoleElement ? parseInt(userRoleElement.getAttribute('data-user-role')) : null;
    
    // Check if user is on an authorized page for their role
    const isOnAuthorizedPage = checkIfOnAuthorizedPage(currentPath, userRole);
    
    // ALWAYS show permission/access errors, even if user is on authorized page
    // This is because they were redirected here after trying to bypass route restrictions
    // The error indicates they tried to access an unauthorized page
    if (isPermissionError) {
      // Always show permission errors - user tried to bypass and was redirected
      showErrorMessage(errorMessage);
      return;
    }
    
    // For non-permission errors, only show if user is NOT on an authorized page
    // This prevents false positives for other types of errors
    if (!isOnAuthorizedPage) {
      showErrorMessage(errorMessage);
    }
  }
  
  if (successMessage) {
    showSuccessMessage(successMessage);
  }
}

/**
 * Check if user is on an authorized page based on their role
 * Works globally across all pages (dashboard, inmates, officers, visitors, facial recognition, etc.)
 */
function checkIfOnAuthorizedPage(currentPath, userRole) {
  if (userRole === null) return false;
  
  // Define authorized paths for each role
  const roleAuthorizedPaths = {
    0: [ // Admin - Full access
      '/admin/dashboard',
      '/admin/inmates',
      '/admin/officers',
      '/admin/visitors',
      '/admin/reports',
      '/facial-recognition',
      '/profile',
      '/visitation',
      '/visitor',
      '/inmates'
    ],
    1: [ // Warden - Full access except some admin-specific pages
      '/warden/dashboard',
      '/inmates',
      '/visitors',
      '/facial-recognition',
      '/profile',
      '/visitation',
      '/requests',
      '/supervision',
      '/reports',
      '/officers'
    ],
    2: [ // Assistant Warden - Similar to Warden
      '/assistant-warden/dashboard',
      '/inmates',
      '/visitors',
      '/facial-recognition',
      '/profile',
      '/visitation',
      '/requests',
      '/supervision',
      '/reports',
      '/officers'
    ],
    6: [ // Jail Head Nurse
      '/nurse/dashboard',
      '/profile',
      '/medical'
    ],
    7: [ // Jail Nurse
      '/nurse/dashboard',
      '/profile',
      '/medical'
    ],
    8: [ // Searcher - Limited access
      '/searcher/dashboard',
      '/facial-recognition',
      '/profile',
      '/visitors',
      '/visitation',
      '/requests'
    ]
  };
  
  const authorizedPaths = roleAuthorizedPaths[userRole] || [];
  
  // Check if current path starts with any authorized path
  return authorizedPaths.some(authorizedPath => currentPath.startsWith(authorizedPath));
}

function getSessionMessage(key) {
  // Check if there's a session message in the DOM (from Laravel session flash)
  // This would be set by the Blade template if session(key) exists
  const messageElement = document.querySelector(`[data-session-${key}]`);
  if (messageElement) {
    const message = messageElement.getAttribute(`data-session-${key}`);
    if (message && message.trim()) {
      return message.trim();
    }
  }
  
  return null;
}

function showErrorMessage(message) {
  if (!window.Swal || !window.ThemeManager) {
    // Fallback: show as alert
    console.error('Error:', message);
    return;
  }

  const isDarkMode = window.ThemeManager.isDarkMode();
  const palette = window.ThemeManager.getPalette();
  const isMobile = window.innerWidth < 640;

  window.Swal.fire({
    icon: 'error',
    title: `<span class="${isDarkMode ? 'text-white' : 'text-gray-900'} text-center sm:text-center block w-full text-base sm:text-lg font-semibold">Access Denied</span>`,
    html: `<div class="text-center sm:text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm sm:text-base leading-relaxed">${message}</div>`,
    confirmButtonText: 'OK',
    background: palette.background,
    color: palette.text,
    confirmButtonColor: palette.danger,
    width: isMobile ? '90%' : '32rem',
    padding: isMobile ? '1rem' : '1.5rem',
    customClass: {
      popup: `rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl`,
      title: `${isDarkMode ? 'text-white' : 'text-gray-900'} text-center sm:text-center block w-full mb-3 sm:mb-4`,
      htmlContainer: `text-center sm:text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mt-2 sm:mt-3`,
      confirmButton: `px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium rounded-lg transition-colors bg-red-600 hover:bg-red-700 text-white cursor-pointer mt-4 sm:mt-5`,
      actions: 'mt-4 sm:mt-5 gap-2 sm:gap-3',
    },
  });
}

function showSuccessMessage(message) {
  if (!window.Swal || !window.ThemeManager) {
    console.log('Success:', message);
    return;
  }

  const isDarkMode = window.ThemeManager.isDarkMode();
  const palette = window.ThemeManager.getPalette();
  const isMobile = window.innerWidth < 640;

  window.Swal.fire({
    icon: 'success',
    title: `<span class="${isDarkMode ? 'text-white' : 'text-gray-900'} text-center sm:text-center block w-full text-base sm:text-lg font-semibold">Success</span>`,
    html: `<div class="text-center sm:text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm sm:text-base leading-relaxed">${message}</div>`,
    timer: 3000,
    showConfirmButton: false,
    background: palette.background,
    color: palette.text,
    width: isMobile ? '90%' : '32rem',
    padding: isMobile ? '1rem' : '1.5rem',
    customClass: {
      popup: `rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl`,
      title: `${isDarkMode ? 'text-white' : 'text-gray-900'} text-center sm:text-center block w-full mb-3 sm:mb-4`,
      htmlContainer: `text-center sm:text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mt-2 sm:mt-3`,
    },
  });
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSessionMessages);
} else {
  initSessionMessages();
}

