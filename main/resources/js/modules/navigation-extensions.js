/**
 * Navigation Extensions Module
 * Advanced utilities and extensions for the role-based navigation system
 */

import { NavigationConfig, NavigationManager } from '../dashboard/components/role-based.js';

/**
 * Navigation Plugin System
 * Allows for dynamic extension of navigation functionality
 */
export class NavigationPluginSystem {
    constructor() {
        this.plugins = new Map();
        this.hooks = new Map();
        this.manager = new NavigationManager();
    }

    /**
     * Register a navigation plugin
     */
    registerPlugin(name, plugin) {
        if (typeof plugin.init === 'function') {
            this.plugins.set(name, plugin);
            plugin.init(this.manager);
            console.log(`Navigation plugin '${name}' registered successfully`);
        } else {
            console.error(`Plugin '${name}' must have an init method`);
        }
    }

    /**
     * Execute hooks for specific events
     */
    executeHook(hookName, ...args) {
        if (this.hooks.has(hookName)) {
            this.hooks.get(hookName).forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Error executing hook '${hookName}':`, error);
                }
            });
        }
    }

    /**
     * Add hook listener
     */
    addHook(hookName, callback) {
        if (!this.hooks.has(hookName)) {
            this.hooks.set(hookName, []);
        }
        this.hooks.get(hookName).push(callback);
    }
}

/**
 * Role Extension Manager
 * Handles role inheritance and custom role definitions
 */
export class RoleExtensionManager {
    constructor() {
        this.customRoles = new Map();
        this.roleInheritance = new Map();
    }

    /**
     * Define a custom role with inheritance
     */
    defineRole(roleId, config) {
        const roleConfig = {
            id: roleId,
            name: config.name,
            inherits: config.inherits || null,
            permissions: config.permissions || [],
            navigationOverrides: config.navigationOverrides || {},
            customItems: config.customItems || {}
        };

        this.customRoles.set(roleId, roleConfig);
        
        if (config.inherits !== null) {
            this.roleInheritance.set(roleId, config.inherits);
        }

        console.log(`Custom role '${config.name}' (ID: ${roleId}) defined successfully`);
    }

    /**
     * Get effective permissions for a role (including inherited)
     */
    getEffectivePermissions(roleId) {
        const permissions = new Set();
        const visited = new Set();

        const collectPermissions = (currentRoleId) => {
            if (visited.has(currentRoleId)) return; // Prevent circular inheritance
            visited.add(currentRoleId);

            const role = this.customRoles.get(currentRoleId);
            if (role) {
                role.permissions.forEach(perm => permissions.add(perm));
                
                if (role.inherits !== null) {
                    collectPermissions(role.inherits);
                }
            }
        };

        collectPermissions(roleId);
        return Array.from(permissions);
    }

    /**
     * Check if role has specific permission
     */
    hasPermission(roleId, permission) {
        const permissions = this.getEffectivePermissions(roleId);
        return permissions.includes(permission);
    }
}

/**
 * Navigation Analytics
 * Track navigation usage and performance
 */
export class NavigationAnalytics {
    constructor() {
        this.metrics = {
            navigationClicks: new Map(),
            loadTimes: [],
            errorCount: 0,
            cacheHitRate: 0
        };
        this.startTime = performance.now();
    }

    /**
     * Track navigation item click
     */
    trackClick(itemName, userRole) {
        const key = `${itemName}_${userRole}`;
        const count = this.metrics.navigationClicks.get(key) || 0;
        this.metrics.navigationClicks.set(key, count + 1);
        
        // Send to analytics service (placeholder)
        this.sendAnalytics('navigation_click', {
            item: itemName,
            role: userRole,
            timestamp: Date.now()
        });
    }

    /**
     * Track load performance
     */
    trackLoadTime(duration) {
        this.metrics.loadTimes.push(duration);
        
        // Keep only last 100 measurements
        if (this.metrics.loadTimes.length > 100) {
            this.metrics.loadTimes.shift();
        }
    }

    /**
     * Get analytics summary
     */
    getSummary() {
        const avgLoadTime = this.metrics.loadTimes.length > 0 
            ? this.metrics.loadTimes.reduce((a, b) => a + b, 0) / this.metrics.loadTimes.length 
            : 0;

        return {
            totalClicks: Array.from(this.metrics.navigationClicks.values()).reduce((a, b) => a + b, 0),
            averageLoadTime: avgLoadTime,
            errorCount: this.metrics.errorCount,
            cacheHitRate: this.metrics.cacheHitRate,
            uptime: performance.now() - this.startTime
        };
    }

    /**
     * Send analytics data (placeholder for real implementation)
     */
    sendAnalytics(event, data) {
        // This would integrate with your analytics service
        console.log(`Analytics: ${event}`, data);
    }
}

/**
 * Navigation Theme Manager
 * Handle dynamic theming and customization
 */
export class NavigationThemeManager {
    constructor() {
        this.themes = new Map();
        this.currentTheme = 'default';
        this.initializeDefaultThemes();
    }

    /**
     * Initialize default themes
     */
    initializeDefaultThemes() {
        this.themes.set('default', {
            name: 'Default',
            colors: {
                primary: '#3B82F6',
                secondary: '#6B7280',
                background: '#FFFFFF',
                text: '#1F2937'
            },
            classes: {
                activeItem: 'border-blue-500 bg-gray-100 text-gray-900',
                inactiveItem: 'border-transparent text-gray-600 hover:bg-gray-100'
            }
        });

        this.themes.set('dark', {
            name: 'Dark',
            colors: {
                primary: '#60A5FA',
                secondary: '#9CA3AF',
                background: '#1F2937',
                text: '#F9FAFB'
            },
            classes: {
                activeItem: 'border-blue-400 bg-gray-800 text-gray-50',
                inactiveItem: 'border-transparent text-gray-300 hover:bg-gray-800'
            }
        });
    }

    /**
     * Apply theme to navigation
     */
    applyTheme(themeName) {
        const theme = this.themes.get(themeName);
        if (!theme) {
            console.error(`Theme '${themeName}' not found`);
            return;
        }

        this.currentTheme = themeName;
        
        // Apply CSS custom properties
        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--nav-${key}`, value);
        });

        // Update navigation classes
        this.updateNavigationClasses(theme.classes);
        
        console.log(`Applied theme: ${theme.name}`);
    }

    /**
     * Update navigation item classes
     */
    updateNavigationClasses(classes) {
        document.querySelectorAll('[data-sidebar-nav] a').forEach(link => {
            // Remove old classes and apply new ones based on active state
            const isActive = link.classList.contains('border-blue-500') || 
                           link.classList.contains('border-blue-400');
            
            // Clear existing classes
            link.className = link.className.replace(/border-\w+|bg-\w+|text-\w+/g, '');
            
            // Apply theme classes
            const classesToApply = isActive ? classes.activeItem : classes.inactiveItem;
            link.className += ` ${classesToApply}`;
        });
    }

    /**
     * Register custom theme
     */
    registerTheme(name, themeConfig) {
        this.themes.set(name, themeConfig);
        console.log(`Custom theme '${name}' registered`);
    }
}

/**
 * Navigation State Manager
 * Handle navigation state persistence and restoration
 */
export class NavigationStateManager {
    constructor() {
        this.storageKey = 'bjmp_navigation_state';
        this.state = this.loadState();
    }

    /**
     * Save current navigation state
     */
    saveState(state) {
        this.state = { ...this.state, ...state };
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        } catch (error) {
            console.warn('Could not save navigation state:', error);
        }
    }

    /**
     * Load navigation state from storage
     */
    loadState() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.warn('Could not load navigation state:', error);
            return {};
        }
    }

    /**
     * Get state value
     */
    getState(key, defaultValue = null) {
        return this.state[key] || defaultValue;
    }

    /**
     * Clear all state
     */
    clearState() {
        this.state = {};
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.warn('Could not clear navigation state:', error);
        }
    }
}

/**
 * Example Plugin: Breadcrumb Navigation
 */
export const BreadcrumbPlugin = {
    name: 'breadcrumb',
    
    init(navigationManager) {
        this.manager = navigationManager;
        this.breadcrumbs = [];
        this.createBreadcrumbContainer();
        this.attachEventListeners();
    },

    createBreadcrumbContainer() {
        const container = document.createElement('nav');
        container.className = 'breadcrumb-nav px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b';
        container.innerHTML = '<ol class="flex items-center space-x-2 text-sm"></ol>';
        
        const main = document.querySelector('main') || document.body;
        main.insertBefore(container, main.firstChild);
        
        this.container = container.querySelector('ol');
    },

    attachEventListeners() {
        document.addEventListener('click', (event) => {
            const navLink = event.target.closest('[data-sidebar-nav] a');
            if (navLink) {
                const title = navLink.querySelector('span')?.textContent;
                if (title) {
                    this.addBreadcrumb(title, navLink.href);
                }
            }
        });
    },

    addBreadcrumb(title, url) {
        // Remove if already exists
        this.breadcrumbs = this.breadcrumbs.filter(b => b.title !== title);
        
        // Add new breadcrumb
        this.breadcrumbs.push({ title, url, timestamp: Date.now() });
        
        // Keep only last 5 breadcrumbs
        if (this.breadcrumbs.length > 5) {
            this.breadcrumbs.shift();
        }
        
        this.renderBreadcrumbs();
    },

    renderBreadcrumbs() {
        this.container.innerHTML = this.breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === this.breadcrumbs.length - 1;
            return `
                <li class="flex items-center">
                    ${index > 0 ? '<span class="mx-2 text-gray-400">/</span>' : ''}
                    <a href="${breadcrumb.url}" 
                       class="${isLast ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}">
                        ${breadcrumb.title}
                    </a>
                </li>
            `;
        }).join('');
    }
};

/**
 * Export all utilities
 */
export default {
    NavigationPluginSystem,
    RoleExtensionManager,
    NavigationAnalytics,
    NavigationThemeManager,
    NavigationStateManager,
    BreadcrumbPlugin
};
