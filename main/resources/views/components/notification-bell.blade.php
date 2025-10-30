<!-- Notification Bell Component -->
<div class="relative" x-data="{ open: false }" @click.away="open = false">
    <button 
        @click="open = !open"
        type="button" 
        class="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
        aria-label="Notifications">
        <span class="sr-only">Notifications</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24">
            <rect width="24" height="24" fill="none"/>
            <path fill="currentColor" fill-rule="evenodd" d="M13 3a1 1 0 1 0-2 0v.75h-.557A4.214 4.214 0 0 0 6.237 7.7l-.221 3.534a7.4 7.4 0 0 1-1.308 3.754a1.617 1.617 0 0 0 1.135 2.529l3.407.408V19a2.75 2.75 0 1 0 5.5 0v-1.075l3.407-.409a1.617 1.617 0 0 0 1.135-2.528a7.4 7.4 0 0 1-1.308-3.754l-.221-3.533a4.214 4.214 0 0 0-4.206-3.951H13zm-2.25 16a1.25 1.25 0 1 0 2.5 0v-.75h-2.5z" clip-rule="evenodd" stroke-width="0.3" stroke="currentColor"/>
        </svg>
        <!-- Notification Badge -->
        <div 
            id="notification-badge" 
            class="absolute inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-1 -end-1 dark:border-gray-900"
            style="display: none;">
            <span id="notification-count">0</span>
        </div>
    </button>

    <!-- Notification Dropdown -->
    <div 
        x-show="open"
        x-transition:enter="transition ease-out duration-200"
        x-transition:enter-start="opacity-0 scale-95"
        x-transition:enter-end="opacity-100 scale-100"
        x-transition:leave="transition ease-in duration-75"
        x-transition:leave-start="opacity-100 scale-100"
        x-transition:leave-end="opacity-0 scale-95"
        class="absolute right-0 mt-2 w-80 origin-top-right rounded-xl bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
        style="display: none;">
        
        <!-- Header -->
        <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-50">Notifications</h3>
        </div>

        <!-- Notification List -->
        <div id="notification-list" class="max-h-96 overflow-y-auto">
            <!-- Loading State -->
            <div id="notification-loading" class="px-4 py-8 text-center">
                <svg class="animate-spin h-6 w-6 text-gray-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
            </div>

            <!-- Empty State -->
            <div id="notification-empty" class="px-4 py-8 text-center" style="display: none;">
                <svg class="h-12 w-12 text-gray-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">No new notifications</p>
            </div>

            <!-- Notifications will be inserted here by JavaScript -->
            <div id="notification-items"></div>
        </div>

        <!-- Footer -->
        <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
            <a href="#" class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                View all notifications
            </a>
        </div>
    </div>
</div>
