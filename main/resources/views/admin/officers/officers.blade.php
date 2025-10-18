<x-app-layout>
    <div class="flex">
        <!-- Overlay for mobile -->
        <div data-sidebar-overlay class="fixed inset-0 z-30 hidden bg-black/50 backdrop-blur-sm sm:hidden"></div>

        <!-- Sidebar -->
        <aside data-sidebar class="fixed z-40 inset-y-0 left-0 w-72 -translate-x-full sm:translate-x-0 sm:static sm:inset-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-transform">

            <!-- Mobile Brand -->
            <div class="sm:hidden flex items-center px-3 py-4 border-b border-gray-200 dark:border-gray-800">
                <a href="{{ route('dashboard') }}" class="flex items-center gap-2">
                    <x-application-logo size="sm" :showText="true" heading="BJMP Iligan" subtext="Information & Visitation" />
                </a>
            </div>

            <nav data-sidebar-nav class="p-3 text-sm" data-user-role="{{ Auth::user()->role_id ?? 0 }}">
                <!-- Dynamic navigation will be populated here by JavaScript -->
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
                    <button class="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                        <span class="sr-only">Announcements</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a7.5 7.5 0 00-7.5 7.5V12l-1.5 1.5V15h18v-1.5L19.5 12V9.75a7.5 7.5 0 00-7.5-7.5zM8.25 18a3.75 3.75 0 007.5 0h-7.5z"/></svg>
                    </button>

                        <!-- User dropdown -->
                        <div class="relative">
                            <button data-user-menu
                              data-user-name="{{ Auth::user()->full_name ?? 'User' }}"
                              data-user-role="{{ Auth::user()->role_id ?? 0 }}"
                              data-user-profile-url="{{ Auth::user()->profile_picture_url ?? '' }}"
                              class="inline-flex items-center gap-2 h-9 px-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                              aria-label="User menu for {{ Auth::user()->full_name ?? 'User' }}">
                              <span
                                class="h-8 w-8 inline-flex items-center justify-center rounded-full ring-2 ring-blue-500/30 bg-white dark:bg-gray-800"
                                aria-label="Profile image">
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
                                <div class="text-xs font-medium text-gray-700 dark:text-gray-50" data-user-name-target>
                                  {{ Auth::user()->full_name ?? 'User' }}
                                </div>
                                <div class="text-[10px] text-gray-500 dark:text-gray-400" data-user-role-target>
                                  {{ Auth::user()->getRoleName() }}
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

            <!-- Officers content -->
            <div class="p-4 sm:p-6">
                <div class="rounded-xl bg-gray-900 border border-gray-800 shadow">
                    <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                        <div>
                            <div class="text-sm sm:text-base font-medium text-gray-50">Officers</div>
                            <div class="text-xs text-gray-400">A list of all officers including their name, title, email and status.</div>
                        </div>
                        <button type="button" class="inline-flex items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs sm:text-sm cursor-pointer" data-add-officer data-store-url="{{ route('admin.officers.store') }}" data-update-url="{{ route('admin.officers.update', ['user' => 0]) }}" data-list-url="{{ route('admin.officers.list') }}" data-csrf="{{ csrf_token() }}">
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
    @vite('resources/js/dashboard/components/role-based.js')
</x-app-layout>