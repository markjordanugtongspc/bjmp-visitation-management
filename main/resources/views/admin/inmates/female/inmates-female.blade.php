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
        <div class="flex-1 min-h-screen bg-gray-50 dark:bg-gray-950" data-route-admin-inmates-male="{{ route('admin.inmates.index') }}" data-route-admin-inmates-female="{{ route('admin.inmates.female') }}" data-current-gender="female">
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
                        <button class="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                            <span class="sr-only">Announcements</span>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a7.5 7.5 0 00-7.5 7.5V12l-1.5 1.5V15h18v-1.5L19.5 12V9.75a7.5 7.5 0 00-7.5-7.5zM8.25 18a3.75 3.75 0 007.5 0h-7.5z"/></svg>
                        </button>

                        <!-- User dropdown -->
                        <div class="relative">
                        <button data-user-menu
                          data-user-name="{{ Auth::user()->full_name ?? 'User' }}"
                          data-user-role="{{ Auth::user()->title ?? 'Admin' }}"
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
                                  <!-- simple user silhouette -->
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
                              {{ Auth::user()->title ?? 'Admin' }}
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
                                
                                <button id="edit-profile-btn-template" class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                    </svg>
                                    {{ __('Edit Profile') }}
                                </button>
                                
                                <a href="{{ route('profile.edit') }}" class="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 gap-2" aria-label="{{ __('Account Settings') }}">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                      <path fill="currentColor" d="M14.654 21.846q-.529 0-.9-.37t-.37-.899v-5.923q0-.529.37-.9t.9-.37h5.923q.529 0 .899.37t.37.9v5.923q0 .529-.37.899t-.899.37zM11 17.386V21h-.098q-.348 0-.576-.229t-.29-.571l-.263-2.092q-.479-.145-1.036-.454q-.556-.31-.947-.664l-1.915.824q-.317.14-.644.03t-.504-.415L3.648 15.57q-.177-.305-.104-.638t.348-.546l1.672-1.25q-.045-.272-.073-.559q-.03-.288-.03-.559q0-.252.03-.53q.028-.278.73-.626l-1.672-1.25q-.275-.213-.338-.555t.113-.648l1.06-1.8q.177-.287.504-.406t.644.021l1.896.804q.448-.373.97-.673q.52-.3 1.013-.464l.283-2.092q.061-.342.318-.571T10.96 3h2.08q.349 0 .605.229q.257.229.319.571l.263 2.112q.575.202 1.016.463t.909.654l1.992-.804q.318-.14.645-.021t.503.406l1.06 1.819q.177.306.104.641q-.073.336-.348.544l-1.216.911q-.176.135-.362.133t-.346-.173t-.148-.38t.183-.347l1.225-.908l-.994-1.7l-2.552 1.07q-.454-.499-1.193-.935q-.74-.435-1.4-.577L13 4h-1.994l-.312 2.689q-.756.161-1.39.52q-.633.358-1.26.985L5.55 7.15l-.994 1.7l2.169 1.62q-.125.336-.175.73t-.05.82q0 .38.05.755t.156.73l-2.15 1.645l.994 1.7l2.475-1.05q.6.606 1.363.999t1.612.588m.973-7.887q-1.046 0-1.773.724T9.473 12q0 .467.16.89t.479.777q.16.183.366.206q.207.023.384-.136q.177-.154.181-.355t-.154-.347q-.208-.2-.312-.47T10.473 12q0-.625.438-1.063t1.062-.437q.289 0 .565.116q.276.117.476.324q.146.148.338.134q.192-.015.346-.191q.154-.177.134-.381t-.198-.364q-.311-.3-.753-.469t-.908-.169m5.643 8.962q-.625 0-1.197.191q-.571.191-1.057.56q-.287.22-.44.445t-.153.456q0 .136.106.242t.242.105h5.097q.105 0 .177-.095q.07-.097.07-.252q0-.231-.152-.456q-.153-.225-.44-.444q-.486-.37-1.057-.561t-1.196-.191m0-.846q.528 0 .899-.37q.37-.371.37-.9t-.37-.899t-.9-.37q-.528 0-.899.37q-.37.37-.37.9q0 .528.37.898t.9.37" />
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

            <!-- Main Content -->
            <div class="p-4 sm:p-6">
                <!-- Header Section -->
                <div class="mb-6">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div class="flex-1">
                            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div class="flex-1">
                                    <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        Inmates Management
                                        <span class="inline-flex items-center gap-1 align-middle text-xs font-medium px-2 py-0.5 bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-100 rounded-md">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" viewBox="0 0 24 24" aria-hidden="true">
                                                <g fill="none" fill-rule="evenodd">
                                                  <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                                                  <path fill="currentColor" d="M7 9.5a7.5 7.5 0 1 1 2.942 5.957l-1.788 1.787L9.58 18.67a1 1 0 1 1-1.414 1.414L6.74 18.659l-2.12 2.12a1 1 0 0 1-1.414-1.415l2.12-2.12l-1.403-1.403a1 1 0 1 1 1.414-1.414L6.74 15.83l1.79-1.79A7.47 7.47 0 0 1 7 9.5M14.5 4a5.5 5.5 0 1 0 0 11a5.5 5.5 0 0 0 0-11" />
                                                </g>
                                            </svg>
                                            <span>Female</span>
                                        </span>
                                    </h1>
                                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage female inmates, cells, and assignments</p>
                                </div>
                            </div>
                        </div>
                                <!-- Mobile: Toggle above title, Desktop: Toggle inline with title -->
                                <div class="flex justify-start mb-3 sm:mb-0 sm:mr-4">
                                    <div class="inline-flex items-center cursor-pointer" data-gender-toggle>
                                        <label class="inline-flex items-center cursor-pointer">
                                            <input type="checkbox" class="sr-only peer" data-gender-toggle-input checked />
                                            <div class="inline-block align-middle relative w-11 h-6 
                                                bg-sky-500 
                                                peer-focus:outline-none 
                                                peer-focus:ring-4 
                                                peer-focus:ring-pink-300 
                                                dark:peer-focus:ring-pink-800 
                                                dark:bg-sky-700 
                                                rounded-full 
                                                peer-checked:bg-pink-700 
                                                dark:peer-checked:bg-pink-700
                                                peer-checked:after:translate-x-full 
                                                rtl:peer-checked:after:-translate-x-full 
                                                peer-checked:after:border-white 
                                                after:content-[''] 
                                                after:absolute 
                                                after:top-[2px] 
                                                after:start-[2px] 
                                                after:bg-white 
                                                after:border-gray-300 
                                                after:border 
                                                after:rounded-full 
                                                after:h-5 
                                                after:w-5 
                                                after:transition-all 
                                                dark:border-gray-600"></div>
                                            <span class="ms-3 text-sm font-medium text-gray-700 dark:text-gray-200 px-2 py-0.5 rounded-md align-middle pointer-events-none" data-gender-toggle-label>Switch to Female</span>
                                        </label>
                                    </div>
                                </div>
                        <div class="flex flex-col sm:flex-row gap-2">
                            <button data-add-inmate class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 5v14m-7-7h14"/>
                                </svg>
                                Add Inmate
                            </button>
                            <button class="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M3 3v18h18M9 9l6 6m0-6l-6 6"/>
                                </svg>
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Statistics Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div class="dark:bg-gray-900 shadow border border-gray-200 dark:border-gray-800 p-4">
                        <div class="flex items-center">
                            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 dark:text-blue-400" viewBox="0 0 512 512">
	                            <path fill="currentColor" d="M185 25v14h142V25zm0 32v14h142V57zm2.512 32c-1.626 7.3-2.512 15-2.512 23c0 48.966 32.654 87 71 87s71-38.034 71-87c0-8-.886-15.7-2.512-23zm21.027 118.72c-22.123 6.853-39.915 18.596-54.614 33.583l-.422.44c30.324 4.354 58.944 6.987 86.484 7.907l-31.45-41.93zm94.92 0l-31.667 42.223c29.804-.46 58.58-3.033 87.186-7.697c-.304-.314-.6-.633-.906-.943c-14.7-14.987-32.49-26.73-54.613-33.584zm-67.437 6.645L256 241.002l19.977-26.637A76.8 76.8 0 0 1 256 217a76.8 76.8 0 0 1-19.977-2.635zm-106.914 60.05c-3.84 6.633-7.324 13.557-10.493 20.685l28.81 7.203c110.47 15.786 106.675 15.786 217.147 0l28.81-7.203c-3.15-7.085-6.61-13.97-10.423-20.565c-79.61 15.326-159.822 15.182-253.85-.12zm-22.905 54.69a326 326 0 0 0-1.533 5.303a363 363 0 0 0-4.926 19.975L135 363.195v-26.89l-28.795-7.2zm299.59 0l-28.795 7.2v26.37l34.857-10.048a360 360 0 0 0-4.53-18.22a326 326 0 0 0-1.532-5.302M153 339.46v27.95c73.738 14.2 132.264 14.196 206-.004V339.46c-96.875 13.752-109.125 13.752-206 0m265.188 48.806L377 400.14v27.055l44.227-11.056a529 529 0 0 0-3.04-27.874zM93.59 389.95a532 532 0 0 0-2.817 26.19L135 427.194v-26.89zM153 404.04v27.173c88.597 14.452 132.463 14.508 206 .205v-27.38c-72.118 13.164-133.882 13.164-206 0zm-64.152 48.726c-.356 14.784-.125 26.056.027 34.234H135v-22.695l-46.152-11.54zm334.304 0L377 464.306V487h46.125c.152-8.178.383-19.45.027-34.234M153 467.696V487h206v-18.94c-71.098 13.194-121.477 13.04-206-.365z" stroke-width="13" stroke="currentColor" />
                            </svg>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Inmates</p>
                                <p class="text-2xl font-bold text-gray-900 dark:text-gray-100" id="total-inmates">0</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dark:bg-gray-900 shadow border border-gray-200 dark:border-gray-800 p-4">
                        <div class="flex items-center">
                            <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="currentColor">
	                                <path fill="#00ff4b" fill-rule="evenodd" d="M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18m-.232-5.36l5-6l-1.536-1.28l-4.3 5.159l-2.225-2.226l-1.414 1.414l3 3l.774.774z" clip-rule="evenodd" stroke-width="0.3" stroke="#00ff4b" />
                                </svg>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                                <p class="text-2xl font-bold text-gray-900 dark:text-gray-100" id="active-inmates">0</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dark:bg-gray-900 shadow border border-gray-200 dark:border-gray-800 p-4">
                        <div class="flex items-center">
                            <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-600 dark:text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Released</p>
                                <p class="text-2xl font-bold text-gray-900 dark:text-gray-100" id="released-inmates">0</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dark:bg-gray-900 shadow border border-gray-200 dark:border-gray-800 p-4">
                        <div class="flex items-center">
                            <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600 dark:text-red-400" viewBox="0 0 48 48">
	                           <path fill="currentColor" fill-rule="evenodd" d="M16.807 4.295c-.483 1.12-1.141 2.777-1.565 4.428c-3.619.2-6.246.51-8.084.803c-2.861.456-4.8 2.77-5.076 5.527C1.805 17.82 1.5 22.1 1.5 27.5c0 5.401.305 9.68.582 12.447c.275 2.756 2.215 5.07 5.076 5.527c3.08.492 8.374 1.026 16.842 1.026s13.761-.534 16.842-1.026c2.861-.456 4.8-2.77 5.076-5.527c.277-2.768.582-7.046.582-12.447s-.305-9.68-.582-12.447c-.275-2.756-2.215-5.07-5.076-5.527c-1.838-.294-4.465-.602-8.083-.803c-.424-1.651-1.082-3.309-1.565-4.428c-.658-1.524-2.025-2.759-3.832-3.043A22 22 0 0 0 24 1c-1.358 0-2.494.116-3.361.252c-1.807.284-3.174 1.52-3.832 3.043M24 5c-1.13 0-2.058.096-2.74.204c-.288.045-.598.253-.78.677a32 32 0 0 0-1.023 2.674q2.1-.054 4.543-.055q2.443.001 4.544.055a32 32 0 0 0-1.022-2.674c-.183-.424-.493-.632-.782-.677A18 18 0 0 0 24 5m-2.3 32.36c-.94-.127-1.545-.933-1.58-1.882c-.033-.905-.07-2.225-.094-4.003a176 176 0 0 1-4.003-.094c-.949-.035-1.755-.64-1.882-1.58A17 17 0 0 1 14 27.5c0-.958.061-1.719.14-2.301c.127-.94.933-1.545 1.882-1.58c.905-.033 2.225-.07 4.003-.094c.024-1.778.061-3.098.094-4.003c.035-.949.64-1.755 1.58-1.882c.582-.079 1.343-.14 2.301-.14s1.719.061 2.301.14c.94.127 1.545.933 1.58 1.882c.033.905.07 2.225.094 4.003c1.778.024 3.098.061 4.003.094c.949.035 1.755.64 1.882 1.58c.079.582.14 1.343.14 2.301s-.061 1.719-.14 2.301c-.127.94-.933 1.545-1.882 1.58c-.905.033-2.225.07-4.003.094a176 176 0 0 1-.094 4.003c-.035.949-.64 1.755-1.58 1.882c-.582.079-1.343.14-2.301.14s-1.719-.061-2.301-.14Z" clip-rule="evenodd" stroke-width="0.5" stroke="currentColor" />
                            </svg>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Medical</p>
                                <p class="text-2xl font-bold text-gray-900 dark:text-gray-100" id="medical-inmates">0</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Cells Overview -->
                <div class="mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Cell Occupancy</h2>
                        <button id="view-all-cells-btn" class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer">
                            View All Cells
                        </button>
                    </div>
                    <div id="cells-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <!-- Cells will be dynamically populated here -->
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
                                <input id="inmates-search" type="text" placeholder="Search inmates by name, crime, or cell..." 
                                       class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <select id="inmates-status-filter" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Released">Released</option>
                                <option value="Transferred">Transferred</option>
                                <option value="Medical">Medical</option>
                            </select>
                            <div class="relative">
                                <select id="inmates-cell-filter" class="appearance-none pr-8 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">All Cells</option>
                                </select>
                                <svg xmlns="http://www.w3.org/2000/svg" class="pointer-events-none h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 10l5 5 5-5z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Desktop Table View -->
                <div class="hidden sm:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead class="dark:bg-gray-900 p-4 shadow border border-gray-200 dark:border-gray-800">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Inmate</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Crime & Sentence</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cell & Admission</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="inmates-table-body" class="dark:bg-gray-900 p-4 shadow border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                <!-- Empty state by default -->
                                <tr>
                                    <td colspan="5" class="px-4 py-12 text-center">
                                        <div class="flex flex-col items-center justify-center space-y-4 sm:space-y-6">
                                            <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                                    <circle cx="9" cy="7" r="4"/>
                                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                                                </svg>
                                            </div>
                                            <div class="text-center px-4 sm:px-0">
                                                <h3 class="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">No Inmates Added Yet</h3>
                                                <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">There are no inmates in the system yet. Use the "Add Inmate" button above to get started.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Mobile Cards View -->
                <div class="sm:hidden space-y-4" id="inmates-cards-mobile">
                    <!-- Empty state by default for mobile -->
                    <div class="text-center py-8 sm:py-12">
                        <div class="flex flex-col items-center justify-center space-y-4 sm:space-y-6 px-4 sm:px-0">
                            <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                            </div>
                            <div class="text-center">
                                <h3 class="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">No Inmates Added Yet</h3>
                                <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">There are no inmates in the system yet. Use the "Add Inmate" button above to get started.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pagination -->
                <div class="mt-6 flex items-center justify-between">
                    <div class="text-sm text-gray-700 dark:text-gray-300">
                        Showing <span class="font-medium">1</span> to <span class="font-medium">10</span> of <span class="font-medium">97</span> results
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                            Previous
                        </button>
                        <button class="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 cursor-pointer">
                            1
                        </button>
                        <button class="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                            2
                        </button>
                        <button class="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                            3
                        </button>
                        <button class="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    @vite('resources/js/dashboard/home.js')
    @vite('resources/js/profile/edit-profile-modal.js')
    @vite('resources/js/inmates/components/inmates-female.js')
    @vite('resources/js/dashboard/components/role-based.js')
</x-app-layout>


