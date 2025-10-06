/**
 * Role-based navigation visibility controller
 * Hides/shows navigation items based on user role
 */
export default function initRoleBasedNavigation() {
    // Get user role from data attributes or global variables
    const userRoleElement = document.querySelector('[data-user-role]');
    const userRole = userRoleElement ? parseInt(userRoleElement.getAttribute('data-user-role')) : null;
    
    console.log('Role-based navigation: Checking user role:', userRole);
    
    if (!userRole && userRole !== 0) {
        console.warn('Role-based navigation: User role not found');
        return;
    }

    // Define role-based visibility rules
    const roleRules = {
        // Admin (role_id: 0) - hide Schedules, Requests, and Supervision
        0: {
            hide: ['schedules', 'requests', 'supervision'],
            show: []
        },
        // Warden (role_id: 1) - hide Facial Recognition, show Supervision
        1: {
            hide: ['facial-recognition'],
            show: ['schedules', 'requests', 'supervision']
        },
        // Officer (role_id: 2) - hide Supervision
        2: {
            hide: ['supervision'],
            show: ['schedules', 'requests']
        },
        // Staff (role_id: 3) - hide Supervision
        3: {
            hide: ['supervision'],
            show: ['schedules', 'requests']
        }
    };

    const currentRules = roleRules[userRole];
    
    if (!currentRules) {
        console.warn(`Role-based navigation: No rules defined for role ${userRole}`);
        return;
    }

    // Apply visibility rules (affect ALL matching elements)
    currentRules.hide.forEach(item => {
        const elements = document.querySelectorAll(`[data-nav-item="${item}"]`);
        if (elements.length === 0) {
            console.warn(`Element not found: [data-nav-item="${item}"]`);
            return;
        }
        elements.forEach(element => {
            element.style.display = 'none';
            element.classList.add('hidden');
        });
        console.log(`Hidden elements: ${item} (count: ${elements.length})`);
    });

    currentRules.show.forEach(item => {
        const elements = document.querySelectorAll(`[data-nav-item="${item}"]`);
        elements.forEach(element => {
            element.style.display = '';
            element.classList.remove('hidden');
        });
        if (elements.length > 0) {
            console.log(`Shown elements: ${item} (count: ${elements.length})`);
        }
    });

    // Log for debugging
    console.log(`Role-based navigation applied for role ${userRole}:`, {
        hidden: currentRules.hide,
        shown: currentRules.show
    });
}

/**
 * Advanced role-based access control
 * Provides more granular control over UI elements
 */
export function createRoleBasedAccessControl() {
    return {
        // Check if user has specific role
        hasRole(roleId) {
            const userRoleElement = document.querySelector('[data-user-role]');
            const userRole = userRoleElement ? parseInt(userRoleElement.getAttribute('data-user-role')) : null;
            return userRole === roleId;
        },

        // Check if user is admin
        isAdmin() {
            return this.hasRole(0);
        },

        // Check if user is warden
        isWarden() {
            return this.hasRole(1);
        },

        // Check if user is officer
        isOfficer() {
            return this.hasRole(2);
        },

        // Check if user is staff
        isStaff() {
            return this.hasRole(3);
        },

        // Hide elements for specific roles
        hideForRoles(elementSelectors, roles) {
            const userRoleElement = document.querySelector('[data-user-role]');
            const userRole = userRoleElement ? parseInt(userRoleElement.getAttribute('data-user-role')) : null;
            
            if (roles.includes(userRole)) {
                elementSelectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        element.style.display = 'none';
                        element.classList.add('hidden');
                    });
                });
            }
        },

        // Show elements for specific roles
        showForRoles(elementSelectors, roles) {
            const userRoleElement = document.querySelector('[data-user-role]');
            const userRole = userRoleElement ? parseInt(userRoleElement.getAttribute('data-user-role')) : null;
            
            if (roles.includes(userRole)) {
                elementSelectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        element.style.display = '';
                        element.classList.remove('hidden');
                    });
                });
            }
        }
    };
}

