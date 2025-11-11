/**
 * UI Manager
 * Handles UI interactions like sidebar toggle and quick date ranges
 */

export class UIManager {
    constructor() {
        this.init();
    }

    /**
     * Initialize UI manager
     */
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupSidebarToggle();
                this.setupQuickDateRanges();
            });
        } else {
            this.setupSidebarToggle();
            this.setupQuickDateRanges();
        }
    }

    /**
     * Setup sidebar toggle functionality
     */
    setupSidebarToggle() {
        const sidebarToggle = document.querySelector('[data-sidebar-toggle]');
        const sidebar = document.querySelector('[data-sidebar]');
        const overlay = document.querySelector('[data-sidebar-overlay]');
        
        if (!sidebarToggle || !sidebar || !overlay) {
            return;
        }

        const openSidebar = () => {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        };
        
        const closeSidebar = () => {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
        };
        
        sidebarToggle.addEventListener('click', openSidebar);
        overlay.addEventListener('click', closeSidebar);
        
        // Close sidebar on Escape key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !sidebar.classList.contains('-translate-x-full')) {
                closeSidebar();
            }
        });
        
        // Close sidebar when clicking nav links on mobile
        const nav = document.querySelector('[data-sidebar-nav]');
        if (nav) {
            nav.addEventListener('click', (e) => {
                if (e.target.closest('a') && window.innerWidth < 640) {
                    closeSidebar();
                }
            });
        }

        // Close sidebar on window resize if desktop
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth >= 640 && !sidebar.classList.contains('-translate-x-full')) {
                    closeSidebar();
                }
            }, 250);
        });
    }

    /**
     * Setup quick date range functionality
     */
    setupQuickDateRanges() {
        const quickRangeBtns = document.querySelectorAll('.quick-range-btn');
        const dateFromInput = document.getElementById('filter-date-from');
        const dateToInput = document.getElementById('filter-date-to');
        
        if (!quickRangeBtns.length || !dateFromInput || !dateToInput) {
            return;
        }

        quickRangeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleQuickDateRange(btn, dateFromInput, dateToInput, quickRangeBtns);
            });
        });
    }

    /**
     * Handle quick date range selection
     */
    handleQuickDateRange(selectedBtn, dateFromInput, dateToInput, allBtns) {
        const days = parseInt(selectedBtn.dataset.days);
        if (isNaN(days)) return;

        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - days);
        
        // Format dates as YYYY-MM-DD
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        dateFromInput.value = formatDate(startDate);
        dateToInput.value = formatDate(today);
        
        // Visual feedback - highlight selected button
        allBtns.forEach(b => {
            b.classList.remove(
                'bg-indigo-100', 
                'dark:bg-indigo-900/30', 
                'text-indigo-700', 
                'dark:text-indigo-300',
                'ring-2',
                'ring-indigo-500'
            );
            b.classList.add(
                'bg-gray-100',
                'dark:bg-gray-700',
                'text-gray-700',
                'dark:text-gray-300'
            );
        });
        
        selectedBtn.classList.remove(
            'bg-gray-100',
            'dark:bg-gray-700',
            'text-gray-700',
            'dark:text-gray-300'
        );
        selectedBtn.classList.add(
            'bg-indigo-100', 
            'dark:bg-indigo-900/30', 
            'text-indigo-700', 
            'dark:text-indigo-300',
            'ring-2',
            'ring-indigo-500'
        );
        
        // Trigger filter change event
        this.triggerFilterChange();
    }

    /**
     * Trigger filter change event
     */
    triggerFilterChange() {
        // Dispatch event for filter manager to handle
        const event = new CustomEvent('reports:filter-changed', {
            detail: {}
        });
        document.dispatchEvent(event);

        // Also trigger refresh if reports manager is available
        if (window.reportsManager && typeof window.reportsManager.handleFilterChange === 'function') {
            window.reportsManager.handleFilterChange();
        }
    }
}

