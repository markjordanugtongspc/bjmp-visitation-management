<x-app-layout>
    <div class="flex">
        <!-- Overlay for mobile -->
        <div data-sidebar-overlay class="fixed inset-0 z-30 hidden bg-black/50 backdrop-blur-sm sm:hidden"></div>

        <!-- Sidebar -->
        <aside data-sidebar class="fixed z-40 inset-y-0 left-0 w-72 -translate-x-full sm:translate-x-0 sm:static sm:inset-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-transform">
            <nav data-sidebar-nav class="p-3 text-sm">
                <div class="px-3 pb-2 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Main</div>
                <a href="{{ route('dashboard') }}" class="group flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M10.5 3.75a.75.75 0 011.06 0l8.69 8.69a.75.75 0 11-1.06 1.06l-.19-.19V18a2.25 2.25 0 01-2.25 2.25H15a.75.75 0 01-.75-.75v-4.5h-3V19.5a.75.75 0 01-.75.75H6.25A2.25 2.25 0 014 18v-4.69l-.19.19a.75.75 0 11-1.06-1.06l7.75-7.75Z"/></svg>
                    <span>Dashboard</span>
                </a>
                <a href="#" class="group flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <svg width="16px" height="16px" viewBox="0 0 17.00 17.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="si-glyph si-glyph-person-prison" fill="#ffffff" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>771</title> <defs> </defs> <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g transform="translate(1.000000, 0.000000)" fill="#ffffff"> <path d="M12.6973076,16.022 L3.37869242,16.022 C1.53624385,16.022 0.0379999999,14.5191098 0.0379999999,12.6724147 L0.0379999999,3.37058005 C0.0379999999,1.5238849 1.53624385,0.022 3.37869242,0.022 L12.6973076,0.022 C14.5397561,0.022 16.038,1.5238849 16.038,3.37058005 L16.038,12.6724147 C16.038,14.5181045 14.5397561,16.022 12.6973076,16.022 L12.6973076,16.022 Z M3.10672887,1 C1.9450099,1 1,1.947963 1,3.11438255 L1,12.8836405 C1,14.0510485 1.9450099,15 3.10672887,15 L12.8922816,15 C14.0549901,15 15,14.0510485 15,12.8836405 L15,3.11438255 C15,1.947963 14.0549901,1 12.8922816,1 L3.10672887,1 L3.10672887,1 Z" class="si-glyph-fill"> </path> <path d="M3,1 L3,14.691 L4.03955078,14.691 L4.03955078,0.999999985 L3,1 Z" class="si-glyph-fill"> </path> <path d="M6,1 L6,14.691 L7.0189209,14.691 L7.0189209,0.999999985 L6,1 Z" class="si-glyph-fill"> </path> <path d="M9,1 L9,14.691 L10.0375977,14.691 L10.0375977,0.999999985 L9,1 Z" class="si-glyph-fill"> </path> <path d="M12,1 L12,14.691 L12.918457,14.691 L12.918457,1 L12,1 Z" class="si-glyph-fill"> </path> <g transform="translate(1.000000, 3.000000)"> <path d="M10.576,8.048 C10.177,8.635 9.681,9.507 9.105,10.546 C8.473,11.692 7.746,10.289 6.951,10.289 C6.135,10.289 5.371,11.64 4.711,10.465 C4.143,9.454 3.65,8.639 3.262,8.076 C1.252,8.076 0.216,9.376 -0.316,10.947 C-0.85,12.52 14.862,12.513 14.375,10.934 C13.89,9.354 12.838,8.048 10.576,8.048 L10.576,8.048 Z" class="si-glyph-fill"> </path> <path d="M9.977,3.154 C9.977,4.815 8.654,7.992 7.022,7.992 C5.388,7.992 4.066,4.815 4.066,3.154 C4.066,1.491 5.388,0.144 7.022,0.144 C8.653,0.145 9.977,1.491 9.977,3.154 L9.977,3.154 Z" class="si-glyph-fill"> </path> </g> </g> </g> </g></svg>
                    <span>Inmates</span>
                </a>
                <a href="{{ url('/visitation/request/visitor') }}" class="group flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 7.5A4.5 4.5 0 1112 3a4.5 4.5 0 014.5 4.5zM4.5 19.5a7.5 7.5 0 0115 0V21H4.5v-1.5z"/></svg>
                    <span>Visitors</span>
                </a>
                <a href="#" class="group flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M6.75 3A3.75 3.75 0 003 6.75v10.5A3.75 3.75 0 006.75 21h10.5A3.75 3.75 0 0021 17.25V6.75A3.75 3.75 0 0017.25 3H6.75zM7.5 7.5h9v6h-9v-6z"/></svg>
                    <span>Schedules</span>
                </a>

                <div class="px-3 pt-4 pb-2 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Visitation</div>
                <a href="#" class="group flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 5.25A2.25 2.25 0 016.75 3h10.5A2.25 2.25 0 0119.5 5.25v13.5A2.25 2.25 0 0117.25 21H6.75A2.25 2.25 0 014.5 18.75V5.25zM7.5 9h9v6h-9V9z"/></svg>
                    <span>Requests</span>
                </a>
                <a href="#" class="group flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.9998 10.5004C15.9998 11.3288 15.5521 12.0004 14.9998 12.0004C14.4475 12.0004 13.9998 11.3288 13.9998 10.5004C13.9998 9.67196 14.4475 9.00039 14.9998 9.00039C15.5521 9.00039 15.9998 9.67196 15.9998 10.5004Z" fill="#FFFFFF"/><path d="M9.99982 10.5004C9.99982 11.3288 9.5521 12.0004 8.99982 12.0004C8.44753 12.0004 7.99982 11.3288 7.99982 10.5004C7.99982 9.67196 8.44753 9.00039 8.99982 9.00039C9.5521 9.00039 9.99982 9.67196 9.99982 10.5004Z" fill="#FFFFFF"/><path fill-rule="evenodd" clip-rule="evenodd" d="M13.2648 2.05116C13.3472 1.64522 13.7431 1.38294 14.149 1.46533C18.3625 2.32056 21.6797 5.63763 22.535 9.85114C22.6173 10.2571 22.3551 10.6529 21.9491 10.7353C21.5432 10.8177 21.1473 10.5555 21.0649 10.1495C20.3295 6.52642 17.4738 3.67075 13.8506 2.93535C13.4447 2.85296 13.1824 2.45709 13.2648 2.05116ZM10.735 2.05121C10.8174 2.45714 10.5551 2.85301 10.1492 2.93541C6.52602 3.6708 3.67032 6.52647 2.93486 10.1496C2.85246 10.5555 2.45659 10.8178 2.05065 10.7354C1.64472 10.653 1.38244 10.2571 1.46484 9.85119C2.32014 5.63769 5.63726 2.32061 9.85079 1.46538C10.2567 1.38299 10.6526 1.64527 10.735 2.05121ZM2.05081 13.2654C2.45675 13.183 2.85262 13.4453 2.93502 13.8512C3.67048 17.4743 6.52618 20.33 10.1493 21.0654C10.5553 21.1478 10.8175 21.5436 10.7351 21.9496C10.6528 22.3555 10.2569 22.6178 9.85095 22.5354C5.63742 21.6802 2.3203 18.3631 1.465 14.1496C1.3826 13.7437 1.64488 13.3478 2.05081 13.2654ZM21.9491 13.2654C22.3551 13.3478 22.6173 13.7437 22.535 14.1496C21.6797 18.3631 18.3625 21.6802 14.149 22.5354C13.7431 22.6178 13.3472 22.3555 13.2648 21.9496C13.1824 21.5436 13.4447 21.1478 13.8506 21.0654C17.4738 20.33 20.3295 17.4743 21.0649 13.8512C21.1473 13.4453 21.5432 13.183 21.9491 13.2654ZM8.39729 15.5538C8.64395 15.221 9.11366 15.1512 9.44643 15.3979C10.1748 15.9377 11.0539 16.2504 11.9998 16.2504C12.9457 16.2504 13.8249 15.9377 14.5532 15.3979C14.886 15.1512 15.3557 15.221 15.6023 15.5538C15.849 15.8865 15.7792 16.3563 15.4464 16.6029C14.474 17.3237 13.2848 17.7504 11.9998 17.7504C10.7148 17.7504 9.52562 17.3237 8.55321 16.6029C8.22044 16.3563 8.15063 15.8865 8.39729 15.5538Z" fill="#FFFFFF"/></svg>
                    <span>Facial Recognition</span>
                </a>

                <div class="px-3 pt-4 pb-2 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Administration</div>
                <a href="#" class="group flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M12 6.75a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zM3 12a9 9 0 1118 0 9 9 0 01-18 0z"/></svg>
                    <span>Reports</span>
                </a>
                <a href="{{ route('profile.edit') }}" class="group flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 border-blue-500 bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855"/></svg>
                    <span>Profile</span>
                </a>
                <a href="{{ route('officers.index') }}" class="group flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 opacity-80">
                        <path d="M16 11a4 4 0 10-8 0 4 4 0 008 0z"/>
                        <path fill-rule="evenodd" d="M12 14c-5.333 0-8 2.667-8 6a1 1 0 001 1h14a1 1 0 001-1c0-3.333-2.667-6-8-6z" clip-rule="evenodd"/>
                    </svg>
                    <span>Officers</span>
                </a>

                <div class="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3">
                        <div class="h-9 w-9 rounded-full bg-blue-500/10 ring-2 ring-blue-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25A9.75 9.75 0 1021.75 12 9.76 9.76 0 0012 2.25zm0 3a1.5 1.5 0 11-1.5 1.5A1.5 1.5 0 0112 5.25zM9 10.5h6v8.25H9z"/></svg>
                        </div>
                        <div class="text-xs text-gray-600 dark:text-gray-300">
                            Facial recognition replaces QR scanning.
                        </div>
                    </div>
                </div>
            </nav>
        </aside>

        <!-- Main content -->
        <div class="flex-1 min-h-screen bg-gray-50 dark:bg-gray-950">
            <!-- Hope UI–style Header -->
            <header class="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-900/70 bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800">
                <div class="h-14 sm:h-16 px-3 sm:px-4 flex items-center gap-3">
                    <!-- Mobile: sidebar toggle (hamburger icon) -->
                    <button data-sidebar-toggle class="sm:hidden inline-flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 h-9 w-9 text-gray-700 dark:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-label="Menu" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 6h16" />
                            <path d="M4 12h16" />
                            <path d="M4 18h16" />
                        </svg>
                    </button>

                    <!-- Brand -->
                    <a href="{{ route('dashboard') }}" class="hidden sm:flex items-center gap-2 mr-2">
                        <x-application-logo size="sm" :showText="true" heading="BJMP Iligan" subtext="Information & Visitation" />
                    </a>

                    <!-- Search -->
                    <div class="flex-1 max-w-xl">
                        <label class="relative block">
                            <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10.5 3.75a6.75 6.75 0 105.196 11.163l3.646 3.646a.75.75 0 101.06-1.06l-3.646-3.646A6.75 6.75 0 0010.5 3.75zM6 10.5a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z"/></svg>
                            </span>
                            <input placeholder="Search..." class="w-full h-9 pl-9 pr-3 rounded-md bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </label>
            </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-2 ml-auto">
                        <button class="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <span class="sr-only">Announcements</span>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a7.5 7.5 0 00-7.5 7.5V12l-1.5 1.5V15h18v-1.5L19.5 12V9.75a7.5 7.5 0 00-7.5-7.5zM8.25 18a3.75 3.75 0 007.5 0h-7.5z"/></svg>
                        </button>

                        <!-- User dropdown -->
                        <div class="relative">
                        <button data-user-menu
                          data-user-name="{{ Auth::user()->name ?? 'User' }}"
                          data-user-role="{{ Auth::user()->role ?? 'admin' }}"
                          class="inline-flex items-center gap-2 h-9 px-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                          aria-label="User menu for {{ Auth::user()->name ?? 'User' }}">
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
                              {{ Auth::user()->name ?? 'User' }}
                            </div>
                            <div class="text-[10px] text-gray-500 dark:text-gray-400" data-user-role-target>
                              {{ Auth::user()->role ?? 'admin' }}
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
                                
                                <button id="edit-profile-btn" class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                    </svg>
                                    {{ __('Edit Profile') }}
                                </button>
                                
                                <a href="{{ route('profile.edit') }}" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 6.75a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zM3 12a9 9 0 1118 0 9 9 0 01-18 0z"/>
                                    </svg>
                                    {{ __('Account Settings') }}
                                </a>
                                
                                <form method="POST" action="{{ route('logout') }}">
                                    @csrf
                                    <button type="submit" class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2a10 10 0 1010 10h-2a8 8 0 11-8-8V2z"/>
                                            <path d="M20 12h-8V4h2v6h6v2z"/>
                                        </svg>
                                        {{ __('Log Out') }}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Profile content -->
            <div class="p-4 sm:p-6">
                <!-- Page header -->
                <div class="mb-6">
                    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Profile Settings</h1>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage your account settings and security preferences.</p>
                </div>
                
                <div class="space-y-6">
                    <!-- Profile Information -->
                    <div class="bg-white dark:bg-gray-900 shadow border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                        <div class="p-4 sm:p-6">
                            <div class="max-w-3xl">
                    @include('profile.partials.update-profile-information-form')
                            </div>
                </div>
            </div>

                    <!-- Update Password -->
                    <div class="bg-white dark:bg-gray-900 shadow border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                        <div class="p-4 sm:p-6">
                            <div class="max-w-3xl">
                    @include('profile.partials.update-password-form')
                            </div>
                </div>
            </div>

                    <!-- Delete Account -->
                    <div class="bg-white dark:bg-gray-900 shadow border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                        <div class="p-4 sm:p-6">
                            <div class="max-w-3xl">
                    @include('profile.partials.delete-user-form')
                </div>
            </div>
        </div>
    </div>
            </div>
        </div>
    </div>
    
    @vite('resources/js/dashboard/home.js')
    @vite('resources/js/profile/edit-profile-modal.js')
</x-app-layout>
