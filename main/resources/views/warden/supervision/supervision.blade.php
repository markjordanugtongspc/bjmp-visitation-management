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
    <div class="flex-1 min-h-screen bg-gray-50 dark:bg-gray-950" 
         data-upload-url="{{ route('warden.supervision.upload') }}"
         data-list-url="{{ route('warden.supervision.index') }}"
         data-preview-url="{{ route('warden.supervision.preview', ':id') }}"
         data-csrf-token="{{ csrf_token() }}">
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
                          data-user-role="{{ Auth::user()->title ?? 'Warden' }}"
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
                              {{ Auth::user()->title ?? 'Warden' }}
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

            <!-- Super Vision content (Flowbite components) -->
            <div class="p-4 sm:p-6">
                <!-- Topbar: Breadcrumb + Actions -->
                <nav class="flex items-start sm:items-center justify-between mb-4 sm:mb-6 flex-col sm:flex-row gap-3" aria-label="Breadcrumb">
                    <ol class="inline-flex items-center whitespace-nowrap">
                        <li class="inline-flex items-center">
                            <a href="{{ route('dashboard') }}" class="inline-flex items-center text-xs sm:text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 cursor-pointer">
                                <svg class="w-3.5 h-3.5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 1.293a1 1 0 00-1.414 0l-9 9A1 1 0 001 12h2v6a1 1 0 001 1h4a1 1 0 001-1v-4h2v4a1 1 0 001 1h4a1 1 0 001-1v-6h2a1 1 0 00.707-1.707l-9-9z"/></svg>
                                Dashboard
                            </a>
                        </li>
                        <li class="inline-flex items-center">
                            <svg class="w-3 h-3 mx-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            <span class="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-50">Super Vision Manuals</span>
                        </li>
                    </ol>

                    <div class="flex items-center gap-2">
                        <button type="button" class="hidden sm:inline-flex items-center gap-2 h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" data-drawer-target="filtersDrawer" data-drawer-show="filtersDrawer" aria-controls="filtersDrawer">
                            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2l-7 7v5l-4 2v-7L3 6V4z"/></svg>
                            Filters
                        </button>
                        <button type="button" data-modal-target="createManualModal" data-modal-toggle="createManualModal" class="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5a.75.75 0 01.75.75V12h6.75a.75.75 0 010 1.5H12.75V20a.75.75 0 01-1.5 0v-6.5H4.5a.75.75 0 010-1.5h6.75V5.25A.75.75 0 0112 4.5z"/></svg>
                            Create Manual
                        </button>
                    </div>
                </nav>

                <!-- Tabs -->
                <div class="mb-4 border-b border-gray-200 dark:border-gray-800">
                    <ul class="flex flex-wrap -mb-px text-sm font-medium text-center" id="flowbiteTab" role="tablist">
                        <li class="mr-2" role="presentation">
                            <button class="inline-block p-2 sm:p-3 border-b-2 rounded-t-lg cursor-pointer text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400 focus:outline-none focus:text-blue-700 focus:border-blue-700" id="all-tab" data-tabs-target="#all" type="button" role="tab" aria-controls="all" aria-selected="true">All</button>
                        </li>
                        <li class="mr-2" role="presentation">
                            <button class="inline-block p-2 sm:p-3 border-b-2 border-transparent rounded-t-lg cursor-pointer text-gray-700 hover:text-blue-600 hover:border-blue-300 dark:text-gray-200 dark:hover:text-blue-400 dark:hover:border-blue-400 focus:outline-none focus:text-blue-700 focus:border-blue-700" id="ops-tab" data-tabs-target="#ops" type="button" role="tab" aria-controls="ops" aria-selected="false">Operations</button>
                        </li>
                        <li class="mr-2" role="presentation">
                            <button class="inline-block p-2 sm:p-3 border-b-2 border-transparent rounded-t-lg cursor-pointer text-gray-700 hover:text-blue-600 hover:border-blue-300 dark:text-gray-200 dark:hover:text-blue-400 dark:hover:border-blue-400 focus:outline-none focus:text-blue-700 focus:border-blue-700" id="safety-tab" data-tabs-target="#safety" type="button" role="tab" aria-controls="safety" aria-selected="false">Safety</button>
                        </li>
                        <li role="presentation">
                            <button class="inline-block p-2 sm:p-3 border-b-2 border-transparent rounded-t-lg cursor-pointer text-gray-700 hover:text-blue-600 hover:border-blue-300 dark:text-gray-200 dark:hover:text-blue-400 dark:hover:border-blue-400 focus:outline-none focus:text-blue-700 focus:border-blue-700" id="medical-tab" data-tabs-target="#medical" type="button" role="tab" aria-controls="medical" aria-selected="false">Medical</button>
                        </li>
                    </ul>
                </div>

                <!-- Manuals grid -->
                <div id="all" role="tabpanel" aria-labelledby="all-tab">
                    <!-- Supervision Cards Carousel Container -->
                    <div id="supervision-cards-container" class="mb-6"></div>
                </div>

                <!-- Upload Guidelines Section -->
                <div class="mt-2 sm:mt-8 flex flex-col gap-8">
                    <div class="w-full flex flex-col lg:flex-row gap-6">
                        <!-- Uploader Form Card (Left Side) -->
                        <div class="flex-1 flex items-stretch justify-center">
                            <div class="w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 flex flex-col min-h-[420px] h-full transition-all duration-300">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Upload Manual</h3>
                                <form id="supervision-form" class="space-y-4 flex-1 flex flex-col" enctype="multipart/form-data">
                                    <div>
                                        <label for="guideline-title" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Title</label>
                                        <input id="guideline-title" name="title" type="text" required class="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="e.g. Cell Inspection SOP">
                                    </div>
                                    <div>
                                        <label for="guideline-category" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Category</label>
                                        <div class="relative">
                                            <select id="guideline-category" name="category" required class="block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                                                <option value="" disabled selected>Select a category</option>
                                            </select>
                                            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                                                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label for="guideline-summary" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Summary</label>
                                        <textarea id="guideline-summary" name="summary" rows="3" required class="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="Brief summary (minimum 50 characters)..."></textarea>
                                    </div>
                                    <div>
                                        <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200" for="file_input">Upload file</label>
                                        <input class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" aria-describedby="file_input_help" id="file_input" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required>
                                        <p class="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">PDF, DOC, or DOCX only (MAX. 10MB).</p>
                                </div>
                                    <div class="mt-auto flex items-center justify-end gap-2 pt-2">
                                        <button
                                            type="reset"
                                            class="inline-flex items-center cursor-pointer text-red-600 bg-red-50 hover:text-white hover:bg-red-500 focus:ring-4 focus:outline-none focus:ring-red-300 rounded-lg border border-red-200 text-sm font-medium px-5 py-2.5 focus:z-10 transition-colors dark:bg-red-900/60 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-700 dark:hover:text-white dark:focus:ring-red-800"
                                        >Clear</button>
                                        <button type="submit" class="cursor-pointer inline-flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5a.75.75 0 01.75.75V12h6.75a.75.75 0 010 1.5H12.75V20a.75.75 0 01-1.5 0v-6.5H4.5a.75.75 0 010-1.5h6.75V5.25A.75.75 0 0112 4.5z"/></svg>
                                            Upload Manual
                                    </button>
                                </div>
                                </form>
                            </div>
                        </div>
                        <!-- File Preview Card (Right Side) -->
                        <div class="flex-1 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 flex flex-col min-h-[420px]">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">File Preview</h3>
                                <div id="preview-status" class="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                    No file selected
                                </div>
                            </div>
                            
                            <div class="flex-1 flex flex-col">
                                <!-- Dynamic File Header -->
                                <div id="file-header" class="hidden mb-4">
                                    <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <!-- Dynamic File Icon with Category -->
                                        <div id="file-icon" class="h-12 w-12 flex items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/20">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                           <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.828A2 2 0 0 0 19.414 7.414l-4.828-4.828A2 2 0 0 0 12.172 2H6zm6 1.414L18.586 10H14a2 2 0 0 1-2-2V3.414z"/>
                                         </svg>
                                       </div>
                                   
                                        <!-- Dynamic File Info -->
                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-center gap-2">
                                                <p id="file-name" class="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    No file selected
                                                </p>
                                                <!-- Category Badge (moved here) -->
                                                <span id="category-badge" class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                                    No category
                                                </span>
                                            </div>
                                            <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                <span id="file-type">-</span>
                                                <span>•</span>
                                                <span id="file-size">-</span>
                                                <span>•</span>
                                                <span id="file-date">-</span>
                                            </div>
                                       </div>
                                   
                                        <!-- Remove Button -->
                                        <button id="remove-file-btn" class="hidden cursor-pointer items-center px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 text-xs font-medium transition">
                                         Remove
                                       </button>
                                    </div>
                                </div>
                                   
                                <!-- Dynamic File Preview Area -->
                                <div class="flex-1 flex flex-col">
                                    <!-- Empty State -->
                                    <div id="empty-preview" class="flex-1 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50/50 via-white to-gray-100/50 dark:from-gray-900/50 dark:via-gray-800/50 dark:to-gray-900/50">
                                        <div class="text-center p-8">
                                            <svg class="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                           </svg>
                                            <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Upload a file to see preview</p>
                                            <p class="text-xs text-gray-400 dark:text-gray-500">Supports PDF, DOC, DOCX files</p>
                                         </div>
                                       </div>
                                    
                                    <!-- File Preview Iframe -->
                                    <div id="file-preview-container" class="hidden">
                                        <iframe id="file-preview-iframe" class="w-full h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[28rem] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm" src="" frameborder="0"></iframe>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Tips Accordion: now always below the two cards, full width -->
                    <div id="tips" class="w-full">
                        <div id="accordion-flush" data-accordion="collapse" data-active-classes="bg-white dark:bg-gray-900 text-gray-900 dark:text-white" data-inactive-classes="text-gray-500 dark:text-gray-400">
                            <h2 id="accordion-flush-heading-1">
                                <button type="button" class="flex items-center justify-between w-full py-3 px-3 sm:px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-800 cursor-pointer" data-accordion-target="#accordion-flush-body-1" aria-expanded="true" aria-controls="accordion-flush-body-1">
                                    Authoring Tips
                                    <svg data-accordion-icon class="w-4 h-4 rotate-180 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5"/></svg>
                                </button>
                            </h2>
                            <div id="accordion-flush-body-1" class="" aria-labelledby="accordion-flush-heading-1">
                                <div class="py-3 px-3 sm:px-4 border-b border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400">
                                    <ul class="list-disc pl-5 space-y-1">
                                        <li>Use clear, action-oriented titles (e.g., “Cell Inspection SOP”).</li>
                                        <li>Keep summaries brief: what, when, who, and how.</li>
                                        <li>Prefer PDF uploads for consistent formatting across devices.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

    <!-- Guidelines Modal -->
    <div id="createManualModal" tabindex="-1" aria-hidden="true" class="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full" style="backdrop-filter: blur(4px);">
        <div class="relative w-full max-w-2xl max-h-full">
            <!-- Modal content -->
            <div class="relative bg-brand-background-light rounded-lg shadow dark:bg-brand-background-dark">
                <!-- Modal header -->
                <div class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-700">
                    <h3 class="text-xl font-semibold text-brand-text-light dark:text-brand-text-dark">Guidelines</h3>
                    <button type="button" class="cursor-pointer text-gray-400 bg-transparent hover:bg-brand-secondary-light hover:text-brand-text-light rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-brand-secondary-dark dark:hover:text-brand-text-dark" data-modal-hide="createManualModal" id="closeManualModalBtn">
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                </div>
                <!-- Modal body -->
                <div class="p-6 space-y-4">
                    <p class="text-gray-600 dark:text-gray-300">
                        Upload and manage supervision guidelines and manuals for your facility. These documents help standardize operations and ensure consistent procedures.
                    </p>
                    <div class="bg-brand-primary-light/10 dark:bg-brand-primary-dark/20 rounded-lg p-4 border border-brand-primary-light/20 dark:border-brand-primary-dark/30">
                        <h4 class="text-sm font-medium text-brand-primary-light dark:text-brand-primary-dark mb-2">Benefits of Standardized Manuals</h4>
                        <ul class="list-disc pl-5 text-sm text-brand-primary-light/80 dark:text-brand-primary-dark/80 space-y-1">
                            <li>Ensures consistent operations across shifts</li>
                            <li>Simplifies training for new officers</li>
                            <li>Provides clear guidance during emergencies</li>
                            <li>Helps maintain compliance with regulations</li>
                        </ul>
                        </div>
                </div>
                <!-- Modal footer -->
                <div class="flex items-center justify-end p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-700">
                    <button data-modal-hide="createManualModal" type="button" id="cancelManualModalBtn" class="cursor-pointer text-brand-text-light bg-brand-background-light hover:bg-brand-secondary-light focus:ring-4 focus:outline-none focus:ring-brand-button-primary-light rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-brand-text-light focus:z-10 dark:bg-brand-background-dark dark:text-brand-text-dark dark:border-gray-600 dark:hover:text-brand-text-dark dark:hover:bg-brand-secondary-dark dark:focus:ring-brand-button-primary-dark">Close</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Add refresh button -->
    <button type="button" data-action="refresh-supervision" class="fixed bottom-6 right-6 z-10 inline-flex items-center justify-center p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
            <path d="M16 21h5v-5"></path>
        </svg>
        <span class="sr-only">Refresh</span>
    </button>

    @vite('resources/js/dashboard/home.js')
    @vite('resources/js/profile/edit-profile-modal.js')
    @vite('resources/js/modules/flowbite.js')
    @vite('resources/js/supervision/supervision.js')
    @vite('resources/js/dashboard/components/role-based.js')
</x-app-layout>