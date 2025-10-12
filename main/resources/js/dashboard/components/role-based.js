/**
 * Advanced Role-Based Navigation System
 * Comprehensive navigation configuration and management
 */

/**
 * Navigation Configuration System
 * Defines the complete navigation structure with categories, items, and permissions
 */
class NavigationConfig {
    constructor() {
        this.navigationStructure = {
            // Main Category
            main: {
                title: 'Main',
                order: 1,
                items: {
                    // Admin sees: Dashboard, Inmates
                    // Warden sees: Inmates, Supervision
                    dashboard: {
                        title: 'Dashboard',
                        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M10.5 3.75a.75.75 0 011.06 0l8.69 8.69a.75.75 0 11-1.06 1.06l-.19-.19V18a2.25 2.25 0 01-2.25 2.25H15a.75.75 0 01-.75-.75v-4.5h-3V19.5a.75.75 0 01-.75.75H6.25A2.25 2.25 0 014 18v-4.69l-.19.19a.75.75 0 11-1.06-1.06l7.75-7.75Z"/></svg>`,
                        route: {
                            0: 'admin.dashboard',
                            1: 'warden.dashboard',
                            2: 'dashboard',
                            3: 'dashboard'
                        },
                        roles: [0, 1, 2, 3], // Admin, Officer, Staff (not Warden)
                        order: 1
                    },
                    inmates: {
                        title: 'Inmates',
                        icon: `<svg width="16px" height="16px" viewBox="0 0 17.00 17.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="si-glyph si-glyph-person-prison" fill="#ffffff" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>771</title> <defs> </defs> <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g transform="translate(1.000000, 0.000000)" fill="#ffffff"> <path d="M12.6973076,16.022 L3.37869242,16.022 C1.53624385,16.022 0.0379999999,14.5191098 0.0379999999,12.6724147 L0.0379999999,3.37058005 C0.0379999999,1.5238849 1.53624385,0.022 3.37869242,0.022 L12.6973076,0.022 C14.5397561,0.022 16.038,1.5238849 16.038,3.37058005 L16.038,12.6724147 C16.038,14.5181045 14.5397561,16.022 12.6973076,16.022 L12.6973076,16.022 Z M3.10672887,1 C1.9450099,1 1,1.947963 1,3.11438255 L1,12.8836405 C1,14.0510485 1.9450099,15 3.10672887,15 L12.8922816,15 C14.0549901,15 15,14.0510485 15,12.8836405 L15,3.11438255 C15,1.947963 14.0549901,1 12.8922816,1 L3.10672887,1 L3.10672887,1 Z" class="si-glyph-fill"> </path> <path d="M3,1 L3,14.691 L4.03955078,14.691 L4.03955078,0.999999985 L3,1 Z" class="si-glyph-fill"> </path> <path d="M6,1 L6,14.691 L7.0189209,14.691 L7.0189209,0.999999985 L6,1 Z" class="si-glyph-fill"> </path> <path d="M9,1 L9,14.691 L10.0375977,14.691 L10.0375977,0.999999985 L9,1 Z" class="si-glyph-fill"> </path> <path d="M12,1 L12,14.691 L12.918457,14.691 L12.918457,1 L12,1 Z" class="si-glyph-fill"> </path> <g transform="translate(1.000000, 3.000000)"> <path d="M10.576,8.048 C10.177,8.635 9.681,9.507 9.105,10.546 C8.473,11.692 7.746,10.289 6.951,10.289 C6.135,10.289 5.371,11.64 4.711,10.465 C4.143,9.454 3.65,8.639 3.262,8.076 C1.252,8.076 0.216,9.376 -0.316,10.947 C-0.85,12.52 14.862,12.513 14.375,10.934 C13.89,9.354 12.838,8.048 10.576,8.048 L10.576,8.048 Z" class="si-glyph-fill"> </path> <path d="M9.977,3.154 C9.977,4.815 8.654,7.992 7.022,7.992 C5.388,7.992 4.066,4.815 4.066,3.154 C4.066,1.491 5.388,0.144 7.022,0.144 C8.653,0.145 9.977,1.491 9.977,3.154 L9.977,3.154 Z" class="si-glyph-fill"> </path> </g> </g> </g> </g></svg>`,
                        route: {
                            0: 'admin.inmates.index', // Admin
                            1: 'warden.inmates.index', // Warden
                            2: 'inmates.index', // Officer
                            3: 'inmates.index'  // Staff
                        },
                        roles: [0, 1, 2, 3], // All roles
                        order: 2
                    },
                    supervision: {
                        title: 'Supervision',
                        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" fill-rule="evenodd" d="M384 319.997V85.331H149.333c-11.782 0-21.333 9.551-21.333 21.333v216.975a63.9 63.9 0 0 1 21.333-3.642zM85.333 106.664v298.667c0 35.346 28.654 64 64 64h277.334v-85.334h-21.334v42.667h-256c-11.782 0-21.333-9.551-21.333-21.333v-21.334c0-11.782 9.551-21.333 21.333-21.333h277.334v-320H149.333c-35.346 0-64 28.654-64 64m149.334 170.667v-85.334h42.666v85.334zM256 170.664c11.782 0 21.333-9.551 21.333-21.333s-9.551-21.334-21.333-21.334s-21.333 9.552-21.333 21.334s9.551 21.333 21.333 21.333M149.333 383.997H384v21.334H149.333z" clip-rule="evenodd" stroke-width="13" stroke="currentColor"/></svg>`,
                        route: 'warden.supervision',
                        roles: [1], // Only Warden
                        order: 3,
                        dataNavItem: 'supervision'
                    }
                }
            },
            
            // Visitation Category
            visitation: {
                title: 'Visitation',
                order: 2,
                items: {
                    // Admin sees: Visitors, Facial Recognition
                    // Warden sees: Visitors, Requests
                    visitors: {
                        title: 'Visitors',
                        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M9 13.75c-2.34 0-7 1.17-7 3.5V19h14v-1.75c0-2.33-4.66-3.5-7-3.5M4.34 17c.84-.58 2.87-1.25 4.66-1.25s3.82.67 4.66 1.25zM9 12c1.93 0 3.5-1.57 3.5-3.5S10.93 5 9 5S5.5 6.57 5.5 8.5S7.07 12 9 12m0-5c.83 0 1.5.67 1.5 1.5S9.83 10 9 10s-1.5-.67-1.5-1.5S8.17 7 9 7m7.04 6.81c1.16.84 1.96 1.96 1.96 3.44V19h4v-1.75c0-2.02-3.5-3.17-5.96-3.44M15 12c1.93 0 3.5-1.57 3.5-3.5S16.93 5 15 5c-.54 0-1.04.13-1.5.35c.63.89 1 1.98 1 3.15s-.37 2.26-1 3.15c.46.22.96.35 1.5.35" stroke-width="0.3" stroke="currentColor"/></svg>`,
                        url: '/visitation/request/visitor',
                        roles: [0, 1, 2, 3], // All roles
                        order: 1
                    },
                    requests: {
                        title: 'Requests',
                        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M2 4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1zm7 6a1 1 0 1 0-2 0a1 1 0 0 0 2 0m2 0a3 3 0 1 1-6 0a3 3 0 0 1 6 0m-5.473 7.025l-1.414-1.414A5.5 5.5 0 0 1 8.003 14c1.518 0 2.894.617 3.888 1.61l-1.414 1.415A3.5 3.5 0 0 0 8.002 16c-.967 0-1.84.39-2.475 1.025M13 15V9h2v6zm4 0V9h2v6z" stroke-width="0.3" stroke="currentColor"/></svg>`,
                        href: '#',
                        roles: [1, 2, 3], // Warden, Officer, Staff (not Admin)
                        order: 2,
                        dataNavItem: 'requests'
                    },
                    facialRecognition: {
                        title: 'Facial Recognition',
                        icon: `<svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.9998 10.5004C15.9998 11.3288 15.5521 12.0004 14.9998 12.0004C14.4475 12.0004 13.9998 11.3288 13.9998 10.5004C13.9998 9.67196 14.4475 9.00039 14.9998 9.00039C15.5521 9.00039 15.9998 9.67196 15.9998 10.5004Z" fill="#FFFFFF"/><path d="M9.99982 10.5004C9.99982 11.3288 9.5521 12.0004 8.99982 12.0004C8.44753 12.0004 7.99982 11.3288 7.99982 10.5004C7.99982 9.67196 8.44753 9.00039 8.99982 9.00039C9.5521 9.00039 9.99982 9.67196 9.99982 10.5004Z" fill="#FFFFFF"/><path fill-rule="evenodd" clip-rule="evenodd" d="M13.2648 2.05116C13.3472 1.64522 13.7431 1.38294 14.149 1.46533C18.3625 2.32056 21.6797 5.63763 22.535 9.85114C22.6173 10.2571 22.3551 10.6529 21.9491 10.7353C21.5432 10.8177 21.1473 10.5555 21.0649 10.1495C20.3295 6.52642 17.4738 3.67075 13.8506 2.93535C13.4447 2.85296 13.1824 2.45709 13.2648 2.05116ZM10.735 2.05121C10.8174 2.45714 10.5551 2.85301 10.1492 2.93541C6.52602 3.6708 3.67032 6.52647 2.93486 10.1496C2.85246 10.5555 2.45659 10.8178 2.05065 10.7354C1.64472 10.653 1.38244 10.2571 1.46484 9.85119C2.32014 5.63769 5.63726 2.32061 9.85079 1.46538C10.2567 1.38299 10.6526 1.64527 10.735 2.05121ZM2.05081 13.2654C2.45675 13.183 2.85262 13.4453 2.93502 13.8512C3.67048 17.4743 6.52618 20.33 10.1493 21.0654C10.5553 21.1478 10.8175 21.5436 10.7351 21.9496C10.6528 22.3555 10.2569 22.6178 9.85095 22.5354C5.63742 21.6802 2.3203 18.3631 1.465 14.1496C1.3826 13.7437 1.64488 13.3478 2.05081 13.2654ZM21.9491 13.2654C22.3551 13.3478 22.6173 13.7437 22.535 14.1496C21.6797 18.3631 18.3625 21.6802 14.149 22.5354C13.7431 22.6178 13.3472 22.3555 13.2648 21.9496C13.1824 21.5436 13.4447 21.1478 13.8506 21.0654C17.4738 20.33 20.3295 17.4743 21.0649 13.8512C21.1473 13.4453 21.5432 13.183 21.9491 13.2654ZM8.39729 15.5538C8.64395 15.221 9.11366 15.1512 9.44643 15.3979C10.1748 15.9377 11.0539 16.2504 11.9998 16.2504C12.9457 16.2504 13.8249 15.9377 14.5532 15.3979C14.886 15.1512 15.3557 15.221 15.6023 15.5538C15.849 15.8865 15.7792 16.3563 15.4464 16.6029C14.474 17.3237 13.2848 17.7504 11.9998 17.7504C10.7148 17.7504 9.52562 17.3237 8.55321 16.6029C8.22044 16.3563 8.15063 15.8865 8.39729 15.5538Z" fill="#FFFFFF"/></svg>`,
                        href: '#',
                        roles: [0, 2, 3], // Admin, Officer, Staff (not Warden)
                        order: 3,
                        dataNavItem: 'facial-recognition'
                    }
                }
            },
            
            // Administration Category
            administration: {
                title: 'Administration',
                order: 3,
                items: {
                    reports: {
                        title: 'Reports',
                        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M10.58 9.902a.41.41 0 0 1-.407.408H5.826a.408.408 0 0 1 0-.816h4.347a.41.41 0 0 1 .408.408m-.407-2.581H5.826a.408.408 0 0 0 0 .815h4.347a.408.408 0 0 0 0-.815m3.668-4.483v11.411a.95.95 0 0 1-.95.951H3.108a.95.95 0 0 1-.95-.95V2.837a.95.95 0 0 1 .95-.951h2.525a3.118 3.118 0 0 1 4.732 0h2.524a.95.95 0 0 1 .951.95M5.69 3.923v.135h4.618v-.135a2.31 2.31 0 1 0-4.619 0m7.335-1.087a.136.136 0 0 0-.136-.136h-2.015c.165.386.25.802.25 1.223v.543a.41.41 0 0 1-.408.408H5.283a.41.41 0 0 1-.408-.408v-.543c0-.42.085-.837.25-1.223H3.108a.136.136 0 0 0-.136.136v11.411a.136.136 0 0 0 .136.136h9.781a.136.136 0 0 0 .136-.136z" stroke-width="0.3" stroke="currentColor"/></svg>`,
                        href: '#',
                        roles: [0, 1, 2, 3],
                        order: 1
                    },
                    profile: {
                        title: 'Profile',
                        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855"/></svg>`,
                        route: 'profile.edit',
                        roles: [0, 1, 2, 3],
                        order: 2
                    },
                    officers: {
                        title: 'Officers',
                        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48"><g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" stroke-width="0.5" stroke="currentColor"><path d="M13.5 10.097C13.5 7.774 24 6 24 6s10.5 1.774 10.5 4.097c0 3.097-1.91 4.403-1.91 4.403H15.41s-1.91-1.306-1.91-4.403m12.5-.53s-1.467-.534-2-1.067c-.533.533-2 1.067-2 1.067s.4 2.933 2 2.933s2-2.933 2-2.933m5.814 8.713c1.39-1.085 1.174-2.28 1.174-2.28H15.012s-.217 1.195 1.174 2.28a8 8 0 1 0 15.629 0M24 20c2.721 0 4.624-.314 5.952-.766q.047.376.048.766a6 6 0 1 1-11.952-.766c1.329.452 3.23.766 5.952.766"/><path d="m16.879 28l6.477 5.457a1 1 0 0 0 1.288 0L31.121 28S42 31.393 42 35.467V42H6v-6.533C6 31.393 16.879 28 16.879 28m-4.154 9.207a1 1 0 0 1-.725-.961V35h7v1.246a1 1 0 0 1-.725.961l-2.5.715a1 1 0 0 1-.55 0zm20.94-4.082a.17.17 0 0 0-.33 0l-.471 1.52a.174.174 0 0 1-.165.126h-1.526c-.167 0-.237.225-.101.328l1.234.94c.06.046.086.128.063.202l-.471 1.52c-.052.168.13.307.266.204l1.234-.94a.166.166 0 0 1 .204 0l1.234.94c.136.103.318-.036.267-.203l-.472-1.52a.19.19 0 0 1 .063-.203l1.234-.94c.136-.103.066-.328-.101-.328H34.3a.174.174 0 0 1-.165-.125z"/></g></svg>`,
                        route: {
                            0: 'admin.officers.index',
                            1: 'warden.officers.index',
                            2: 'officers.index',
                            3: 'officers.index'
                        },
                        roles: [0, 1, 2, 3],
                        order: 3
                    }
                }
            }
        };

        // Role inheritance and extensions
        this.roleExtensions = {
            // Future roles can extend existing ones
            4: { // Assistant Warden (example)
                inherits: 1, // Inherits from Warden
                customItems: {
                    // Custom navigation items for Assistant Warden
                },
                overrides: {
                    // Override specific permissions
                }
            }
        };
    }

    /**
     * Get navigation structure for a specific role
     */
    getNavigationForRole(roleId) {
        const navigation = {};
        
        // Process each category
        Object.entries(this.navigationStructure).forEach(([categoryKey, category]) => {
            const categoryItems = {};
            
            // Process each item in the category
            Object.entries(category.items).forEach(([itemKey, item]) => {
                if (this.hasPermission(roleId, item.roles)) {
                    const resolvedUrl = this.resolveUrl(item, roleId);
                    const isActive = this.isActiveRoute(item, roleId);
                    
                    categoryItems[itemKey] = {
                        ...item,
                        href: resolvedUrl,
                        isActive: isActive,
                        // Add route matching for Blade template compatibility
                        routeMatches: this.getRouteMatches(item, roleId)
                    };
                }
            });
            
            // Only include category if it has items
            if (Object.keys(categoryItems).length > 0) {
                navigation[categoryKey] = {
                    title: category.title,
                    order: category.order,
                    items: categoryItems
                };
            }
        });
        
        return navigation;
    }

    /**
     * Check if role has permission for an item
     */
    hasPermission(roleId, allowedRoles) {
        return allowedRoles.includes(roleId);
    }

    /**
     * Resolve URL for navigation item based on role
     */
    resolveUrl(item, roleId) {
        if (item.url) return item.url;
        if (item.href) return item.href;
        if (item.route) {
            if (typeof item.route === 'object') {
                return this.route(item.route[roleId] || item.route[0]);
            }
            return this.route(item.route);
        }
        return '#';
    }

    /**
     * Helper to generate Laravel route URLs
     */
    route(routeName) {
        // Map Laravel route names to actual URLs based on web.php
        const routeMap = {
            // Dashboard routes
            'dashboard': '/dashboard',
            'admin.dashboard': '/admin/dashboard',
            'warden.dashboard': '/warden/dashboard',
            
            // Inmates routes
            'admin.inmates.index': '/admin/inmates',
            'warden.inmates.index': '/warden/inmates',
            'inmates.index': '/inmates',
            'admin.inmates.female': '/admin/inmates/female',
            'warden.inmates.female': '/warden/inmates/female',
            
            // Officers routes
            'admin.officers.index': '/admin/officers',
            'warden.officers.index': '/warden/officers',
            'officers.index': '/officers',
            
            // Profile routes
            'profile.edit': '/profile',
            
            // Supervision routes
            'warden.supervision': '/warden/supervision',
            
            // Visitation routes
            'visitation.request.visitor': '/visitation/request/visitor'
        };
        
        return routeMap[routeName] || `/${routeName.replace(/\./g, '/')}`;
    }

    /**
     * Check if route is currently active
     */
    isActiveRoute(item, roleId) {
        const currentPath = window.location.pathname;
        const itemUrl = this.resolveUrl(item, roleId);
        
        // Direct path match
        if (currentPath === itemUrl) {
            return true;
        }
        
        // Check for route patterns based on current Laravel routing
        if (item.route) {
            const routeName = typeof item.route === 'object' ? item.route[roleId] : item.route;
            
            // Special cases for active detection
            switch (routeName) {
                case 'dashboard':
                case 'admin.dashboard':
                case 'warden.dashboard':
                    return currentPath === '/dashboard' || 
                           currentPath === '/admin/dashboard' || 
                           currentPath === '/warden/dashboard';
                           
                case 'admin.inmates.index':
                case 'warden.inmates.index':
                case 'inmates.index':
                    return currentPath.includes('/inmates') && !currentPath.includes('/officers');
                    
                case 'admin.officers.index':
                case 'warden.officers.index':
                case 'officers.index':
                    return currentPath.includes('/officers');
                    
                case 'profile.edit':
                    return currentPath === '/profile';
                    
                case 'warden.supervision':
                    return currentPath === '/warden/supervision';
                    
                case 'visitation.request.visitor':
                    return currentPath === '/visitation/request/visitor';
            }
        }
        
        return false;
    }

    /**
     * Get route patterns for Blade template compatibility
     */
    getRouteMatches(item, roleId) {
        if (!item.route) return [];
        
        const routeName = typeof item.route === 'object' ? item.route[roleId] : item.route;
        const matches = [routeName];
        
        // Add wildcard patterns for nested routes
        switch (routeName) {
            case 'admin.inmates.index':
                matches.push('admin.inmates.*', 'inmates.*');
                break;
            case 'warden.inmates.index':
                matches.push('warden.inmates.*', 'inmates.*');
                break;
            case 'inmates.index':
                matches.push('inmates.*');
                break;
            case 'admin.officers.index':
                matches.push('admin.officers.*', 'officers.*');
                break;
            case 'warden.officers.index':
                matches.push('warden.officers.*', 'officers.*');
                break;
            case 'officers.index':
                matches.push('officers.*');
                break;
            case 'dashboard':
            case 'admin.dashboard':
            case 'warden.dashboard':
                matches.push('dashboard', 'admin.dashboard', 'warden.dashboard');
                break;
        }
        
        return matches;
    }
}

/**
 * Advanced Navigation Manager
 * Handles dynamic sidebar generation and management
 */
class NavigationManager {
    constructor() {
        this.config = new NavigationConfig();
        this.userRole = this.getUserRole();
        this.cache = new Map();
    }

    /**
     * Get user role from DOM
     */
    getUserRole() {
        const userRoleElement = document.querySelector('[data-user-role]');
        return userRoleElement ? parseInt(userRoleElement.getAttribute('data-user-role')) : null;
    }

    /**
     * Generate complete sidebar HTML
     */
    generateSidebar() {
        if (!this.userRole && this.userRole !== 0) {
            console.warn('NavigationManager: User role not found');
            return '';
        }

        const cacheKey = `sidebar_${this.userRole}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const navigation = this.config.getNavigationForRole(this.userRole);
        const sidebarHtml = this.renderSidebar(navigation);
        
        this.cache.set(cacheKey, sidebarHtml);
        return sidebarHtml;
    }

    /**
     * Render sidebar HTML from navigation structure
     */
    renderSidebar(navigation) {
        let html = '';
        
        // Sort categories by order
        const sortedCategories = Object.entries(navigation)
            .sort(([,a], [,b]) => a.order - b.order);

        sortedCategories.forEach(([categoryKey, category], index) => {
            // Add category header for all categories
            html += `<div class="px-3 ${index === 0 ? 'pb-2' : 'pt-4 pb-2'} text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">${category.title}</div>`;

            // Sort items by order
            const sortedItems = Object.entries(category.items)
                .sort(([,a], [,b]) => a.order - b.order);

            // Render items
            sortedItems.forEach(([itemKey, item]) => {
                html += this.renderNavigationItem(item, itemKey);
            });
        });

        return html;
    }

    /**
     * Render individual navigation item
     */
    renderNavigationItem(item, itemKey) {
        const dataNavItem = item.dataNavItem ? `data-nav-item="${item.dataNavItem}"` : '';
        const activeClass = item.isActive 
            ? 'border-blue-500 bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50'
            : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800';

        return `
            <a href="${item.href}" class="group flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 ${activeClass} cursor-pointer" ${dataNavItem}>
                ${item.icon}
                <span>${item.title}</span>
            </a>
        `;
    }

    /**
     * Apply role-based visibility (enhanced for backward compatibility)
     */
    applyRoleBasedVisibility() {
        if (!this.userRole && this.userRole !== 0) {
            console.warn('NavigationManager: User role not found, skipping visibility control');
            return;
        }

        const navigation = this.config.getNavigationForRole(this.userRole);
        
        // Create a set of allowed items for this role
        const allowedItems = new Set();
        Object.values(navigation).forEach(category => {
            Object.values(category.items).forEach(item => {
                if (item.dataNavItem) {
                    allowedItems.add(item.dataNavItem);
                }
            });
        });

        // Apply visibility rules based on role configuration
        const roleRules = {
            0: { // Admin
                hide: ['requests', 'supervision'],
                show: ['facial-recognition']
            },
            1: { // Warden  
                hide: ['facial-recognition'],
                show: ['requests', 'supervision']
            },
            2: { // Officer
                hide: ['supervision'],
                show: ['requests', 'facial-recognition']
            },
            3: { // Staff
                hide: ['supervision'],
                show: ['requests', 'facial-recognition']
            }
        };

        const currentRules = roleRules[this.userRole];
        if (currentRules) {
            // Hide items
            currentRules.hide.forEach(item => {
                const elements = document.querySelectorAll(`[data-nav-item="${item}"]`);
        elements.forEach(element => {
            element.style.display = 'none';
            element.classList.add('hidden');
        });
    });

            // Show items
    currentRules.show.forEach(item => {
        const elements = document.querySelectorAll(`[data-nav-item="${item}"]`);
        elements.forEach(element => {
            element.style.display = '';
            element.classList.remove('hidden');
        });
            });
        }

        console.log(`Role-based visibility applied for role ${this.userRole}`);
    }

    /**
     * Initialize dynamic sidebar replacement
     */
    initializeDynamicSidebar() {
        const sidebarNav = document.querySelector('[data-sidebar-nav]');
        if (sidebarNav) {
            // Generate and replace sidebar content completely
            const sidebarHtml = this.generateSidebar();
            if (sidebarHtml) {
                sidebarNav.innerHTML = sidebarHtml;
                
                // Add page and role-specific informational card
                this.addInformationalCard(sidebarNav);
            }
        }
    }

    /**
     * Add role-specific informational card
     */
    addInformationalCard(container) {
        const cardHtml = this.generateInformationalCard();
        if (cardHtml) {
            container.insertAdjacentHTML('beforeend', cardHtml);
        }
    }

    /**
     * Generate page and role-specific informational card
     */
    generateInformationalCard() {
        // Get current page context
        const currentPath = window.location.pathname;
        const pageContext = this.getPageContext(currentPath);
        
        // Page and role-specific cards configuration
        const contextualCards = {
            // Admin role cards (role_id: 0)
            0: {
                dashboard: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586l-2 2V6H5v12h6.586l-2 2H4a1 1 0 01-1-1V4z"/><path d="M17.414 8L19 9.586 11.586 17H10v-1.586L17.414 8z"/></svg>`,
                    text: 'Admin Dashboard: Monitor system overview and key metrics daily for optimal facility management.'
                },
                inmates: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
                    text: 'Admin Inmates: Facial recognition technology replaces QR scanning for enhanced security.'
                },
                officers: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-6h3v-2.5c0-1.1.9-2 2-2h2V6H9.5C8.67 6 8 5.33 8 4.5S8.67 3 9.5 3h5c.83 0 1.5.67 1.5 1.5S15.33 6 14.5 6H13v1.5h2c1.1 0 2 .9 2 2V12h3v6H4z"/></svg>`,
                    text: 'Admin Officers: Manage officer schedules, duty assignments, and performance evaluations.'
                },
                profile: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`,
                    text: 'Admin Profile: Update your administrator profile and security settings for system access.'
                }
            },
            // Warden role cards (role_id: 1)
            1: {
                dashboard: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>`,
                    text: 'Warden Dashboard: Oversee facility operations and monitor staff performance metrics.'
                },
                inmates: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m0 10c2.7 0 5.8 1.29 6 2H6c.23-.72 3.31-2 6-2m0-12C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
                    text: 'Warden Inmates: Review inmate classifications, housing assignments, and behavioral reports.'
                },
                supervision: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-1 16H9V7h9v14z"/></svg>`,
                    text: 'Warden Supervision: Monitor supervision reports, incident logs, and security protocols.'
                },
                officers: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
                    text: 'Warden Officers: Evaluate officer performance and conduct comprehensive reviews.'
                },
                profile: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`,
                    text: 'Warden Profile: Manage your warden credentials and administrative access levels.'
                }
            },
            // Officer role cards (role_id: 2)
            2: {
                dashboard: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
                    text: 'Officer Dashboard: Keep records updated and verified daily for accurate reporting.'
                },
                inmates: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zM4 19h16v2H4z"/></svg>`,
                    text: 'Officer Inmates: Document inmate activities and maintain behavioral observation notes.'
                },
                officers: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2z"/></svg>`,
                    text: 'Officer Coordination: Coordinate with fellow officers on duty shifts and protocols.'
                },
                profile: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>`,
                    text: 'Officer Profile: Update your officer profile and emergency contact information.'
                }
            },
            // Staff role cards (role_id: 3)
            3: {
                dashboard: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>`,
                    text: 'Staff Dashboard: Support daily operations efficiently and effectively for smooth workflow.'
                },
                inmates: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
                    text: 'Staff Inmates: Assist with inmate processing and administrative documentation tasks.'
                },
                officers: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>`,
                    text: 'Staff Officers: Provide administrative support to officers and management teams.'
                },
                profile: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>`,
                    text: 'Staff Profile: Maintain your staff profile and work schedule preferences.'
                }
            }
        };

        // Get the appropriate card based on role and page context
        const roleCards = contextualCards[this.userRole];
        if (!roleCards) return '';

        const card = roleCards[pageContext] || roleCards['dashboard']; // Fallback to dashboard
        if (!card) return '';

        return `
            <div class="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 flex items-center justify-center">
                        ${card.icon}
                    </div>
                    <div class="flex-1 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        ${card.text}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Determine page context from current URL
     */
    getPageContext(currentPath) {
        // Remove leading/trailing slashes and split path
        const pathSegments = currentPath.replace(/^\/+|\/+$/g, '').split('/');
        
        // Determine page context based on URL patterns
        if (currentPath.includes('/dashboard')) return 'dashboard';
        if (currentPath.includes('/inmates')) return 'inmates';
        if (currentPath.includes('/officers')) return 'officers';
        if (currentPath.includes('/supervision')) return 'supervision';
        if (currentPath.includes('/profile')) return 'profile';
        
        // Check for specific patterns
        if (pathSegments.includes('admin') || pathSegments.includes('warden')) {
            const lastSegment = pathSegments[pathSegments.length - 1];
            if (lastSegment === 'admin' || lastSegment === 'warden' || lastSegment === '') {
                return 'dashboard';
            }
            return lastSegment;
        }
        
        // Default fallback
        return 'dashboard';
    }
}

/**
 * Main initialization function - Now fully dynamic
 */
export default function initRoleBasedNavigation() {
    const manager = new NavigationManager();
    
    // Always use dynamic sidebar generation
    manager.initializeDynamicSidebar();
    
    console.log('Dynamic role-based navigation initialized for role:', manager.userRole);
}

/**
 * Export classes for advanced usage
 */
export { NavigationConfig, NavigationManager };

/**
 * Advanced role-based access control
 * Provides more granular control over UI elements with enhanced features
 */
export function createRoleBasedAccessControl() {
    const manager = new NavigationManager();
    
    return {
        // Enhanced role checking with inheritance support
        hasRole(roleId) {
            const userRoleElement = document.querySelector('[data-user-role]');
            const userRole = userRoleElement ? parseInt(userRoleElement.getAttribute('data-user-role')) : null;
            return userRole === roleId;
        },

        // Check multiple roles at once
        hasAnyRole(roleIds) {
            const userRoleElement = document.querySelector('[data-user-role]');
            const userRole = userRoleElement ? parseInt(userRoleElement.getAttribute('data-user-role')) : null;
            return roleIds.includes(userRole);
        },

        // Role hierarchy checking (higher roles include lower permissions)
        hasRoleOrHigher(minRoleId) {
            const userRoleElement = document.querySelector('[data-user-role]');
            const userRole = userRoleElement ? parseInt(userRoleElement.getAttribute('data-user-role')) : null;
            
            // Role hierarchy: 0 (Admin) > 1 (Warden) > 2 (Officer) > 3 (Staff)
            const hierarchy = { 0: 4, 1: 3, 2: 2, 3: 1 };
            return hierarchy[userRole] >= hierarchy[minRoleId];
        },

        // Predefined role checks
        isAdmin() { return this.hasRole(0); },
        isWarden() { return this.hasRole(1); },
        isOfficer() { return this.hasRole(2); },
        isStaff() { return this.hasRole(3); },

        // Advanced permission checking
        canAccess(feature) {
            const navigation = manager.config.getNavigationForRole(manager.userRole);
            
            // Check if feature exists in user's navigation
            for (const category of Object.values(navigation)) {
                for (const item of Object.values(category.items)) {
                    if (item.dataNavItem === feature || item.title.toLowerCase() === feature.toLowerCase()) {
                        return true;
                    }
                }
            }
            return false;
        },

        // Dynamic element visibility with advanced conditions
        setElementVisibility(selector, condition) {
            const elements = document.querySelectorAll(selector);
            const isVisible = typeof condition === 'function' ? condition(manager.userRole) : condition;
            
            elements.forEach(element => {
                if (isVisible) {
                    element.style.display = '';
                    element.classList.remove('hidden');
                    element.setAttribute('aria-hidden', 'false');
                } else {
                    element.style.display = 'none';
                    element.classList.add('hidden');
                    element.setAttribute('aria-hidden', 'true');
                }
            });
        },

        // Conditional element manipulation
        hideForRoles(elementSelectors, roles) {
            const userRole = manager.userRole;
            
            if (roles.includes(userRole)) {
                elementSelectors.forEach(selector => {
                    this.setElementVisibility(selector, false);
                });
            }
        },

        showForRoles(elementSelectors, roles) {
            const userRole = manager.userRole;
            
            if (roles.includes(userRole)) {
                elementSelectors.forEach(selector => {
                    this.setElementVisibility(selector, true);
                });
            }
        },

        // Advanced conditional visibility
        showIf(selector, condition) {
            this.setElementVisibility(selector, condition);
        },

        hideIf(selector, condition) {
            this.setElementVisibility(selector, !condition);
        },

        // Feature flag support
        isFeatureEnabled(featureName) {
            // This could integrate with a feature flag system
            const features = {
                'facial-recognition': this.hasAnyRole([0, 2, 3]),
                'supervision': this.hasRole(1),
                'advanced-reports': this.hasRoleOrHigher(1),
                'user-management': this.hasRoleOrHigher(0)
            };
            
            return features[featureName] || false;
        },

        // Navigation utilities
        getAvailableNavigation() {
            return manager.config.getNavigationForRole(manager.userRole);
        },

        // Dynamic navigation updates
        refreshNavigation() {
            manager.cache.clear();
            manager.initializeDynamicSidebar();
        },

        // Event-driven updates
        onRoleChange(callback) {
            // Observer for role changes
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'data-user-role') {
                        manager.userRole = manager.getUserRole();
                        manager.cache.clear();
                        callback(manager.userRole);
                    }
                });
            });

            const userElement = document.querySelector('[data-user-role]');
            if (userElement) {
                observer.observe(userElement, { attributes: true });
            }

            return observer;
        },

        // Performance monitoring
        getPerformanceMetrics() {
            return {
                cacheSize: manager.cache.size,
                userRole: manager.userRole,
                navigationItemCount: Object.keys(manager.getAvailableNavigation()).length
            };
        }
    };
}

