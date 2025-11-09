<x-app-layout>
    <div class="flex">
        <div data-sidebar-overlay class="fixed inset-0 z-30 hidden bg-black/50 backdrop-blur-sm sm:hidden"></div>

        <aside data-sidebar class="fixed z-40 inset-y-0 left-0 w-72 -translate-x-full sm:translate-x-0 sm:static sm:inset-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-transform">
            <div class="sm:hidden flex items-center justify-between px-3 py-4 border-b border-gray-200 dark:border-gray-800">
                <a href="{{ route('dashboard') }}" class="flex items-center gap-2">
                    <x-application-logo size="sm" :showText="true" heading="BJMP Iligan" subtext="Information & Visitation" />
                </a>
                <x-theme-toggle />
            </div>

            <nav data-sidebar-nav class="p-3 text-sm" data-user-role="{{ Auth::user()->role_id ?? 0 }}">
            </nav>
        </aside>

        <div class="flex-1 min-h-screen bg-gray-50 dark:bg-gray-950">
            <header>
                <div class="h-14 sm:h-16 px-3 sm:px-4 flex items-center gap-3">
                    <button data-sidebar-toggle class="sm:hidden inline-flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 h-9 w-9 text-gray-700 dark:text-gray-300 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-label="Menu" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 6h16" />
                        <path d="M4 12h16" />
                        <path d="M4 18h16" />
                      </svg>
                    </button>

                    <a href="{{ route('dashboard') }}" class="hidden sm:flex items-center gap-2 mr-2">
                        <x-application-logo size="sm" :showText="true" heading="BJMP Iligan" subtext="Information & Visitation" />
                    </a>

                    <div class="flex-1 max-w-xl">
                        <label class="relative block">
                            <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10.5 3.75a6.75 6.75 0 105.196 11.163l3.646 3.646a.75.75 0 101.06-1.06l-3.646-3.646A6.75 6.75 0 0010.5 3.75zM6 10.5a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z"/></svg>
                            </span>
                            <input id="visitors-search" placeholder="Search visitors or PDL..." class="w-full h-9 pl-9 pr-3 rounded-md bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </label>
                    </div>

                    <div class="flex items-center gap-2 ml-auto">
                        <x-theme-toggle />

                        <x-notification-bell />

                        <!-- User dropdown -->
                        <div class="relative">
                            <button data-user-menu
                              data-user-name="{{ Auth::user()->full_name ?? 'User' }}"
                              data-user-role="{{ Auth::user()->title ?? 'Admin' }}"
                              data-user-profile-url="{{ Auth::user()->profile_picture_url ?? '' }}"
                              class="inline-flex items-center gap-2 h-9 px-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                              aria-label="User menu for {{ Auth::user()->full_name ?? 'User' }}">
                              <span class="h-8 w-8 inline-flex items-center justify-center rounded-full ring-2 ring-blue-500/30 bg-white dark:bg-gray-800" aria-label="Profile image">
                                @if(Auth::user()->profile_picture)
                                    <img src="{{ Auth::user()->profile_picture_url }}" alt="Profile" class="h-full w-full object-cover rounded-full">
                                @else
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="currentColor" aria-label="Profile">
                                      <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z"/>
                                      <path d="M2 22s4-4 10-4 10 4 10 4-4 2-10 2-10-2-10-2z"/>
                                    </svg>
                                @endif
                              </span>
                              <div class="hidden sm:block text-left leading-tight">
                                <div class="text-xs font-medium text-gray-900 dark:text-gray-50" data-user-name-target>
                                  {{ Auth::user()->full_name ?? 'User' }}
                                </div>
                                <div class="text-[10px] text-gray-500 dark:text-gray-400" data-user-role-target>
                                  {{ Auth::user()->title ?? 'Searcher' }}
                                </div>
                              </div>
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 15l-4-4h8z"/>
                              </svg>
                            </button>
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
                                
                                <a href="{{ route('profile.edit') }}" class="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 gap-2" aria-label="{{ __('Account Settings') }}">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                      <path fill="currentColor" d="M14.654 21.846q-.529 0-.9-.37t-.37-.899v-5.923q0-.529.37-.9t.9-.37h5.923q.529 0 .899.37t.37.9v5.923q 0 .529-.37.899t-.899.37zM11 17.386V21h-.098q-.348 0-.576-.229t-.29-.571l-.263-2.092q-.479-.145-1.036-.454q-.556-.31-.947-.664l-1.915.824q-.317.14-.644.03t-.504-.415L3.648 15.57q-.177-.305-.104-.638t.348-.546l1.672-1.25q-.045-.272-.073-.559q-.03-.288-.03-.559q0-.252.03-.53q.028-.278.073-.626l-1.672-1.25q-.275-.213-.338-.555t.113-.648l1.06-1.8q.177-.287.504-.406t.644.021l1.896.804q.448-.373.97-.673q.52-.3 1.013-.464l.283-2.092q.061-.342.318-.571T10.96 3h2.08q.349 0 .605.229q.257.229.319.571l.263 2.112q.575.202 1.016.463t.909.654l1.992-.804q.318-.14.645-.021t.503.406l1.06 1.819q.177.306.104.641q-.073.336-.348.544l-1.216.911q-.176.135-.362.133t-.346-.173t-.148-.38t.183-.347l1.225-.908l-.994-1.7l-2.552 1.07q-.454-.499-1.193-.935q-.74-.435-1.4-.577L13 4h-1.994l-.312 2.689q-.756.161-1.39.52q-.633.358-1.26.985L5.55 7.15l-.994 1.7l2.169 1.62q-.125.336-.175.73t-.05.82q0 .38.05.755t.156.73l-2.15 1.645l.994 1.7l2.475-1.05q.6.606 1.363.999t1.612.588m.973-7.887q-1.046 0-1.773.724T9.473 12q0 .467.16.89t.479.777q.16.183.366.206q.207.023.384-.136q.177-.154.181-.355t-.154-.347q-.208-.2-.312-.47T10.473 12q0-.625.438-1.063t1.062-.437q.289 0 .565.116q.276.117.476.324q.146.148.338.134q.192-.015.346-.191q.154-.177.134-.381t-.198-.364q-.311-.3-.753-.469t-.908-.169m5.643 8.962q-.625 0-1.197.191q-.571.191-1.057.56q-.287.22-.44.445t-.153.456q0 .136.106.242t.242.105h5.097q.105 0 .177-.095q.07-.097.07-.252q0-.231-.152-.456q-.153-.225-.44-.444q-.486-.37-1.057-.561t-1.196-.191m0-.846q.528 0 .899-.37q.37-.371.37-.9t-.37-.899t-.9-.37q-.528 0-.899.37q-.37.37-.37.9q0 .528.37.898t.9.37" />
                                    </svg>
                                    <span>{{ __('Account Settings') }}</span>
                                </a>
                                <form method="POST" action="{{ route('logout') }}">
                                    @csrf
                                    <button type="submit" class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="36" stroke-dashoffset="36" d="M12 4h-7c-0.55 0 -1 0.45 -1 1v14c0 0.55 0.45 1 1 1h7"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.5s" values="36;0" /></path><path stroke-dasharray="14" stroke-dashoffset="14" d="M9 12h11.5"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="14;0" /></path><path stroke-dasharray="6" stroke-dashoffset="6" d="M20.5 12l-3.5 -3.5M20.5 12l-3.5 3.5"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.8s" dur="0.2s" values="6;0" /></path></g></svg>
                                        {{ __('Log Out') }}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div class="p-4 sm:p-6">
                <div class="mb-6">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div class="flex-1">
                            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Visitor Registration</h1>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Assign and register an inmate’s valid visitor</p>
                        </div>
                        <div class="flex gap-2">
                            <button type="button" id="open-manual-registration" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14m-7-7h14"/></svg>
                                Register Inmate Visitor
                            </button>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-6">
                    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-3 sm:p-4 transition-all hover:shadow-md">
                        <div class="flex flex-col gap-1">
                            <div class="flex items-center justify-between">
                                <p class="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Registered</p>
                                <span class="inline-flex items-center rounded-full bg-blue-500/10 text-blue-500 px-1.5 py-0.5 text-[8px] sm:text-[10px]">Total</span>
                            </div>
                            <p class="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400 transition-all" id="allowed-visitors-total">0</p>
                        </div>
                    </div>
                    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-3 sm:p-4 transition-all hover:shadow-md">
                        <div class="flex flex-col gap-1">
                            <p class="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">No Visitor</p>
                            <p class="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400 transition-all" id="inmates-without-allowed">0</p>
                        </div>
                    </div>
                    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-3 sm:p-4 transition-all hover:shadow-md">
                        <div class="flex flex-col gap-1">
                            <p class="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Total Inmates</p>
                            <p class="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400 transition-all" id="inmates-total">0</p>
                        </div>
                    </div>
                    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-3 sm:p-4 transition-all hover:shadow-md">
                        <div class="flex flex-col gap-1">
                            <div class="flex items-center justify-between">
                                <p class="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Recent</p>
                                <span class="inline-flex items-center rounded-full bg-orange-500/10 text-orange-500 px-1.5 py-0.5 text-[8px] sm:text-[10px]">7 days</span>
                            </div>
                            <p class="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600 dark:text-orange-400 transition-all" id="recently-added">0</p>
                        </div>
                    </div>
                </div>

                <div class="mb-6">
                    <div class="flex flex-col sm:flex-row gap-4">
                        <div class="flex-1"></div>
                        <div class="flex gap-2">
                            <select id="visitors-status-filter" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                                <option value="">All Life Status</option>
                                <option value="Alive">Alive</option>
                                <option value="Deceased">Deceased</option>
                                <option value="Unknown">Unknown</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="hidden sm:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead class="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Visitor</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">PDL</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Relationship</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Life Status</th>
                                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="visitors-table-body" class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                <tr>
                                    <td colspan="5" class="px-4 py-12 text-center">
                                        <div class="flex flex-col items-center justify-center space-y-6">
                                            <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                            </div>
                                            <div class="text-center">
                                                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">No Visitors Yet</h3>
                                                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">Use "New Manual Registration" to add the first visitor.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="sm:hidden space-y-4" id="visitors-cards-mobile">
                    <div class="text-center py-8 sm:py-12">
                        <div class="flex flex-col items-center justify-center space-y-6 px-4 sm:px-0">
                            <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            </div>
                            <div class="text-center">
                                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">No Visitors Yet</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">Use "New Manual Registration" to add the first visitor.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    @vite('resources/js/dashboard/home.js')
    @vite('resources/js/profile/edit-profile-modal.js')
    @vite('resources/js/visitors/allowed-visitors.js')
    @vite('resources/js/dashboard/components/role-based.js')
    @vite('resources/js/dashboard/components/quick-action-modals.js')
</x-app-layout>
