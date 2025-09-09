<x-app-layout>
    <div class="flex">
        <!-- Overlay for mobile -->
        <div data-sidebar-overlay class="fixed inset-0 z-30 hidden bg-gray-900/50 backdrop-blur-sm sm:hidden"></div>

        <!-- Sidebar -->
        <aside data-sidebar class="fixed z-40 inset-y-0 left-0 w-72 -translate-x-full sm:translate-x-0 sm:static sm:inset-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-transform">

            <nav data-sidebar-nav class="p-3 text-sm">
                <div class="px-3 pb-2 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Main</div>
                <a href="{{ route('dashboard') }}" class="group flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 {{ request()->routeIs('dashboard') ? 'border-brand-primary-dark bg-brand-secondary-light text-brand-text-light dark:bg-brand-secondary-dark dark:text-brand-text-dark' : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-brand-secondary-light dark:hover:bg-brand-secondary-dark' }}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M10.5 3.75a.75.75 0 011.06 0l8.69 8.69a.75.75 0 11-1.06 1.06l-.19-.19V18a2.25 2.25 0 01-2.25 2.25H15a.75.75 0 01-.75-.75v-4.5h-3V19.5a.75.75 0 01-.75.75H6.25A2.25 2.25 0 014 18v-4.69l-.19.19a.75.75 0 11-1.06-1.06l7.75-7.75Z"/></svg>
                    <span>Dashboard</span>
                </a>
                <a href="#" class="group flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM3 20.25a8.25 8.25 0 1116.5 0V21H3v-.75z"/></svg>
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
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M2.25 12a9.75 9.75 0 1119.5 0 9.75 9.75 0 01-19.5 0zm9.75-4.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-3 7.5a3 3 0 116 0v.75h-6V15z"/></svg>
                    <span>Facial Recognition</span>
                </a>

                <div class="px-3 pt-4 pb-2 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Administration</div>
                <a href="#" class="group flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M12 6.75a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zM3 12a9 9 0 1118 0 9 9 0 01-18 0z"/></svg>
                    <span>Reports</span>
                </a>

                <a href="{{ route('profile.edit') }}" class="group flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 0115 0V21H4.5v-1.5z"/></svg>
                    <span>Profile</span>
                </a>
                <a href="{{ route('officers.index') }}" class="group flex items-center gap-3 rounded-md px-3 py-2 mb-1 border-l-2 {{ request()->routeIs('officers.*') ? 'border-blue-500 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-50' : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' }}">
                    <!-- Users icon -->
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
        <div class="flex-1 min-h-screen bg-gray-950">
            <!-- Hope UI–style Header -->
            <header class="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-gray-900/70 bg-gray-900/95 border-b border-gray-800">
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
                            <input placeholder="Search officers..." class="w-full h-9 pl-9 pr-3 rounded-md bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                                  <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z"/>
                                  <path d="M2 22s4-4 10-4 10 4 10 4-4 2-10 2-10-2-10-2z"/>
                                </svg>
                              </span>
                              <div class="hidden sm:block text-left leading-tight">
                                <div class="text-xs font-medium text-gray-700 dark:text-gray-50" data-user-name-target>
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
                                    <span class="block text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{{ Auth::user()->email }}</span>
                                </div>
                                <hr class="border-t border-gray-200 dark:border-gray-700">
                                <a href="{{ route('profile.edit') }}" class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2">
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

            <!-- Officers content -->
            <div class="p-4 sm:p-6">
                <div class="rounded-xl bg-gray-900 border border-gray-800 shadow">
                    <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                        <div>
                            <div class="text-sm sm:text-base font-medium text-gray-50">Officers</div>
                            <div class="text-xs text-gray-400">A list of all officers including their name, title, email and status.</div>
                        </div>
                        <button type="button" class="inline-flex items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs sm:text-sm cursor-pointer" data-add-officer>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5a.75.75 0 01.75.75V12h6.75a.75.75 0 010 1.5H12.75V20a.75.75 0 01-1.5 0v-6.5H4.5a.75.75 0 010-1.5h6.75V5.25A.75.75 0 0112 4.5z"/></svg>
                            Add officer
                        </button>
                    </div>

                    <!-- Desktop Table (hidden on mobile) -->
                    <div class="hidden sm:block overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-800/60 text-gray-300">
                                <tr>
                                    <th class="text-left font-medium px-4 py-3">Name</th>
                                    <th class="text-left font-medium px-4 py-3">Title</th>
                                    <th class="text-left font-medium px-4 py-3">Status</th>
                                    <th class="text-right font-medium px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="officers-table-body" class="divide-y divide-gray-800 text-gray-200">
                                @php
                                    $officers = [
                                        ['id'=>1,'name'=>'Jail Warden','email'=>'warden@bjmp.gov.ph','title'=>'Warden','subtitle'=>'Jail Management','status'=>'Active'],
                                        ['id'=>2,'name'=>'Assistant Warden','email'=>'asst.warden@bjmp.gov.ph','title'=>'Assistant Warden','subtitle'=>'Operations','status'=>'Active'],
                                        ['id'=>3,'name'=>'Chief Custodial','email'=>'custodial@bjmp.gov.ph','title'=>'Chief Custodial','subtitle'=>'Security','status'=>'Active'],
                                        ['id'=>4,'name'=>'Chief ICT','email'=>'ict@bjmp.gov.ph','title'=>'Chief ICT','subtitle'=>'Information Systems','status'=>'Active'],
                                        ['id'=>5,'name'=>'Senior Jail Officer','email'=>'sjo@bjmp.gov.ph','title'=>'Unit Executive Senior Jail Officer','subtitle'=>'Administration','status'=>'Active'],
                                        ['id'=>6,'name'=>'Chief Nurse','email'=>'health@bjmp.gov.ph','title'=>'Chief Health Nurse','subtitle'=>'Medical Services','status'=>'Active'],
                                    ];
                                @endphp

                                @foreach($officers as $o)
                                    <tr data-row-id="{{ $o['id'] }}" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td class="px-4 py-3 whitespace-nowrap">
                                            <div class="flex items-center gap-3">
                                                <div class="h-9 w-9 rounded-full bg-blue-500/10 text-blue-500 ring-2 ring-blue-500/20 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z"/><path d="M2 22s4-4 10-4 10 4 10 4-4 2-10 2-10-2-10-2z"/></svg>
                                                </div>
                                                <div>
                                                    <div class="font-medium text-gray-50" data-o-name>{{ $o['name'] }}</div>
                                                    <div class="text-xs text-gray-400" data-o-email>{{ $o['email'] }}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-4 py-3">
                                            <div class="font-medium text-gray-50" data-o-title>{{ $o['title'] }}</div>
                                            <div class="text-xs text-gray-400" data-o-subtitle>{{ $o['subtitle'] }}</div>
                                        </td>
                                        <td class="px-4 py-3">
                                            @php $active = strtolower($o['status']) === 'active'; @endphp
                                            <span data-o-status class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] {{ $active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500' }}">{{ $o['status'] }}</span>
                                        </td>
                                        <td class="px-4 py-3 text-right">
                                        <button type="button" data-edit-officer class="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 p-1.5 rounded-md transition-colors cursor-pointer" aria-label="Edit officer" title="Edit"
                                            data-id="{{ $o['id'] }}"
                                            data-name="{{ $o['name'] }}"
                                            data-email="{{ $o['email'] }}"
                                            data-title="{{ $o['title'] }}"
                                            data-subtitle="{{ $o['subtitle'] }}"
                                            data-status="{{ $o['status'] }}">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                                                <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                                                <path d="M16 5l3 3" />
                                            </svg>
                                        </button>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>

                    <!-- Mobile Cards (visible only on mobile) -->
                    <div class="sm:hidden">
                        <div id="officers-cards-mobile" class="divide-y divide-gray-800">
                            @foreach($officers as $o)
                                <div class="p-4 space-y-3" data-card-id="{{ $o['id'] }}">
                                    <div class="flex justify-between items-start">
                                        <div class="flex items-center gap-3">
                                            <div class="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 ring-2 ring-blue-500/20 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z"/><path d="M2 22s4-4 10-4 10 4 10 4-4 2-10 2-10-2-10-2z"/></svg>
                                            </div>
                                            <div>
                                                <div class="font-medium text-gray-50" data-o-name>{{ $o['name'] }}</div>
                                                <div class="text-xs text-gray-400" data-o-email>{{ $o['email'] }}</div>
                                            </div>
                                        </div>
                                        <button type="button" data-edit-officer 
                                            class="bg-blue-500/10 text-blue-500 p-2 rounded-md" 
                                            aria-label="Edit officer" 
                                            data-id="{{ $o['id'] }}"
                                            data-name="{{ $o['name'] }}"
                                            data-email="{{ $o['email'] }}"
                                            data-title="{{ $o['title'] }}"
                                            data-subtitle="{{ $o['subtitle'] }}"
                                            data-status="{{ $o['status'] }}">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                                                <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                                                <path d="M16 5l3 3" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div class="mt-2 pl-13">
                                        <div class="flex justify-between items-center">
                                            <div>
                                                <div class="font-medium text-gray-50" data-o-title>{{ $o['title'] }}</div>
                                                <div class="text-xs text-gray-400" data-o-subtitle>{{ $o['subtitle'] }}</div>
                                            </div>
                                            @php $active = strtolower($o['status']) === 'active'; @endphp
                                            <span data-o-status class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium {{ $active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500' }}">{{ $o['status'] }}</span>
                                        </div>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    @vite('resources/js/dashboard/home.js')
    @vite('resources/js/officers/officers.js')
    @vite('resources/js/profile/edit-profile-modal.js')
</x-app-layout>