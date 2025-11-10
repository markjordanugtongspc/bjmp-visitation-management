<x-app-layout>
    <div class="flex">
        <!-- Role marker for JS (used by role-based navigation) -->
        <div data-user-role="{{ Auth::user()->role_id ?? 0 }}" class="hidden"></div>
        <!-- Overlay for mobile -->
        <div data-sidebar-overlay class="fixed inset-0 z-30 hidden bg-black/50 backdrop-blur-sm sm:hidden"></div>

        <!-- Sidebar -->
        <aside data-sidebar class="fixed z-40 inset-y-0 left-0 w-72 -translate-x-full sm:translate-x-0 sm:static sm:inset-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-transform">

            <!-- Mobile Brand -->
            <div class="sm:hidden flex items-center justify-between px-3 py-4 border-b border-gray-200 dark:border-gray-800">
                <a href="{{ route('dashboard') }}" class="flex items-center gap-2 cursor-pointer">
                    <x-application-logo size="sm" :showText="true" heading="BJMP Iligan" subtext="Information & Visitation" />
                </a>
                <x-theme-toggle />
            </div>

            <nav data-sidebar-nav class="p-3 text-sm" data-user-role="{{ Auth::user()->role_id ?? 0 }}">
                <!-- Dynamic navigation will be populated here by JavaScript -->
                <div class="px-3 pb-2 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Main</div>
                <a href="{{ route('dashboard') }}" class="group cursor-pointer flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 {{ request()->routeIs('dashboard') ? 'border-blue-500 bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50' : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' }}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M10.5 3.75a.75.75 0 011.06 0l8.69 8.69a.75.75 0 11-1.06 1.06l-.19-.19V18a2.25 2.25 0 01-2.25 2.25H15a.75.75 0 01-.75-.75v-4.5h-3V19.5a.75.75 0 01-.75.75H6.25A2.25 2.25 0 014 18v-4.69l-.19.19a.75.75 0 11-1.06-1.06l7.75-7.75Z"/></svg>
                    <span>Dashboard</span>
                </a>
                <a href="#" class="group cursor-pointer flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" data-nav-item="inmates">
                    <svg width="16px" height="16px" viewBox="0 0 17.00 17.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="si-glyph si-glyph-person-prison" fill="#ffffff" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>771</title> <defs> </defs> <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g transform="translate(1.000000, 0.000000)" fill="#ffffff"> <path d="M12.6973076,16.022 L3.37869242,16.022 C1.53624385,16.022 0.0379999999,14.5191098 0.0379999999,12.6724147 L0.0379999999,3.37058005 C0.0379999999,1.5238849 1.53624385,0.022 3.37869242,0.022 L12.6973076,0.022 C14.5397561,0.022 16.038,1.5238849 16.038,3.37058005 L16.038,12.6724147 C16.038,14.5181045 14.5397561,16.022 12.6973076,16.022 L12.6973076,16.022 Z M3.10672887,1 C1.9450099,1 1,1.947963 1,3.11438255 L1,12.8836405 C1,14.0510485 1.9450099,15 3.10672887,15 L12.8922816,15 C14.0549901,15 15,14.0510485 15,12.8836405 L15,3.11438255 C15,1.947963 14.0549901,1 12.8922816,1 L3.10672887,1 L3.10672887,1 Z" class="si-glyph-fill"> </path> <path d="M3,1 L3,14.691 L4.03955078,14.691 L4.03955078,0.999999985 L3,1 Z" class="si-glyph-fill"> </path> <path d="M6,1 L6,14.691 L7.0189209,14.691 L7.0189209,0.999999985 L6,1 Z" class="si-glyph-fill"> </path> <path d="M9,1 L9,14.691 L10.0375977,14.691 L10.0375977,0.999999985 L9,1 Z" class="si-glyph-fill"> </path> <path d="M12,1 L12,14.691 L12.918457,14.691 L12.918457,1 L12,1 Z" class="si-glyph-fill"> </path> <g transform="translate(1.000000, 3.000000)"> <path d="M10.576,8.048 C10.177,8.635 9.681,9.507 9.105,10.546 C8.473,11.692 7.746,10.289 6.951,10.289 C6.135,10.289 5.371,11.64 4.711,10.465 C4.143,9.454 3.65,8.639 3.262,8.076 C1.252,8.076 0.216,9.376 -0.316,10.947 C-0.85,12.52 14.862,12.513 14.375,10.934 C13.89,9.354 12.838,8.048 10.576,8.048 L10.576,8.048 Z" class="si-glyph-fill"> </path> <path d="M9.977,3.154 C9.977,4.815 8.654,7.992 7.022,7.992 C5.388,7.992 4.066,4.815 4.066,3.154 C4.066,1.491 5.388,0.144 7.022,0.144 C8.653,0.145 9.977,1.491 9.977,3.154 L9.977,3.154 Z" class="si-glyph-fill"> </path> </g> </g> </g> </g></svg>
                    <span>Inmates</span>
                </a>
                <a href="#" class="group cursor-pointer flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" data-nav-item="facial-recognition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512"><path fill="currentColor" fill-rule="evenodd" d="M384 319.997V85.331H149.333c-11.782 0-21.333 9.551-21.333 21.333v216.975a63.9 63.9 0 0 1 21.333-3.642zM85.333 106.664v298.667c0 35.346 28.654 64 64 64h277.334v-85.334h-21.334v42.667h-256c-11.782 0-21.333-9.551-21.333-21.333v-21.334c0-11.782 9.551-21.333 21.333-21.333h277.334v-320H149.333c-35.346 0-64 28.654-64 64m149.334 170.667v-85.334h42.666v85.334zM256 170.664c11.782 0 21.333-9.551 21.333-21.333s-9.551-21.334-21.333-21.334s-21.333 9.552-21.333 21.334s9.551 21.333 21.333 21.333M149.333 383.997H384v21.334H149.333z" clip-rule="evenodd" stroke-width="13" stroke="currentColor"/></svg>
                    <span>Supervision</span>
                </a>

                <div class="px-3 pt-4 pb-2 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Visitation</div>
                <a href="{{ url('visitor.index') }}" class="group cursor-pointer flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M9 13.75c-2.34 0-7 1.17-7 3.5V19h14v-1.75c0-2.33-4.66-3.5-7-3.5M4.34 17c.84-.58 2.87-1.25 4.66-1.25s3.82.67 4.66 1.25zM9 12c1.93 0 3.5-1.57 3.5-3.5S10.93 5 9 5S5.5 6.57 5.5 8.5S7.07 12 9 12m0-5c.83 0 1.5.67 1.5 1.5S9.83 10 9 10s-1.5-.67-1.5-1.5S8.17 7 9 7m7.04 6.81c1.16.84 1.96 1.96 1.96 3.44V19h4v-1.75c0-2.02-3.5-3.17-5.96-3.44M15 12c1.93 0 3.5-1.57 3.5-3.5S16.93 5 15 5c-.54 0-1.04.13-1.5.35c.63.89 1 1.98 1 3.15s-.37 2.26-1 3.15c.46.22.96.35 1.5.35" stroke-width="0.3" stroke="currentColor"/></svg>
                    <span>Visitors</span>
                </a>
                <a href="{{ url('/facial-recognition') }}" class="group cursor-pointer flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 {{ request()->is('facial-recognition') ? 'border-blue-500 bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50' : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' }}">
                    <svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"><path d="M15.9998 10.5004C15.9998 11.3288 15.5521 12.0004 14.9998 12.0004C14.4475 12.0004 13.9998 11.3288 13.9998 10.5004C13.9998 9.67196 14.4475 9.00039 14.9998 9.00039C15.5521 9.00039 15.9998 9.67196 15.9998 10.5004Z" fill="currentColor"/><path d="M9.99982 10.5004C9.99982 11.3288 9.5521 12.0004 8.99982 12.0004C8.44753 12.0004 7.99982 11.3288 7.99982 10.5004C7.99982 9.67196 8.44753 9.00039 8.99982 9.00039C9.5521 9.00039 9.99982 9.67196 9.99982 10.5004Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M13.2648 2.05116C13.3472 1.64522 13.7431 1.38294 14.149 1.46533C18.3625 2.32056 21.6797 5.63763 22.535 9.85114C22.6173 10.2571 22.3551 10.6529 21.9491 10.7353C21.5432 10.8177 21.1473 10.5555 21.0649 10.1495C20.3295 6.52642 17.4738 3.67075 13.8506 2.93535C13.4447 2.85296 13.1824 2.45709 13.2648 2.05116ZM10.735 2.05121C10.8174 2.45714 10.5551 2.85301 10.1492 2.93541C6.52602 3.6708 3.67032 6.52647 2.93486 10.1496C2.85246 10.5555 2.45659 10.8178 2.05065 10.7354C1.64472 10.653 1.38244 10.2571 1.46484 9.85119C2.32014 5.63769 5.63726 2.32061 9.85079 1.46538C10.2567 1.38299 10.6526 1.64527 10.735 2.05121ZM2.05081 13.2654C2.45675 13.183 2.85262 13.4453 2.93502 13.8512C3.67048 17.4743 6.52618 20.33 10.1493 21.0654C10.5553 21.1478 10.8175 21.5436 10.7351 21.9496C10.6528 22.3555 10.2569 22.6178 9.85095 22.5354C5.63742 21.6802 2.3203 18.3631 1.465 14.1496C1.3826 13.7437 1.64488 13.3478 2.05081 13.2654ZM21.9491 13.2654C22.3551 13.3478 22.6173 13.7437 22.535 14.1496C21.6797 18.3631 18.3625 21.6802 14.149 22.5354C13.7431 22.6178 13.3472 22.3555 13.2648 21.9496C13.1824 21.5436 13.4447 21.1478 13.8506 21.0654C17.4738 20.33 20.3295 17.4743 21.0649 13.8512C21.1473 13.4453 21.5432 13.183 21.9491 13.2654ZM8.39729 15.5538C8.64395 15.221 9.11366 15.1512 9.44643 15.3979C10.1748 15.9377 11.0539 16.2504 11.9998 16.2504C12.9457 16.2504 13.8249 15.9377 14.5532 15.3979C14.886 15.1512 15.3557 15.221 15.6023 15.5538C15.849 15.8865 15.7792 16.3563 15.4464 16.6029C14.474 17.3237 13.2848 17.7504 11.9998 17.7504C10.7148 17.7504 9.52562 17.3237 8.55321 16.6029C8.22044 16.3563 8.15063 15.8865 8.39729 15.5538Z" fill="currentColor"/></svg>
                    <span>Facial Recognition</span>
                </a>

                <div class="px-3 pt-4 pb-2 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Administration</div>
                <a href="#" class="group cursor-pointer flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M10.58 9.902a.41.41 0 0 1-.407.408H5.826a.408.408 0 0 1 0-.816h4.347a.41.41 0 0 1 .408.408m-.407-2.581H5.826a.408.408 0 0 0 0 .815h4.347a.408.408 0 0 0 0-.815m3.668-4.483v11.411a.95.95 0 0 1-.95.951H3.108a.95.95 0 0 1-.95-.95V2.837a.95.95 0 0 1 .95-.951h2.525a3.118 3.118 0 0 1 4.732 0h2.524a.95.95 0 0 1 .951.95M5.69 3.923v.135h4.618v-.135a2.31 2.31 0 1 0-4.619 0m7.335-1.087a.136.136 0 0 0-.136-.136h-2.015c.165.386.25.802.25 1.223v.543a.41.41 0 0 1-.408.408H5.283a.41.41 0 0 1-.408-.408v-.543c0-.42.085-.837.25-1.223H3.108a.136.136 0 0 0-.136.136v11.411a.136.136 0 0 0 .136.136h9.781a.136.136 0 0 0 .136-.136z" stroke-width="0.3" stroke="currentColor"/></svg>
                    <span>Reports</span>
                </a>
                <a href="{{ route('profile.edit') }}" class="group cursor-pointer flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855"/></svg>
                    <span>Profile</span>
                </a>
                <a href="{{ route('officers.index') }}"
                    class="group cursor-pointer flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 {{ request()->routeIs('officers.*') ? 'border-blue-500 bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50' : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' }}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48"><g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" stroke-width="0.5" stroke="currentColor"><path d="M13.5 10.097C13.5 7.774 24 6 24 6s10.5 1.774 10.5 4.097c0 3.097-1.91 4.403-1.91 4.403H15.41s-1.91-1.306-1.91-4.403m12.5-.53s-1.467-.534-2-1.067c-.533.533-2 1.067-2 1.067s.4 2.933 2 2.933s2-2.933 2-2.933m5.814 8.713c1.39-1.085 1.174-2.28 1.174-2.28H15.012s-.217 1.195 1.174 2.28a8 8 0 1 0 15.629 0M24 20c2.721 0 4.624-.314 5.952-.766q.047.376.048.766a6 6 0 1 1-11.952-.766c1.329.452 3.23.766 5.952.766"/><path d="m16.879 28l6.477 5.457a1 1 0 0 0 1.288 0L31.121 28S42 31.393 42 35.467V42H6v-6.533C6 31.393 16.879 28 16.879 28m-4.154 9.207a1 1 0 0 1-.725-.961V35h7v1.246a1 1 0 0 1-.725.961l-2.5.715a1 1 0 0 1-.55 0zm20.94-4.082a.17.17 0 0 0-.33 0l-.471 1.52a.174.174 0 0 1-.165.126h-1.526c-.167 0-.237.225-.101.328l1.234.94c.06.046.086.128.063.202l-.471 1.52c-.052.168.13.307.266.204l1.234-.94a.166.166 0 0 1 .204 0l1.234.94c.136.103.318-.036.267-.203l-.472-1.52a.19.19 0 0 1 .063-.203l1.234-.94c.136-.103.066-.328-.101-.328H34.3a.174.174 0 0 1-.165-.125z"/></g></svg>
                    <span>Officers</span>
                </a>

            </nav>
        </aside>

        <!-- Main content -->
        <div class="flex-1 min-h-screen bg-gray-50 dark:bg-gray-950">
            <!-- Hope UI–style Header -->
            <header>
                <div class="h-14 sm:h-16 px-3 sm:px-4 flex items-center gap-3">
                 <!-- Mobile: sidebar toggle (hamburger icon) -->
                    <button data-sidebar-toggle class="sm:hidden inline-flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 h-9 w-9 text-gray-700 dark:text-gray-300 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-label="Menu" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 6h16" />
                        <path d="M4 12h16" />
                        <path d="M4 18h16" />
                      </svg>
                    </button>

                    <!-- Brand -->
                    <a href="{{ route('dashboard') }}" class="hidden sm:flex items-center gap-2 mr-2 cursor-pointer">
                        <x-application-logo size="sm" :showText="true" heading="BJMP Iligan" subtext="Information & Visitation" />
                    </a>

                    <!-- Page Title -->
                    <div class="flex-1">
                        <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-50">Facial Recognition</h1>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-2 ml-auto">
                        <x-theme-toggle />
                        <x-notification-bell />

                        <!-- User dropdown -->
                        <div class="relative">
                        <button data-user-menu
                          data-user-name="{{ Auth::user()->full_name ?? 'User' }}"
                          data-user-role="{{ Auth::user()->role_id ?? 0 }}"
                          data-user-title="{{ Auth::user()->title ?? Auth::user()->getRoleName() }}"
                          class="inline-flex items-center gap-2 h-9 px-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                          aria-label="User menu for {{ Auth::user()->full_name ?? 'User' }}">
                          <span
                            class="h-8 w-8 inline-flex items-center justify-center rounded-full ring-2 ring-blue-500/30 bg-white dark:bg-gray-800"
                            aria-label="Profile image">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="currentColor" aria-label="Profile">
                              <!-- simple user silhouette -->
                              <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z"/>
                              <path d="M2 22s4-4 10-4 10 4 10 4-4 2-10 2-10-2-10-2z"/>
                            </svg>
                          </span>
                          <div class="hidden sm:block text-left leading-tight">
                            <div class="text-xs font-medium text-gray-900 dark:text-gray-50" data-user-name-target>
                              {{ Auth::user()->full_name ?? 'User' }}
                            </div>
                            <div class="text-[10px] text-gray-500 dark:text-gray-400" data-user-role-target>
                              {{ Auth::user()->title ?? Auth::user()->getRoleName() }}
                            </div>
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 15l-4-4h8z"/>
                          </svg>
                        </button>
                            <!-- Menu -->
                            <div data-user-menu-panel class="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg hidden">
                                <div class="px-4 py-3">
                                    <span class="block text-xs text-gray-500 dark:text-gray-400">Signed in as</span>
                                    <span class="block text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{{ Auth::user()->email }}</span>
                                </div>
                                
                                <hr class="border-t border-gray-200 dark:border-gray-700">
                                
                                <!-- Theme Toggle in Dropdown -->
                                <button data-theme-toggle class="block sm:hidden w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-2">
                                    <svg data-theme-icon="light" class="w-4 h-4 hidden" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path>
                                    </svg>
                                    <svg data-theme-icon="dark" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                                    </svg>
                                    <span>Toggle Theme</span>
                                </button>
                                
                                <hr class="border-t border-gray-200 dark:border-gray-700">
                                
                                <button id="edit-profile-btn-template" class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                    </svg>
                                    {{ __('Edit Profile') }}
                                </button>
                                
                                <a href="{{ route('profile.edit') }}" class="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 gap-2 cursor-pointer" aria-label="{{ __('Account Settings') }}">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                      <path fill="currentColor" d="M14.654 21.846q-.529 0-.9-.37t-.37-.899v-5.923q0-.529.37-.9t.9-.37h5.923q.529 0 .899.37t.37.9v5.923q0 .529-.37.899t-.899.37zM11 17.386V21h-.098q-.348 0-.576-.229t-.29-.571l-.263-2.092q-.479-.145-1.036-.454q-.556-.31-.947-.664l-1.915.824q-.317.14-.644.03t-.504-.415L3.648 15.57q-.177-.305-.104-.638t.348-.546l1.672-1.25q-.045-.272-.073-.559q-.03-.288-.03-.559q0-.252.03-.53q.028-.278.073-.626l-1.672-1.25q-.275-.213-.338-.555t.113-.648l1.06-1.8q.177-.287.504-.406t.644.021l1.896.804q.448-.373.97-.673q.52-.3 1.013-.464l.283-2.092q.061-.342.318-.571T10.96 3h2.08q.349 0 .605.229q.257.229.319.571l.263 2.112q.575.202 1.016.463t.909.654l1.992-.804q.318-.14.645-.021t.503.406l1.06 1.819q.177.306.104.641q-.073.336-.348.544l-1.216.911q-.176.135-.362.133t-.346-.173t-.148-.38t.183-.347l1.225-.908l-.994-1.7l-2.552 1.07q-.454-.499-1.193-.935q-.74-.435-1.4-.577L13 4h-1.994l-.312 2.689q-.756.161-1.39.52q-.633.358-1.26.985L5.55 7.15l-.994 1.7l2.169 1.62q-.125.336-.175.73t-.05.82q0 .38.05.755t.156.73l-2.15 1.645l.994 1.7l2.475-1.05q.6.606 1.363.999t1.612.588m.973-7.887q-1.046 0-1.773.724T9.473 12q0 .467.16.89t.479.777q.16.183.366.206q.207.023.384-.136q.177-.154.181-.355t-.154-.347q-.208-.2-.312-.47T10.473 12q0-.625.438-1.063t1.062-.437q.289 0 .565.116q.276.117.476.324q.146.148.338.134q.192-.015.346-.191q.154-.177.134-.381t-.198-.364q-.311-.3-.753-.469t-.908-.169m5.643 8.962q-.625 0-1.197.191q-.571.191-1.057.56q-.287.22-.44.445t-.153.456q0 .136.106.242t.242.105h5.097q.105 0 .177-.095q.07-.097.07-.252q0-.231-.152-.456q-.153-.225-.44-.444q-.486-.37-1.057-.561t-1.196-.191m0-.846q.528 0 .899-.37q.37-.371.37-.9t-.37-.899t-.9-.37q-.528 0-.899.37q-.37.37-.37.9q0 .528.37.898t.9.37" />
                                    </svg>
                                        <span>{{ __('Account Settings') }}</span>
                                </a>
                                
                                <form method="POST" action="{{ route('logout') }}">
                                    @csrf
                                    <button type="submit" class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
	                                        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
	                                        	<path stroke-dasharray="36" stroke-dashoffset="36" d="M12 4h-7c-0.55 0 -1 0.45 -1 1v14c0 0.55 0.45 1 1 1h7">
	                                        		<animate fill="freeze" attributeName="stroke-dashoffset" dur="0.5s" values="36;0" />
	                                        	</path>
	                                        	<path stroke-dasharray="14" stroke-dashoffset="14" d="M9 12h11.5">
	                                        		<animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="14;0" />
	                                        	</path>
	                                        	<path stroke-dasharray="6" stroke-dashoffset="6" d="M20.5 12l-3.5 -3.5M20.5 12l-3.5 3.5">
	                                        		<animate fill="freeze" attributeName="stroke-dashoffset" begin="0.8s" dur="0.2s" values="6;0" />
	                                        	</path>
	                                        </g>
                                        </svg>
                                        {{ __('Log Out') }}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Facial Recognition Content -->
            <div class="p-4 sm:p-6">
                <!-- Session Error Message (hidden, handled by JavaScript) -->
                @if (session('error'))
                <div data-session-error="{{ session('error') }}" class="hidden"></div>
                @endif
                
                <div class="max-w-7xl mx-auto space-y-6">
                    
                    <!-- Camera and Detection Section -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        
                        <!-- Video Feed -->
                        <div class="lg:col-span-2">
                            <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                                    <h2 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-50">Live Camera Feed</h2>
                                    <div class="flex gap-2">
                                        <button id="start-camera-btn" class="px-3 sm:px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors cursor-pointer">
                                            Start Camera
                                        </button>
                                        <button id="stop-camera-btn" class="px-3 sm:px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors cursor-pointer hidden">
                                            Stop Camera
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden" style="aspect-ratio: 16/9;">
                                    <video id="video-feed" class="w-full h-full object-cover" autoplay muted playsinline></video>
                                    <canvas id="overlay-canvas" class="absolute top-0 left-0 w-full h-full"></canvas>
                                    
                                    <div id="camera-placeholder" class="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                                        <div class="text-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            <p class="text-sm">Click "Start Camera" to begin</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div id="detection-status" class="mt-4 p-3 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <p class="text-sm text-gray-600 dark:text-gray-400">Status: <span id="status-text" class="font-medium">Waiting to start...</span></p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Detection Configuration -->
                        <div class="lg:col-span-1 space-y-4 sm:space-y-6">
                            <!-- Detection Settings -->
                            <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                                <h2 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Detection Settings</h2>
                                
                                <div class="space-y-4">
                                    <!-- Detection Model Info -->
                                    <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                        <p class="text-sm text-blue-800 dark:text-blue-300">
                                            <strong>Model:</strong> SSD MobileNet v1<br>
                                            <strong>Features:</strong> Face Landmarks + Age & Gender
                                        </p>
                                    </div>
                                    
                                    <!-- Confidence Threshold -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Confidence Threshold: <span id="confidence-value" class="text-blue-600 dark:text-blue-400">0.5</span>
                                        </label>
                                        <input type="range" id="confidence-slider" min="0" max="1" step="0.05" value="0.5" class="w-full cursor-pointer">
                                        <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <span>0.0 (Less Strict)</span>
                                            <span>1.0 (More Strict)</span>
                                        </div>
                                        
                                        <!-- Confidence Threshold Explanation -->
                                        <div class="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                                <strong>What this does:</strong> Controls how confident the AI must be before detecting a face.
                                            </p>
                                            <ul class="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                                <li><span class="font-medium">Low (0.2-0.4):</span> Detects more faces, including partial ones</li>
                                                <li><span class="font-medium">Medium (0.5):</span> Balanced detection (recommended)</li>
                                                <li><span class="font-medium">High (0.7-1.0):</span> Only detects clear, confident faces</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Detection Results -->
                            <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                                <h2 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Detection Results</h2>
                                <div id="detection-results" class="text-sm text-gray-600 dark:text-gray-400">
                                    <p>No faces detected yet. Start the camera to begin detection.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Automated Visitation - Visitor Logging Section -->
                    <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                        <!-- Section Header -->
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                            <div>
                                <h2 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-50">Automated Visitation - Visitor Logging</h2>
                                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Recent visitor check-ins and facial recognition matches</p>
                            </div>
                            <div class="flex gap-2">
                                <button id="refresh-logs-btn" class="px-3 sm:px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors cursor-pointer">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                    </svg>
                                    Refresh
                                </button>
                                <button id="export-logs-btn" class="px-3 sm:px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors cursor-pointer">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M3 12h18m-9-9v18"/>
                                    </svg>
                                    Export
                                </button>
                            </div>
                        </div>

            <!-- Search and Filters -->
            <div class="mb-6">
                <div class="flex flex-col sm:flex-row gap-4">
                    <div class="flex-1">
                        <div class="relative">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10.5 3.75a6.75 6.75 0 105.196 11.163l3.646 3.646a.75.75 0 101.06-1.06l-3.646-3.646A6.75 6.75 0 0010.5 3.75zM6 10.5a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z"/>
                            </svg>
                            <input type="text" id="search-visitors" placeholder="Search visitors by name, inmate visited, or ID..." 
                                   class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <select id="filter-status" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="completed">Completed</option>
                        </select>
                        <select id="filter-date" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div id="visitor-logs-loading" class="hidden">
                <div class="flex items-center justify-center py-8">
                    <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="ml-2 text-gray-600 dark:text-gray-400">Loading visitor logs...</span>
                </div>
            </div>

            <!-- Empty State -->
            <div id="visitor-logs-empty" class="hidden">
                <div class="text-center py-8">
                    <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No visitor logs found</h3>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by checking in visitors using facial recognition.</p>
                </div>
            </div>

            <!-- Desktop Table View -->
            <div id="visitor-logs-table" class="hidden sm:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-900 p-4 shadow border border-gray-200 dark:border-gray-800 hidden sm:table-header-group">
                            <tr>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Visitor Info</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Visit Details</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time & Status</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Face Match</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="visitor-logs-tbody" class="bg-white dark:bg-gray-900 p-4 shadow border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-700 hidden sm:table-row-group">
                            <!-- Dynamic content will be inserted here -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Mobile Cards View -->
            <div id="visitor-logs-mobile" class="block sm:hidden space-y-4">
                <!-- Dynamic content will be inserted here -->
            </div>

            <!-- Pagination -->
            <div id="visitor-logs-pagination" class="hidden mt-6 items-center justify-between">
                <div class="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span id="pagination-start" class="font-medium">0</span> to <span id="pagination-end" class="font-medium">0</span> of <span id="pagination-total" class="font-medium">0</span> results
                </div>
                <div class="flex gap-2">
                    <button id="pagination-prev" class="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        Previous
                    </button>
                    <div id="pagination-numbers" class="flex gap-1">
                        <!-- Dynamic page numbers -->
                    </div>
                    <button id="pagination-next" class="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        Next
                    </button>
                </div>
            </div>
        </div>
    </div>

    @vite('resources/js/dashboard/home.js')
    @vite('resources/js/profile/edit-profile-modal.js')
    @vite('resources/js/facial-recognition/main.js')
    @vite('resources/js/dashboard/components/role-based.js')
    @vite('resources/js/dashboard/components/notifications.js')
    @vite('resources/js/dashboard/components/session-messages.js')
    @vite('resources/js/theme-manager.js')
</x-app-layout>