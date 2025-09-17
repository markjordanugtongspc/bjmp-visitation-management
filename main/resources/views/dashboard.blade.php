<x-app-layout>
    <div class="flex">
        <!-- Overlay for mobile -->
        <div data-sidebar-overlay class="fixed inset-0 z-30 hidden bg-black/50 backdrop-blur-sm sm:hidden"></div>

        <!-- Sidebar -->
        <aside data-sidebar class="fixed z-40 inset-y-0 left-0 w-72 -translate-x-full sm:translate-x-0 sm:static sm:inset-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-transform">

            <nav data-sidebar-nav class="p-3 text-sm">
                <div class="px-3 pb-2 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Main</div>
                <a href="{{ route('dashboard') }}" class="group flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 {{ request()->routeIs('dashboard') ? 'border-blue-500 bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50' : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' }}">
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
                <a href="{{ route('profile.edit') }}" class="group flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855"/></svg>
                    <span>Profile</span>
                </a>
                <a href="{{ route('officers.index') }}" class="group flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 {{ request()->routeIs('officers.*') ? 'border-blue-500 bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50' : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' }}">
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
                            Keep records updated and verified.
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
                        <!-- <a href="#" class="hidden sm:inline-flex items-center gap-1 h-9 px-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium">Go Pro</a> -->

                        <button class="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
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
                              Admin
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
                                
                                <a href="{{ route('profile.edit') }}" class="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 gap-2" aria-label="{{ __('Account Settings') }}">
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

            <div class="p-4 sm:p-6">
                <!-- Analytics Overview -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <!-- Line Chart -->
                    <div class="rounded-xl bg-white dark:bg-gray-900 p-4 shadow border border-gray-200 dark:border-gray-800 lg:col-span-2">
                        <div class="flex items-center justify-between">
                            <div class="text-sm font-medium text-gray-900 dark:text-gray-50">Weekly Visitor Traffic</div>
                            <span class="text-[11px] text-gray-500 dark:text-gray-400">Last 7 days</span>
                        </div>
                        <div class="mt-3">
                            <svg viewBox="0 0 600 220" class="w-full h-48">
                                <defs>
                                    <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.25" />
                                        <stop offset="100%" stop-color="#3B82F6" stop-opacity="0" />
                                    </linearGradient>
                                </defs>
                                <g fill="none" stroke-width="2">
                                    <path d="M40 170 L100 150 L160 120 L220 140 L280 100 L340 110 L400 90 L460 95 L520 70" stroke="#3B82F6" />
                                    <path d="M40 170 L100 150 L160 120 L220 140 L280 100 L340 110 L400 90 L460 95 L520 70 L520 200 L40 200 Z" fill="url(#lineFill)" stroke="none" />
                                </g>
                                <g stroke="#e5e7eb" class="dark:stroke-gray-800">
                                    <line x1="40" y1="200" x2="560" y2="200" />
                                </g>
                                <g fill="#6b7280" class="dark:fill-gray-400" font-size="10">
                                    <text x="40" y="210">Mon</text>
                                    <text x="120" y="210">Tue</text>
                                    <text x="200" y="210">Wed</text>
                                    <text x="280" y="210">Thu</text>
                                    <text x="360" y="210">Fri</text>
                                    <text x="440" y="210">Sat</text>
                                    <text x="520" y="210">Sun</text>
                                </g>
                            </svg>
                        </div>
                    </div>

                    <!-- Donut -->
                    <div class="rounded-xl bg-white dark:bg-gray-900 p-4 shadow border border-gray-200 dark:border-gray-800">
                        <div class="text-sm font-medium text-gray-900 dark:text-gray-50">Request Status</div>
                        <div class="mt-3 flex items-center justify-center">
                            <svg viewBox="0 0 120 120" class="h-40 w-40 -rotate-90">
                                <circle cx="60" cy="60" r="48" stroke="#e5e7eb" class="dark:stroke-gray-800" stroke-width="16" fill="none" />
                                <circle cx="60" cy="60" r="48" stroke="#22c55e" stroke-width="16" fill="none" stroke-dasharray="302" stroke-dashoffset="160" />
                                <circle cx="60" cy="60" r="48" stroke="#f59e0b" stroke-width="16" fill="none" stroke-dasharray="302" stroke-dashoffset="250" />
                                <circle cx="60" cy="60" r="48" stroke="#ef4444" stroke-width="16" fill="none" stroke-dasharray="302" stroke-dashoffset="285" />
                            </svg>
                        </div>
                        <div class="mt-2 grid grid-cols-3 gap-2 text-[11px] text-gray-600 dark:text-gray-300">
                            <div class="flex items-center gap-2"><span class="h-2 w-2 rounded-full bg-green-500"></span>Approved</div>
                            <div class="flex items-center gap-2"><span class="h-2 w-2 rounded-full bg-amber-500"></span>Pending</div>
                            <div class="flex items-center gap-2"><span class="h-2 w-2 rounded-full bg-red-500"></span>Rejected</div>
                        </div>
                    </div>
                </div>
                <!-- KPI Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div class="rounded-xl bg-white dark:bg-gray-900 p-4 shadow border border-gray-200 dark:border-gray-800">
                        <div class="flex items-center justify-between">
                            <div class="text-sm text-gray-600 dark:text-gray-300">Total Inmates</div>
                            <span class="inline-flex items-center rounded-full bg-blue-500/10 text-blue-500 px-2 py-0.5 text-[11px]">Live</span>
                        </div>
                        <div class="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">218</div>
                    </div>
                    <div class="rounded-xl bg-white dark:bg-gray-900 p-4 shadow border border-gray-200 dark:border-gray-800">
                        <div class="text-sm text-gray-600 dark:text-gray-300">Approved Visits</div>
                        <div class="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">64</div>
                    </div>
                    <div class="rounded-xl bg-white dark:bg-gray-900 p-4 shadow border border-gray-200 dark:border-gray-800">
                        <div class="text-sm text-gray-600 dark:text-gray-300">Pending Requests</div>
                        <div class="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">23</div>
                    </div>
                    <div class="rounded-xl bg-white dark:bg-gray-900 p-4 shadow border border-gray-200 dark:border-gray-800">
                        <div class="text-sm text-gray-600 dark:text-gray-300">Today's Visits</div>
                        <div class="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">12</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <a href="{{ url('/visitation/request/visitor') }}" class="group rounded-xl bg-white dark:bg-gray-900 p-4 shadow border border-gray-200 dark:border-gray-800 hover:border-blue-500">
                        <div class="flex items-center gap-3">
                            <div class="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5a.75.75 0 01.75.75V12h6.75a.75.75 0 010 1.5H12.75V20a.75.75 0 01-1.5 0v-6.5H4.5a.75.75 0 010-1.5h6.75V5.25A.75.75 0 0112 4.5z"/></svg>
                            </div>
                            <div>
                                <div class="text-sm font-medium text-gray-900 dark:text-gray-50">New Visitation Request</div>
                                <div class="text-xs text-gray-600 dark:text-gray-400">Create manual or automatic</div>
                            </div>
                        </div>
                    </a>
                    <a href="#" class="group rounded-xl bg-white dark:bg-gray-900 p-4 shadow border border-gray-200 dark:border-gray-800 hover:border-blue-500">
                        <div class="flex items-center gap-3">
                            <div class="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a9.75 9.75 0 019.75 9.75h-1.5A8.25 8.25 0 0012 3.75V2.25zM3 12A9 9 0 0012 21v-1.5A7.5 7.5 0 014.5 12H3z"/></svg>
                            </div>
                            <div>
                                <div class="text-sm font-medium text-gray-900 dark:text-gray-50">Check-in Visitor</div>
                                <div class="text-xs text-gray-600 dark:text-gray-400">Record arrival</div>
                            </div>
                        </div>
                    </a>
                    <a href="#" class="group rounded-xl bg-white dark:bg-gray-900 p-4 shadow border border-gray-200 dark:border-gray-800 hover:border-blue-500">
                        <div class="flex items-center gap-3">
                            <div class="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6.75 5.25A2.25 2.25 0 019 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0115 21H9a2.25 2.25 0 01-2.25-2.25V5.25zM9 6h6v12H9V6z"/></svg>
                            </div>
                            <div>
                                <div class="text-sm font-medium text-gray-900 dark:text-gray-50">Register Inmate</div>
                                <div class="text-xs text-gray-600 dark:text-gray-400">Add new record</div>
                            </div>
                        </div>
                    </a>
                    <a href="#" class="group rounded-xl bg-white dark:bg-gray-900 p-4 shadow border border-gray-200 dark:border-gray-800 hover:border-blue-500">
                        <div class="flex items-center gap-3">
                            <div class="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5a7.5 7.5 0 100 15 7.5 7.5 0 000-15zm0 3a4.5 4.5 0 013.89 2.25H8.11A4.5 4.5 0 0112 7.5z"/></svg>
                            </div>
                            <div>
                                <div class="text-sm font-medium text-gray-900 dark:text-gray-50">Run Face Scan</div>
                                <div class="text-xs text-gray-600 dark:text-gray-400">Verify identity</div>
                            </div>
                        </div>
                    </a>
                </div>

                <!-- Main Panels -->
                <div class="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <!-- Recent Requests -->
                    <div class="xl:col-span-2 rounded-xl bg-white dark:bg-gray-900 shadow border border-gray-200 dark:border-gray-800">
                        <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <div class="text-sm font-medium text-gray-900 dark:text-gray-50">Recent Visitation Requests</div>
                            <a href="#" class="text-xs text-blue-500 hover:underline">View all</a>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="min-w-full text-sm">
                                <thead class="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300">
                                    <tr>
                                        <th class="text-left font-medium px-4 py-2">Visitor</th>
                                        <th class="text-left font-medium px-4 py-2">Inmate</th>
                                        <th class="text-left font-medium px-4 py-2">Date</th>
                                        <th class="text-left font-medium px-4 py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200 dark:divide-gray-800 text-gray-700 dark:text-gray-200">
                                    <tr>
                                        <td class="px-4 py-2">Juan Dela Cruz</td>
                                        <td class="px-4 py-2">R. Santos</td>
                                        <td class="px-4 py-2">2025-09-02 10:00</td>
                                        <td class="px-4 py-2"><span class="inline-flex items-center rounded-full bg-blue-500/10 text-blue-500 px-2 py-0.5 text-[11px]">Pending</span></td>
                                    </tr>
                                    <tr>
                                        <td class="px-4 py-2">Maria I.</td>
                                        <td class="px-4 py-2">J. Dizon</td>
                                        <td class="px-4 py-2">2025-09-02 13:30</td>
                                        <td class="px-4 py-2"><span class="inline-flex items-center rounded-full bg-green-500/10 text-green-500 px-2 py-0.5 text-[11px]">Approved</span></td>
                                    </tr>
                                    <tr>
                                        <td class="px-4 py-2">A. Lopez</td>
                                        <td class="px-4 py-2">K. Reyes</td>
                                        <td class="px-4 py-2">2025-09-03 09:00</td>
                                        <td class="px-4 py-2"><span class="inline-flex items-center rounded-full bg-red-500/10 text-red-500 px-2 py-0.5 text-[11px]">Rejected</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Upcoming Schedules -->
                    <div class="rounded-xl bg-white dark:bg-gray-900 shadow border border-gray-200 dark:border-gray-800">
                        <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-900 dark:text-gray-50">Upcoming Schedules</div>
                        <div class="p-4 space-y-3 text-sm text-gray-700 dark:text-gray-200">
                            <div class="flex items-center justify-between">
                                <div>
                                    <div class="font-medium">Wed, 3 PM</div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400">Group visitation - Hall A</div>
                                </div>
                                <span class="inline-flex items-center rounded-full bg-amber-500/10 text-amber-500 px-2 py-0.5 text-[11px]">Capacity 70%</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <div>
                                    <div class="font-medium">Fri, 10 AM</div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400">Family visit - Hall B</div>
                                </div>
                                <span class="inline-flex items-center rounded-full bg-blue-500/10 text-blue-500 px-2 py-0.5 text-[11px]">Open</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <div>
                                    <div class="font-medium">Sat, 1 PM</div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400">Legal counsel - Room 2</div>
                                </div>
                                <span class="inline-flex items-center rounded-full bg-red-500/10 text-red-500 px-2 py-0.5 text-[11px]">Full</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bar Chart + Progress -->
                <div class="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <!-- Bar Chart -->
                    <div class="rounded-xl bg-white dark:bg-gray-900 p-4 shadow border border-gray-200 dark:border-gray-800 lg:col-span-2">
                        <div class="flex items-center justify-between">
                            <div class="text-sm font-medium text-gray-900 dark:text-gray-50">Monthly Visits</div>
                            <span class="text-[11px] text-gray-500 dark:text-gray-400">2025</span>
                        </div>
                        <div class="mt-3">
                            <svg viewBox="0 0 600 220" class="w-full h-48">
                                <g fill="#3B82F6">
                                    <rect x="40" y="120" width="28" height="80" rx="4"/>
                                    <rect x="90" y="100" width="28" height="100" rx="4"/>
                                    <rect x="140" y="140" width="28" height="60" rx="4"/>
                                    <rect x="190" y="90" width="28" height="110" rx="4"/>
                                    <rect x="240" y="130" width="28" height="70" rx="4"/>
                                    <rect x="290" y="70" width="28" height="130" rx="4"/>
                                    <rect x="340" y="110" width="28" height="90" rx="4"/>
                                    <rect x="390" y="95" width="28" height="105" rx="4"/>
                                    <rect x="440" y="150" width="28" height="50" rx="4"/>
                                    <rect x="490" y="125" width="28" height="75" rx="4"/>
                                </g>
                                <g fill="#6b7280" class="dark:fill-gray-400" font-size="10">
                                    <text x="40" y="210">Jan</text>
                                    <text x="90" y="210">Feb</text>
                                    <text x="140" y="210">Mar</text>
                                    <text x="190" y="210">Apr</text>
                                    <text x="240" y="210">May</text>
                                    <text x="290" y="210">Jun</text>
                                    <text x="340" y="210">Jul</text>
                                    <text x="390" y="210">Aug</text>
                                    <text x="440" y="210">Sep</text>
                                    <text x="490" y="210">Oct</text>
                                </g>
                            </svg>
                        </div>
                    </div>

                    <!-- Progress Cards -->
                    <div class="rounded-xl bg-white dark:bg-gray-900 p-4 shadow border border-gray-200 dark:border-gray-800">
                        <div class="text-sm font-medium text-gray-900 dark:text-gray-50">Facility Capacity</div>
                        <div class="mt-3 space-y-3">
                            <div>
                                <div class="flex justify-between text-xs text-gray-600 dark:text-gray-300"><span>Hall A</span><span>70%</span></div>
                                <div class="h-2 rounded bg-gray-100 dark:bg-gray-800 mt-1">
                                    <div class="h-2 rounded bg-blue-500" style="width:70%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between text-xs text-gray-600 dark:text-gray-300"><span>Hall B</span><span>45%</span></div>
                                <div class="h-2 rounded bg-gray-100 dark:bg-gray-800 mt-1">
                                    <div class="h-2 rounded bg-amber-500" style="width:45%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between text-xs text-gray-600 dark:text-gray-300"><span>Room 2</span><span>90%</span></div>
                                <div class="h-2 rounded bg-gray-100 dark:bg-gray-800 mt-1">
                                    <div class="h-2 rounded bg-red-500" style="width:90%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Announcements / Info -->
                <div class="mt-4 rounded-xl bg-white dark:bg-gray-900 shadow border border-gray-200 dark:border-gray-800">
                    <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                        <div class="text-sm font-medium text-gray-900 dark:text-gray-50">Announcements</div>
                        <button class="text-xs text-blue-500 hover:underline">Mark all as read</button>
                    </div>
                    <div class="p-4 space-y-3 text-sm text-gray-700 dark:text-gray-200">
                        <div class="flex gap-3">
                            <div class="h-6 w-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a9.75 9.75 0 019.75 9.75H18l3.75 3.75L18 19.5v-3h-6v-3H5.25A9.75 9.75 0 0112 2.25z"/></svg>
                            </div>
                            <div>
                                Updated visitation hours effective next week. Please check schedules.
                            </div>
                        </div>
                        <div class="flex gap-3">
                            <div class="h-6 w-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5zM12 7.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V8.25A.75.75 0 0112 7.5zm0 9a1.125 1.125 0 111.125-1.125A1.125 1.125 0 0112 16.5z"/></svg>
                            </div>
                            <div>
                                Bring a valid ID for verification. Face scan will be required at entry.
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
