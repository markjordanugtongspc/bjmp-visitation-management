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
                        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M10.5 3.75a.75.75 0 011.06 0l8.69 8.69a.75.75 0 11-1.06 1.06l-.19-.19V18a2.25 2.25 0 01-2.25 2.25H15a.75.75 0 01-.75-.75v-4.5h-3V19.5a.75.75 0 01-.75 0H6.25A2.25 2.25 0 014 18v-4.69l-.19.19a.75.75 0 11-1.06-1.06l7.75-7.75Z"/></svg>`,
                        route: {
                            0: 'admin.dashboard',
                            1: 'warden.dashboard',
                            2: 'assistant-warden.dashboard',
                            8: 'searcher.dashboard',
                            6: 'nurse.dashboard',
                            7: 'nurse.dashboard'
                        },
                        roles: [0, 1, 2, 8, 6, 7], // Admin, Warden, Assistant Warden, Searcher, Jail Head Nurse, Jail Nurse
                        order: 1
                    },
                    inmates: {
                        title: 'Inmates',
                        icon: `<svg width="16px" height="16px" viewBox="0 0 17.00 17.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="si-glyph si-glyph-person-prison h-4 w-4" fill="currentColor" stroke="currentColor"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>771</title> <defs> </defs> <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g transform="translate(1.000000, 0.000000)" fill="currentColor"> <path d="M12.6973076,16.022 L3.37869242,16.022 C1.53624385,16.022 0.0379999999,14.5191098 0.0379999999,12.6724147 L0.0379999999,3.37058005 C0.0379999999,1.5238849 1.53624385,0.022 3.37869242,0.022 L12.6973076,0.022 C14.5397561,0.022 16.038,1.5238849 16.038,3.37058005 L16.038,12.6724147 C16.038,14.5181045 14.5397561,16.022 12.6973076,16.022 L12.6973076,16.022 Z M3.10672887,1 C1.9450099,1 1,1.947963 1,3.11438255 L1,12.8836405 C1,14.0510485 1.9450099,15 3.10672887,15 L12.8922816,15 C14.0549901,15 15,14.0510485 15,12.8836405 L15,3.11438255 C15,1.947963 14.0549901,1 12.8922816,1 L3.10672887,1 L3.10672887,1 Z" class="si-glyph-fill"> </path> <path d="M3,1 L3,14.691 L4.03955078,14.691 L4.03955078,0.999999985 L3,1 Z" class="si-glyph-fill"> </path> <path d="M6,1 L6,14.691 L7.0189209,14.691 L7.0189209,0.999999985 L6,1 Z" class="si-glyph-fill"> </path> <path d="M9,1 L9,14.691 L10.0375977,14.691 L10.0375977,0.999999985 L9,1 Z" class="si-glyph-fill"> </path> <path d="M12,1 L12,14.691 L12.918457,14.691 L12.918457,1 L12,1 Z" class="si-glyph-fill"> </path> <g transform="translate(1.000000, 3.000000)"> <path d="M10.576,8.048 C10.177,8.635 9.681,9.507 9.105,10.546 C8.473,11.692 7.746,10.289 6.951,10.289 C6.135,10.289 5.371,11.64 4.711,10.465 C4.143,9.454 3.65,8.639 3.262,8.076 C1.252,8.076 0.216,9.376 -0.316,10.947 C-0.85,12.52 14.862,12.513 14.375,10.934 C13.89,9.354 12.838,8.048 10.576,8.048 L10.576,8.048 Z" class="si-glyph-fill"> </path> <path d="M9.977,3.154 C9.977,4.815 8.654,7.992 7.022,7.992 C5.388,7.992 4.066,4.815 4.066,3.154 C4.066,1.491 5.388,0.144 7.022,0.144 C8.653,0.145 9.977,1.491 9.977,3.154 L9.977,3.154 Z" class="si-glyph-fill"> </path> </g> </g> </g> </g></svg>`,
                        route: {
                            0: 'admin.inmates.index', // Admin
                            1: 'warden.inmates.index', // Warden
                            2: 'assistant-warden.inmates.index', // Assistant Warden
                            6: 'nurse.dashboard', // Jail Head Nurse
                            7: 'nurse.dashboard'  // Jail Nurse
                        },
                        roles: [0, 1, 2], // Admin, Warden, and Assistant Warden (nurses don't see inmates directly)
                        order: 2
                    },
                    supervision: {
                        title: 'Supervision',
                        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" fill-rule="evenodd" d="M384 319.997V85.331H149.333c-11.782 0-21.333 9.551-21.333 21.333v216.975a63.9 63.9 0 0 1 21.333-3.642zM85.333 106.664v298.667c0 35.346 28.654 64 64 64h277.334v-85.334h-21.334v42.667h-256c-11.782 0-21.333-9.551-21.333-21.333v-21.334c0-11.782 9.551-21.333 21.333-21.333h277.334v-320H149.333c-35.346 0-64 28.654-64 64m149.334 170.667v-85.334h42.666v85.334zM256 170.664c11.782 0 21.333-9.551 21.333-21.333s-9.551-21.334-21.333-21.334s-21.333 9.552-21.333 21.334s9.551 21.333 21.333 21.333M149.333 383.997H384v21.334H149.333z" clip-rule="evenodd" stroke-width="13" stroke="currentColor"/></svg>`,
                        route: {
                            1: 'warden.supervision',
                            2: 'assistant-warden.supervision'
                        },
                        roles: [1, 2], // Warden and Assistant Warden
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
                        route: {
                            0: 'admin.visitors.index',
                            1: 'warden.visitors.index',
                            2: 'assistant-warden.visitors.index',
                            8: 'searcher.visitors.index'
                        },
                        roles: [0, 1, 2, 8], // Admin, Warden, Assistant Warden, Searcher
                        order: 1
                    },
                    requests: {
                        title: 'Requests',
                        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><rect width="24" height="24" fill="none"/><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M13.578 16.775a.97.97 0 0 0-.31-.715L7.3 10.554L1.33 16.06a.97.97 0 0 0-.309.715v5.37a.966.966 0 0 0 .966.966h10.626a.966.966 0 0 0 .966-.966zm3.419-9.049a3.419 3.419 0 1 0 0-6.837a3.419 3.419 0 0 0 0 6.837"/><path d="M16.423 23.111h3.138l.855-6.838h2.564V13.71a5.983 5.983 0 0 0-11.037-3.202m-4.644 5.125v4.834m2.417-2.417H4.88"/></g></svg>`,
                        route: {
                            1: 'warden.visitors.requests',
                            2: 'assistant-warden.visitors.requests',
                            8: 'searcher.visitors.requests'
                        },
                        roles: [1, 2, 8], // Warden, Assistant Warden, Searcher
                        order: 2,
                        dataNavItem: 'requests'
                    },
                    facialRecognition: {
                        title: 'Facial Recognition',
                        icon: `<svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"><path d="M15.9998 10.5004C15.9998 11.3288 15.5521 12.0004 14.9998 12.0004C14.4475 12.0004 13.9998 11.3288 13.9998 10.5004C13.9998 9.67196 14.4475 9.00039 14.9998 9.00039C15.5521 9.00039 15.9998 9.67196 15.9998 10.5004Z" fill="currentColor"/><path d="M9.99982 10.5004C9.99982 11.3288 9.5521 12.0004 8.99982 12.0004C8.44753 12.0004 7.99982 11.3288 7.99982 10.5004C7.99982 9.67196 8.44753 9.00039 8.99982 9.00039C9.5521 9.00039 9.99982 9.67196 9.99982 10.5004Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M13.2648 2.05116C13.3472 1.64522 13.7431 1.38294 14.149 1.46533C18.3625 2.32056 21.6797 5.63763 22.535 9.85114C22.6173 10.2571 22.3551 10.6529 21.9491 10.7353C21.5432 10.8177 21.1473 10.5555 21.0649 10.1495C20.3295 6.52642 17.4738 3.67075 13.8506 2.93535C13.4447 2.85296 13.1824 2.45709 13.2648 2.05116ZM10.735 2.05121C10.8174 2.45714 10.5551 2.85301 10.1492 2.93541C6.52602 3.6708 3.67032 6.52647 2.93486 10.1496C2.85246 10.5555 2.45659 10.8178 2.05065 10.7354C1.64472 10.653 1.38244 10.2571 1.46484 9.85119C2.32014 5.63769 5.63726 2.32061 9.85079 1.46538C10.2567 1.38299 10.6526 1.64527 10.735 2.05121ZM2.05081 13.2654C2.45675 13.183 2.85262 13.4453 2.93502 13.8512C3.67048 17.4743 6.52618 20.33 10.1493 21.0654C10.5553 21.1478 10.8175 21.5436 10.7351 21.9496C10.6528 22.3555 10.2569 22.6178 9.85095 22.5354C5.63742 21.6802 2.3203 18.3631 1.465 14.1496C1.3826 13.7437 1.64488 13.3478 2.05081 13.2654ZM21.9491 13.2654C22.3551 13.3478 22.6173 13.7437 22.535 14.1496C21.6797 18.3631 18.3625 21.6802 14.149 22.5354C13.7431 22.6178 13.3472 22.3555 13.2648 21.9496C13.1824 21.5436 13.4447 21.1478 13.8506 21.0654C17.4738 20.33 20.3295 17.4743 21.0649 13.8512C21.1473 13.4453 21.5432 13.183 21.9491 13.2654ZM8.39729 15.5538C8.64395 15.221 9.11366 15.1512 9.44643 15.3979C10.1748 15.9377 11.0539 16.2504 11.9998 16.2504C12.9457 16.2504 13.8249 15.9377 14.5532 15.3979C14.886 15.1512 15.3557 15.221 15.6023 15.5538C15.849 15.8865 15.7792 16.3563 15.4464 16.6029C14.474 17.3237 13.2848 17.7504 11.9998 17.7504C10.7148 17.7504 9.52562 17.3237 8.55321 16.6029C8.22044 16.3563 8.15063 15.8865 8.39729 15.5538Z" fill="currentColor"/></svg>`,
                        href: '/facial-recognition',
                        roles: [0, 1, 2, 8], // Admin, Warden, Assistant Warden, and Searcher
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
                        route: {
                            0: 'admin.reports.index',
                            1: 'warden.reports.index',
                            2: 'assistant-warden.reports.index',
                            8: 'searcher.reports.index'
                        },
                        roles: [0, 1, 2, 8], // Admin, Warden, Assistant Warden, and Searcher
                        order: 1
                    },
                    profile: {
                        title: 'Profile',
                        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855"/></svg>`,
                        route: 'profile.edit',
                        roles: [0, 1, 2, 8, 6, 7], // All roles including Searcher
                        order: 2
                    },
                    officers: {
                        title: 'Officers',
                        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48"><g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" stroke-width="0.5" stroke="currentColor"><path d="M13.5 10.097C13.5 7.774 24 6 24 6s10.5 1.774 10.5 4.097c0 3.097-1.91 4.403-1.91 4.403H15.41s-1.91-1.306-1.91-4.403m12.5-.53s-1.467-.534-2-1.067c-.533.533-2 1.067-2 1.067s.4 2.933 2 2.933s2-2.933 2-2.933m5.814 8.713c1.39-1.085 1.174-2.28 1.174-2.28H15.012s-.217 1.195 1.174 2.28a8 8 0 1 0 15.629 0M24 20c2.721 0 4.624-.314 5.952-.766q.047.376.048.766a6 6 0 1 1-11.952-.766c1.329.452 3.23.766 5.952.766"/><path d="m16.879 28l6.477 5.457a1 1 0 0 0 1.288 0L31.121 28S42 31.393 42 35.467V42H6v-6.533C6 31.393 16.879 28 16.879 28m-4.154 9.207a1 1 0 0 1-.725-.961V35h7v1.246a1 1 0 0 1-.725.961l-2.5.715a1 1 0 0 1-.55 0zm20.94-4.082a.17.17 0 0 0-.33 0l-.471 1.52a.174.174 0 0 1-.165.126h-1.526c-.167 0-.237.225-.101.328l1.234.94c.06.046.086.128.063.202l-.471 1.52c-.052.168.13.307.266.204l1.234-.94a.166.166 0 0 1 .204 0l1.234.94c.136.103.318-.036.267-.203l-.472-1.52a.19.19 0 0 1 .063-.203l1.234-.94c.136-.103.066-.328-.101-.328H34.3a.174.174 0 0 1-.165-.125z"/></g></svg>`,
                        route: {
                            0: 'admin.officers.index',
                            1: 'warden.officers.index',
                            2: 'assistant-warden.officers.index'
                        },
                        roles: [0, 1, 2], // Admin, Warden, and Assistant Warden
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
            'assistant-warden.dashboard': '/assistant-warden/dashboard',
            'searcher.dashboard': '/searcher/dashboard',
            'nurse.dashboard': '/nurse/dashboard',
            
            // Inmates routes
            'admin.inmates.index': '/admin/inmates',
            'warden.inmates.index': '/warden/inmates',
            'assistant-warden.inmates.index': '/assistant-warden/inmates',
            'inmates.index': '/inmates',
            'admin.inmates.female': '/admin/inmates/female',
            'warden.inmates.female': '/warden/inmates/female',
            
            // Officers routes
            'admin.officers.index': '/admin/officers',
            'warden.officers.index': '/warden/officers',
            'assistant-warden.officers.index': '/assistant-warden/officers',
            'officers.index': '/officers',
            
            // Profile routes
            'profile.edit': '/profile',
            
            // Supervision routes
            'warden.supervision': '/warden/supervision',
            'assistant-warden.supervision': '/assistant-warden/supervision',
            
            // Visitation routes
            'visitation.request.visitor': '/visitation/request/visitor',
            'admin.visitors.index': '/admin/visitors',
            'warden.visitors.index': '/warden/visitors',
            'warden.visitors.requests': '/warden/visitors/requests',
            'assistant-warden.visitors.index': '/assistant-warden/visitors',
            'assistant-warden.visitors.requests': '/assistant-warden/visitors/requests',
            'searcher.visitors.index': '/searcher/visitors',
            'searcher.visitors.requests': '/searcher/visitors/requests',
            
            // Reports routes
            'admin.reports.index': '/admin/reports',
            'warden.reports.index': '/warden/reports',
            'assistant-warden.reports.index': '/assistant-warden/reports',
            'searcher.reports.index': '/searcher/reports'
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
                case 'searcher.dashboard':
                    return currentPath === '/dashboard' || 
                           currentPath === '/admin/dashboard' || 
                           currentPath === '/warden/dashboard' ||
                           currentPath === '/searcher/dashboard';
                           
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
                case 'admin.visitors.index':
                    return currentPath === '/admin/visitors';
                case 'warden.visitors.index':
                    return currentPath === '/warden/visitors';
                case 'warden.visitors.requests':
                    return currentPath === '/warden/visitors/requests';
                case 'searcher.visitors.index':
                    return currentPath === '/searcher/visitors';
                case 'searcher.visitors.requests':
                    return currentPath === '/searcher/visitors/requests';
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
                hide: [],
                show: ['requests', 'supervision', 'facial-recognition']
            },
            2: { // Assistant Warden
                hide: [],
                show: ['requests', 'supervision', 'facial-recognition']
            },
            6: { // Jail Head Nurse
                hide: ['inmates', 'visitors', 'requests', 'supervision', 'facial-recognition', 'reports', 'officers'],
                show: []
            },
            7: { // Jail Nurse
                hide: ['inmates', 'visitors', 'requests', 'supervision', 'facial-recognition', 'reports', 'officers'],
                show: []
            },
            8: { // Searcher
                hide: ['inmates', 'supervision', 'officers'],
                show: ['facial-recognition', 'requests']
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
     * Generate page and role-specific informational card with randomized facts
     */
    generateInformationalCard() {
        // Get current page context
        const currentPath = window.location.pathname;
        const pageContext = this.getPageContext(currentPath);
        
        /**
         * TEMPLATE FOR ADDING NEW FACTS:
         * ================================
         * Each role/page combination should have an array of 3+ facts.
         * Facts are randomly selected on page load.
         * 
         * Format:
         * roleName: {
         *     pageName: {
         *         icon: 'SVG_ICON_HERE',
         *         facts: [
         *             'First interesting fact about this page',
         *             'Second useful tip or information',
         *             'Third educational or helpful insight'
         *         ]
         *     }
         * }
         */
        
        // Page and role-specific cards configuration
        const contextualCards = {
            // Admin role cards (role_id: 0)
            0: {
                dashboard: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24"><rect width="24" height="24" fill="none"/><g fill="none" fill-rule="evenodd"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m1 2.062V5a1 1 0 0 1-1.993.117L11 5v-.938a8.005 8.005 0 0 0-6.902 6.68L4.062 11H5a1 1 0 0 1 .117 1.993L5 13h-.938a8.001 8.001 0 0 0 15.84.25l.036-.25H19a1 1 0 0 1-.117-1.993L19 11h.938a7.98 7.98 0 0 0-2.241-4.617l-2.424 4.759l-.155.294l-.31.61c-.37.72-.772 1.454-1.323 2.005c-.972.971-2.588 1.089-3.606.07c-1.019-1.018-.901-2.634.07-3.606c.472-.472 1.078-.835 1.696-1.162l.919-.471l.849-.444l4.203-2.135A7.98 7.98 0 0 0 13 4.062m.162 6.776l-.21.112l-.216.113c-.402.209-.822.426-1.172.698l-.201.17l-.073.084c-.193.26-.135.554.003.692s.432.196.692.003l.086-.074l.168-.2c.217-.28.4-.605.571-.93l.127-.242q.112-.22.225-.426" stroke-width="0.3" stroke="currentColor"/></g></svg>`,
                    facts: [
                        'Monitor system metrics daily for optimal facility management and early issue detection.',
                        'Real-time analytics help identify trends and improve operational efficiency across all departments.',
                        'Dashboard widgets automatically refresh to provide the most current facility statistics.',
                        'Administrative overview enables strategic decision-making with comprehensive data visualization.',
                        'System health indicators provide instant visibility into critical infrastructure performance.'
                    ]
                },
                inmates: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24"><rect width="24" height="24" fill="none"/><path fill="currentColor" d="M14.654 21q-.529 0-.9-.37t-.37-.9V15.5q0-.529.37-.899t.9-.37h1.269l.846-.847h1.693l.846.847h1.269q.529 0 .899.37t.37.899v4.23q0 .53-.37.9t-.899.37zm2.962-1.692q.69 0 1.19-.501t.502-1.192t-.501-1.191t-1.191-.501t-1.192.501t-.501 1.191t.501 1.192t1.192.5M11.973 9.5q-1.046 0-1.773.727T9.473 12q0 .796.416 1.408q.415.611 1.111.904v-1.135q-.238-.2-.383-.532T10.473 12q0-.625.438-1.062t1.062-.438q.35 0 .635.138q.284.137.484.362h1.154q-.286-.677-.891-1.088T11.973 9.5M10.134 21l-.361-2.892q-.479-.145-1.035-.454q-.557-.31-.947-.664l-2.668 1.135l-1.865-3.25l2.306-1.739q-.045-.27-.073-.558q-.03-.288-.03-.559q0-.252.03-.53q.028-.278.073-.626L3.258 9.126l1.865-3.212L7.771 7.03q.448-.373.97-.673q.52-.3 1.013-.464L10.134 3h3.732l.361 2.912q.575.202 1.016.463t.909.654l2.725-1.115l1.865 3.211l-2.278 1.721q.019.038.019.077t.019.077h-1.179q-.025-.125-.04-.234q-.016-.108-.066-.233l2.227-1.683l-.994-1.7l-2.552 1.07q-.454-.499-1.193-.935q-.74-.435-1.4-.577L13 4h-1.994l-.312 2.689q-.756.161-1.39.52q-.633.358-1.26.985L5.55 7.15l-.994 1.7l2.169 1.62q-.125.336-.175.73t-.05.82q0 .38.05.755t.156.73l-2.15 1.645l.994 1.7l2.475-1.05q.6.606 1.36 1.002t1.615.579V21z"/></svg>`,
                    facts: [
                        'Facial recognition technology replaces traditional QR scanning for enhanced security verification.',
                        'Digital records reduce paperwork by 70% while improving data accuracy and accessibility.',
                        'Automated alerts notify staff of important inmate status changes and scheduled events.',
                        'Segregated housing units maintain proper classification and security protocols for female inmates.',
                        'Comprehensive inmate profiles include medical history, behavioral records, and rehabilitation progress.'
                    ]
                },
                officers: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 512 512"><rect width="512" height="512" fill="none"/><path fill="currentColor" d="M256 25c21 0 34.936 10.482 53.63 20.867c17.717 9.843 39.99 18.284 71.4 11.87c14.906 14.9 30.05 29.803 46.2 39.896c13.216 8.26 28.067 13.18 42.88 10.855c-4.25 33.44-24.556 66.15-45.784 83.272c-55.98-18.552-112.1-27.832-168.22-27.832c-56.172 0-112.343 9.297-168.374 27.883c-21.25-17.108-41.59-49.85-45.843-83.322c14.81 2.326 29.664-2.596 42.88-10.855c16.15-10.093 31.292-24.995 46.2-39.895c31.407 6.413 53.683-2.028 71.4-11.87C221.065 35.48 235 25 256 25m.105 19.54c-19.815 0-53.17 26.778-53.17 26.778s21.22 80.334 53.17 80.334c31.952 0 53.172-80.334 53.172-80.334S275.92 44.54 256.105 44.54m0 137.32c52.79 0 105.584 8.63 158.504 25.734c2.18 13.47-1.51 23.48-9.448 32.736c-8.86 10.333-23.732 19.103-41.36 25.71c-35.26 13.218-80.983 17.896-107.697 17.896s-72.434-4.678-107.693-17.895c-17.63-6.607-32.5-15.377-41.36-25.71c-7.94-9.257-11.632-19.265-9.45-32.736c52.92-17.105 105.713-25.735 158.503-25.735zm173.227 57.146c9.82 2.382 26.932 7.775 30.006 16.994c8.402 25.197-16.92 63.795-36.07 88.15c5.276-22.004 8.12-45.41 8.12-69.68c0-12.058-.706-23.9-2.056-35.464m-346.45 0a306 306 0 0 0-2.056 35.463c0 24.27 2.843 47.676 8.12 69.68c-19.15-24.355-44.473-62.953-36.07-88.15c3.073-9.22 20.186-14.612 30.005-16.994zm330.03 19.172c.305 5.377.475 10.806.475 16.29c0 59.374-18.13 112.958-46.903 151.305c-28.772 38.347-67.703 61.313-110.38 61.313c-42.674 0-81.606-22.966-110.377-61.313s-46.9-91.93-46.9-151.304c0-5.486.17-10.915.474-16.292c8.2 7.656 18.216 13.868 29.235 19.03c-4.27 18.2.266 40.838 12.098 52.665c21.774 21.765 70.605 21.765 92.38 0c6.744-6.743 9.637-17.487 9.255-28.268c4.934.216 9.6.33 13.837.33c4.238 0 8.905-.114 13.84-.33c-.383 10.78 2.51 21.525 9.256 28.268c21.775 21.765 70.604 21.765 92.378 0c11.832-11.827 16.368-34.462 12.098-52.662c11.02-5.162 21.038-11.376 29.236-19.032zM256.105 376.043c-23.094 36.936-69.282 41.553-92.376 41.553c23.093 18.468 92.375 18.468 92.375 0c0 18.468 69.285 18.468 92.38 0c-23.095 0-69.285-4.617-92.38-41.553z"/></svg>`,
                    facts: [
                        'Performance evaluations use data-driven metrics to ensure fair and objective assessments.',
                        'Shift scheduling algorithms optimize coverage while considering officer preferences and certifications.',
                        'Training compliance tracking helps maintain professional standards and regulatory requirements.',
                        'Officer management system streamlines personnel records, assignments, and certification tracking.',
                        'Automated roster management ensures adequate staffing levels based on facility requirements.'
                    ]
                },
                visitors: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
                    facts: [
                        'Visitor management system integrates with background checks for enhanced security screening.',
                        'Automated approval workflows reduce processing time while maintaining security protocols.',
                        'Digital visitor logs provide comprehensive audit trails for compliance and security review.',
                        'Pre-registration system enables faster check-in processing and reduced wait times.',
                        'Visitor analytics help identify peak visitation periods and optimize resource allocation.'
                    ]
                },
                profile: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`,
                    facts: [
                        'Two-factor authentication adds an extra security layer to protect sensitive administrative data.',
                        'Regular profile updates ensure accurate contact information for emergency communications.',
                        'Activity logs track all system changes for audit compliance and security monitoring.',
                        'Administrative privileges can be customized based on specific role requirements and responsibilities.',
                        'Profile synchronization ensures consistent access across all facility management systems.'
                    ]
                }
            },
            // Warden role cards (role_id: 1)
            1: {
                dashboard: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>`,
                    facts: [
                        'Comprehensive facility oversight enables strategic planning and resource optimization.',
                        'Real-time operational metrics provide instant visibility into facility performance indicators.',
                        'Staff performance analytics help identify training needs and operational improvements.',
                        'Executive dashboard consolidates critical information for high-level decision making.',
                        'Automated reporting system generates daily, weekly, and monthly operational summaries.'
                    ]
                },
                inmates: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m0 10c2.7 0 5.8 1.29 6 2H6c.23-.72 3.31-2 6-2m0-12C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
                    facts: [
                        'Population management system tracks inmate classifications and housing assignments efficiently.',
                        'Behavioral monitoring tools help identify patterns and prevent potential security incidents.',
                        'Segregated facility management ensures appropriate housing for different inmate classifications.',
                        'Comprehensive inmate records include disciplinary history and rehabilitation progress tracking.',
                        'Automated population alerts notify warden of critical changes in inmate status or behavior.'
                    ]
                },
                supervision: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-1 16H9V7h9v14z"/></svg>`,
                    facts: [
                        'Supervision analytics provide comprehensive oversight of daily facility operations and security.',
                        'Incident reporting system enables real-time documentation and escalation of security events.',
                        'Security protocol monitoring ensures compliance with institutional and regulatory standards.',
                        'Staff supervision tools track officer performance and adherence to operational procedures.',
                        'Automated supervision reports highlight trends and areas requiring administrative attention.'
                    ]
                },
                officers: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
                    facts: [
                        'Performance evaluation system provides objective metrics for officer assessment and development.',
                        'Staff management tools enable efficient scheduling, assignment, and resource allocation.',
                        'Training compliance tracking ensures all officers maintain required certifications and skills.',
                        'Disciplinary oversight system maintains professional standards and accountability across the force.',
                        'Leadership analytics help identify high-performing officers and potential promotion candidates.'
                    ]
                },
                visitors: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
                    facts: [
                        'Visitor management oversight ensures security protocols are maintained while facilitating family connections.',
                        'Visitation analytics help optimize scheduling and resource allocation for visitor processing.',
                        'Security screening coordination integrates visitor processing with facility safety requirements.',
                        'Request approval system streamlines visitor authorization while maintaining necessary security checks.',
                        'Family connection programs support rehabilitation goals through monitored and structured visitation.'
                    ]
                },
                profile: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`,
                    facts: [
                        'Executive profile management ensures secure access to high-level administrative functions.',
                        'Leadership credentials maintain proper authority levels for facility oversight responsibilities.',
                        'Administrative settings enable customization of system preferences and reporting parameters.',
                        'Security protocols protect sensitive warden information while ensuring system accessibility.',
                        'Profile synchronization maintains consistent access across all facility management platforms.'
                    ]
                }
            },
            // Searcher role cards (role_id: 8)
            8: {
                dashboard: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>`,
                    facts: [
                        'Gate management system provides real-time visitor processing and security verification.',
                        'Facial recognition technology enhances security while streamlining visitor check-in procedures.',
                        'Digital visitor logs maintain comprehensive records for security and compliance purposes.',
                        'Real-time visitation tracking helps manage facility capacity and security protocols effectively.',
                        'Automated screening processes reduce wait times while maintaining thorough security checks.'
                    ]
                },
                visitors: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M9 13.75c-2.34 0-7 1.17-7 3.5V19h14v-1.75c0-2.33-4.66-3.5-7-3.5M4.34 17c.84-.58 2.87-1.25 4.66-1.25s3.82.67 4.66 1.25zM9 12c1.93 0 3.5-1.57 3.5-3.5S10.93 5 9 5S5.5 6.57 5.5 8.5S7.07 12 9 12m0-5c.83 0 1.5.67 1.5 1.5S9.83 10 9 10s-1.5-.67-1.5-1.5S8.17 7 9 7m7.04 6.81c1.16.84 1.96 1.96 1.96 3.44V19h4v-1.75c0-2.02-3.5-3.17-5.96-3.44M15 12c1.93 0 3.5-1.57 3.5-3.5S16.93 5 15 5c-.54 0-1.04.13-1.5.35c.63.89 1 1.98 1 3.15s-.37 2.26-1 3.15c.46.22.96.35 1.5.35" stroke-width="0.3" stroke="currentColor"/></svg>`,
                    facts: [
                        'Visitor request management enables efficient processing of visitation applications and approvals.',
                        'Manual registration system provides flexible visitor processing for special circumstances.',
                        'Background check integration ensures comprehensive security screening for all visitors.',
                        'Real-time request tracking provides instant status updates for visitors and facility staff.',
                        'Visitor analytics help identify peak periods and optimize gate staffing and resources.'
                    ]
                },
                profile: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>`,
                    facts: [
                        'Gate officer credentials maintain proper security clearance for visitor processing responsibilities.',
                        'Profile management ensures accurate identification and access control for security operations.',
                        'Training certification tracking maintains compliance with security and facility protocols.',
                        'Activity monitoring provides accountability for all visitor processing and security decisions.',
                        'System synchronization ensures consistent access across all gate management and security platforms.'
                    ]
                }
            },
            // Jail Head Nurse role cards (role_id: 6)
            6: {
                dashboard: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
                    facts: [
                        'Medical management system oversees inmate healthcare delivery and treatment coordination.',
                        'Electronic health records maintain comprehensive medical histories and treatment documentation.',
                        'Medical scheduling optimizes healthcare provider allocation and patient appointment management.',
                        'Pharmaceutical inventory tracking ensures proper medication management and dispensing protocols.',
                        'Health analytics provide insights into population health trends and resource utilization patterns.'
                    ]
                },
                profile: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>`,
                    facts: [
                        'Medical leadership credentials maintain proper authority for healthcare management and supervision.',
                        'Professional certification tracking ensures compliance with healthcare regulatory requirements.',
                        'Clinical privileges management maintains appropriate access levels for medical decision-making.',
                        'Continuing education records support ongoing professional development and medical competency.',
                        'Healthcare profile synchronization ensures consistent access across all medical management systems.'
                    ]
                }
            },
            // Jail Nurse role cards (role_id: 7)
            7: {
                dashboard: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
                    facts: [
                        'Patient care management provides comprehensive medical treatment and health monitoring services.',
                        'Medical documentation system maintains accurate records of all patient inter% and treatments.',
                        'Medication administration tracking ensures proper dosing and timing for all prescribed treatments.',
                        'Vital signs monitoring helps identify health trends and potential medical concerns early.',
                        'Emergency response coordination enables quick medical intervention for urgent health situations.'
                    ]
                },
                profile: {
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>`,
                    facts: [
                        'Nursing credentials maintain proper licensing and certification for clinical practice within the facility.',
                        'Medical profile management ensures accurate professional information and specialty certifications.',
                        'Training records track ongoing medical education and skill development requirements.',
                        'Clinical access control maintains appropriate permissions for patient care and medical documentation.',
                        'Healthcare system synchronization provides consistent access to medical records and treatment tools.'
                    ]
                }
            }
        };

        // Get the appropriate card based on role and page context
        const roleCards = contextualCards[this.userRole];
        if (!roleCards) return '';

        const card = roleCards[pageContext] || roleCards['dashboard']; // Fallback to dashboard
        if (!card) return '';

        // Randomly select a fact from the facts array (if available), otherwise use text
        let displayText = '';
        if (card.facts && Array.isArray(card.facts) && card.facts.length > 0) {
            const randomIndex = Math.floor(Math.random() * card.facts.length);
            displayText = card.facts[randomIndex];
        } else if (card.text) {
            displayText = card.text;
        } else {
            return ''; // No text available
        }

        return `
            <div class="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 flex items-center justify-center">
                        ${card.icon}
                    </div>
                    <div class="flex-1 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        ${displayText}
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
    
    // Navigation initialized (no console log to reduce noise)
}

// Auto-initialize when DOM is ready (for direct script loading via @vite)
// Only auto-initialize if not already initialized (prevent double initialization)
if (!window.__roleBasedNavInitialized) {
    window.__roleBasedNavInitialized = true;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRoleBasedNavigation);
    } else {
        // DOM is already ready
        initRoleBasedNavigation();
    }
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
            
            // Role hierarchy: extend to include Searcher (8) and nurses
            // Higher number = higher privilege
            const hierarchy = { 0: 8, 1: 7, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 2 };
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

