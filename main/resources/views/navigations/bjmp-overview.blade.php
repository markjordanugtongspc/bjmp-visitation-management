<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>BJMP Overview - Bureau of Jail Management and Penology</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

    <!-- Favicon -->
    <link rel="icon" href="{{ asset('images/logo/bjmp_logo.png') }}" type="image/png">

    <!-- Styles / Scripts -->
    @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
        @vite(['resources/css/app.css', 'resources/js/app.js', 'resources/js/theme-manager.js'])
        @vite('resources/js/dashboard/components/bjmp-overview.js')
        <script>
            // Ensure system theme is used on first visit (no saved preference yet)
            (function() {
                try {
                    var KEY = 'bjmp-theme-preference';
                    if (!localStorage.getItem(KEY)) {
                        localStorage.setItem(KEY, 'system');
                    }
                } catch (e) {
                    // no-op
                }
            })();
        </script>
    @else
        <!-- Fallback minimal styles if Vite isn't built (dev safe) -->
        <style>body{font-family:'Instrument Sans',ui-sans-serif,system-ui,sans-serif}</style>
    @endif
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body class="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
    
    <!-- Header with Back Button -->
    <header class="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex items-center justify-between">
                <button onclick="window.location.href='/'" class="group flex items-center gap-3 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-x-1 cursor-pointer">
                    <i class="fas fa-arrow-left group-hover:-translate-x-1 transition-transform duration-300"></i>
                    <span class="font-semibold">Back to Homepage</span>
                </button>
                <div class="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <i class="fas fa-shield-alt text-blue-600 dark:text-blue-400"></i>
                    <span class="font-medium">Bureau of Jail Management and Penology</span>
                </div>
                <div class="ml-4 hidden md:block">
                    <x-theme-toggle />
                </div>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <div data-hero-section class="bg-blue-600 dark:bg-blue-800 text-white py-16 md:py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div data-animate data-delay="100" class="text-center space-y-4">
                <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                    <i class="fas fa-info-circle"></i>
                    <span>About BJMP</span>
                </div>
                <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                    Bureau of Jail Management <br class="hidden md:block">and Penology
                </h1>
                <p class="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
                    One of the five pillars of the Criminal Justice System in the Philippines
                </p>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div class="space-y-10 md:space-y-12">
            
            <!-- Overview Section -->
            <section data-animate data-delay="200" class="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 md:p-8 border border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-3 mb-6">
                    <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <i class="fas fa-book-open text-xl text-blue-600 dark:text-blue-400"></i>
                    </div>
                    <h4 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Overview</h4>
                </div>
                <div class="pl-0 md:pl-12">
                    <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                        As one of the five pillars of the Criminal Justice System, the BJMP was created to address growing concern of jail management and penology problem. Primarily, its clients are detainees accused before a court who are temporarily confined in such jails while undergoing investigation, waiting final judgement and those who are serving sentence promulgated by the court 3 years and below. As provided for under R.A. No. 6975, the Jail Bureau is mandated to take operational and administrative control over all city, district and municipal jails. The Bureau has four major areas of rehabilitation program, namely: Livelihood Projects, Educational and Vocational Training, Recreation and Sports, and Religious/ Spiritual Activities. These were continuously implemented to eliminate the offenders' pattern of criminal behavior and to reform them to become law-abiding and productive citizens. Although the workplace of the Jail Bureau is confined inside the portals of jail to safeguard inmates, nonetheless, the Bureau has an inherent function of informing the public of jail operations and other matters concerning the corrections pillar of the Philippines. Coincidentally, being a new and growing Bureau, BJMP aims to keep the public abreast of information regarding jail management and penology.
                    </p>
                </div>
            </section>

            <!-- Organizations and Key Positions Section -->
            <section data-animate data-delay="300" class="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 md:p-8 border border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-3 mb-6">
                    <div class="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <i class="fas fa-sitemap text-xl text-indigo-600 dark:text-indigo-400"></i>
                    </div>
                    <h4 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Organizations and Key Positions</h4>
                </div>
                <div class="pl-0 md:pl-12 space-y-6">
                    <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                        The Bureau of Jail Management and Penology, also referred to as the Jail Bureau, was created pursuant to Section 60 to 65, Chapter V, RA No. 6975, and initially consisting of uniformed officers and members of the Jail Management and Penology service as constituted under Presidential Decree No. 765. RA 9263 provides that the Bureau shall be headed by a Chief who is assisted by two (2) Deputy Chiefs, one (1) for Administration and another for Operations, and one (1) Chief of Directorial Staff, all of whom are appointed by the President upon the recommendation of the DILG Secretary from among the qualified officers with the rank of at least Senior Superintendent in the BJMP. The Chief of the BJMP carries the rank of Director and serves a tour of duty that must not exceed four (4) years, unless extended by the President in times of war and other national emergencies. Officers who have retired or are within six (6) months from their compulsory retirement age are not qualified to be appointed as Jail Director or designated as BJMP Chief.
                    </p>
                    <div class="h-px bg-gray-200 dark:bg-gray-700"></div>
                    <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                        The second officer in command of the BJMP is the Deputy Chief for Administration, the third officer in command is the Deputy Chief for Operations, and the fourth officer in command is The Chief of the Directorial Staff, all of whom carry the rank of Chief Superintendent. They are assisted by the Directors of the Directorates in the National Headquarters who carry the rank of at least Senior Superintendent.
                    </p>
                    <div class="h-px bg-gray-200 dark:bg-gray-700"></div>
                    <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                        The BJMP operates and maintains Regional Offices in each of the administrative regions of the country, headed by a Regional Director for Jail Management and Penology, with the rank of at least Senior Superintendent. The Regional Director is assisted by an Assistant Regional Director for Administration, Assistant Regional Director for Operations, and Regional Chief of Directorial Staff, who are all officers with the rank of at least Superintendent.
                    </p>
                </div>
            </section>

            <!-- Organizational Structure Section -->
            <div data-animate data-delay="400" class="space-y-5">
                <div class="flex items-center gap-3 mb-2">
                    <div class="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <i class="fas fa-network-wired text-xl text-indigo-600 dark:text-indigo-400"></i>
                    </div>
                    <h3 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Organizational Structure</h3>
                </div>
                
                <!-- Command Group Dropdown -->
                <div class="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
                    <button data-dropdown-toggle="command-group" class="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer">
                        <div class="flex items-center gap-4">
                            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <i class="fas fa-users-cog text-blue-600 dark:text-blue-400"></i>
                            </div>
                            <h4 class="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">Command Group</h4>
                        </div>
                        <i class="fas fa-chevron-down text-gray-600 dark:text-gray-400 transition-transform duration-300" id="command-group-icon"></i>
                    </button>
                    <div id="command-group" class="hidden px-6 pb-4 bg-gray-50 dark:bg-gray-900/50">
                        <ol class="space-y-3 text-gray-700 dark:text-gray-300">
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-bold text-sm">1</span>
                                <span class="pt-1">Chief, BJMP</span>
                            </li>
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-bold text-sm">2</span>
                                <span class="pt-1">Deputy Chief for Administration</span>
                            </li>
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-bold text-sm">3</span>
                                <span class="pt-1">Deputy Chief for Operation</span>
                            </li>
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-bold text-sm">4</span>
                                <span class="pt-1">Chief of Directorial Staff</span>
                            </li>
                        </ol>
                    </div>
                </div>

                <!-- Directorates Dropdown -->
                <div class="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
                    <button data-dropdown-toggle="directorates" class="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer">
                        <div class="flex items-center gap-4">
                            <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <i class="fas fa-building text-indigo-600 dark:text-indigo-400"></i>
                            </div>
                            <h4 class="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">Directorates</h4>
                        </div>
                        <i class="fas fa-chevron-down text-gray-600 dark:text-gray-400 transition-transform duration-300" id="directorates-icon"></i>
                    </button>
                    <div id="directorates" class="hidden px-6 pb-4 bg-gray-50 dark:bg-gray-900/50">
                        <ol class="grid md:grid-cols-2 gap-3 text-gray-700 dark:text-gray-300">
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full font-bold text-sm">1</span>
                                <span class="pt-1">Directorate for Personnel and Records Management</span>
                            </li>
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full font-bold text-sm">2</span>
                                <span class="pt-1">Directorate for Intelligence</span>
                            </li>
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full font-bold text-sm">3</span>
                                <span class="pt-1">Directorate for Operations</span>
                            </li>
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full font-bold text-sm">4</span>
                                <span class="pt-1">Directorate for Comptrollership</span>
                            </li>
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full font-bold text-sm">5</span>
                                <span class="pt-1">Directorate for Logistics</span>
                            </li>
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full font-bold text-sm">6</span>
                                <span class="pt-1">Directorate for Human Resource Development</span>
                            </li>
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full font-bold text-sm">7</span>
                                <span class="pt-1">Directorate for Welfare and Development</span>
                            </li>
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full font-bold text-sm">8</span>
                                <span class="pt-1">Directorate for Investigation and Prosecution</span>
                            </li>
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full font-bold text-sm">9</span>
                                <span class="pt-1">Directorate for Program Development</span>
                            </li>
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full font-bold text-sm">10</span>
                                <span class="pt-1">Directorate for Information Communications and Technology Management</span>
                            </li>
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full font-bold text-sm">11</span>
                                <span class="pt-1">Directorate for Health Service</span>
                            </li>
                        </ol>
                    </div>
                </div>

                <!-- Support Services Dropdown -->
                <div class="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
                    <button data-dropdown-toggle="support-services" class="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer">
                        <div class="flex items-center gap-4">
                            <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <i class="fas fa-hands-helping text-green-600 dark:text-green-400"></i>
                            </div>
                            <h4 class="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">Support Services</h4>
                        </div>
                        <i class="fas fa-chevron-down text-gray-600 dark:text-gray-400 transition-transform duration-300" id="support-services-icon"></i>
                    </button>
                    <div id="support-services" class="hidden px-6 pb-4 bg-gray-50 dark:bg-gray-900/50">
                        <ol class="grid md:grid-cols-2 gap-3 text-gray-700 dark:text-gray-300">
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-bold text-sm">1</span>
                                <span class="pt-1">Chaplaincy Service Office</span>
                            </li>
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-bold text-sm">2</span>
                                <span class="pt-1">Legislative Liaison Office</span>
                            </li>
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-bold text-sm">3</span>
                                <span class="pt-1">Finance Service Office</span>
                            </li>
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-bold text-sm">4</span>
                                <span class="pt-1">Headquarters Support Service Office</span>
                            </li>
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-bold text-sm">5</span>
                                <span class="pt-1">Legal Service Office</span>
                            </li>
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-bold text-sm">6</span>
                                <span class="pt-1">Community Relations Service Office</span>
                            </li>
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-bold text-sm">7</span>
                                <span class="pt-1">National Executive Senior Jail Officer (NESJO)</span>
                            </li>
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-bold text-sm">8</span>
                                <span class="pt-1">Supply Accountable Office</span>
                            </li>
                            <li class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                                <span class="shrink-0 w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-bold text-sm">9</span>
                                <span class="pt-1">Accounting Office</span>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>

            <!-- Jail Facilities Grid -->
            <div data-animate data-delay="500" class="grid md:grid-cols-2 gap-6">
                <!-- Regional Office Section -->
                <section class="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-start gap-4 mb-4">
                        <div class="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <i class="fas fa-map-marked-alt text-xl text-indigo-600 dark:text-indigo-400"></i>
                        </div>
                        <h4 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 pt-2">Regional Office</h4>
                    </div>
                    <p class="text-gray-700 dark:text-gray-300 leading-relaxed pl-0 md:pl-12">
                        The BJMP operates and maintains Regional Offices in each of the administrative regions of the country, headed by a Regional Director for Jail Management and Penology, with the rank of at least Senior Superintendent. The Regional Director is assisted by an Assistant Regional Director for Administration, Assistant Regional Director for Operations, and Regional Chief of Directorial Staff, who are all officers with the rank of at least Superintendent.
                    </p>
                </section>

                <!-- Jail Provincial Administrator's Office Section -->
                <section class="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-start gap-4 mb-4">
                        <div class="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <i class="fas fa-landmark text-xl text-yellow-600 dark:text-yellow-400"></i>
                        </div>
                        <h4 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 pt-2">Jail Provincial Administrator's Office</h4>
                    </div>
                    <p class="text-gray-700 dark:text-gray-300 leading-relaxed pl-0 md:pl-12">
                        In every province, the BJMP operates and maintains a Provincial Jail Administrator's Office headed by a Provincial Administrator, to oversee the implementation of jail services of all district, city and municipal jails within its territorial jurisdiction.
                    </p>
                </section>

                <!-- District Jail Section -->
                <section class="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-start gap-4 mb-4">
                        <div class="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                            <i class="fas fa-city text-xl text-cyan-600 dark:text-cyan-400"></i>
                        </div>
                        <h4 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 pt-2">District Jail</h4>
                    </div>
                    <p class="text-gray-700 dark:text-gray-300 leading-relaxed pl-0 md:pl-12">
                        Within large cities or a group of clustered municipalities, a District Jail headed by a District Warden may be established.
                    </p>
                </section>

                <!-- City and Municipal Jails Section -->
                <section class="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-start gap-4 mb-4">
                        <div class="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <i class="fas fa-building text-xl text-gray-600 dark:text-gray-400"></i>
                        </div>
                        <h4 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 pt-2">City and Municipal Jails</h4>
                    </div>
                    <p class="text-gray-700 dark:text-gray-300 leading-relaxed pl-0 md:pl-12">
                        The BJMP operates and maintains City and Municipal Jails, each headed by a City or Municipal Warden, as the case may be.
                    </p>
                </section>
            </div>

            <!-- Our Core Values and Competence Section -->
            <section data-core-values data-animate data-delay="600" class="bg-blue-600 dark:bg-blue-800 rounded-xl shadow-lg p-6 md:p-8 text-white">
                <div class="flex items-center gap-4 mb-8">
                    <div class="p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                        <i class="fas fa-award text-2xl text-white"></i>
                    </div>
                    <h4 class="text-2xl md:text-3xl font-bold">Our Core Values and Competence</h4>
                </div>
                
                <!-- PRO.T.E.C.S. Section -->
                <div class="mb-10">
                    <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                        <i class="fas fa-star"></i>
                        <span>Core Values</span>
                    </div>
                    <h5 class="text-xl md:text-2xl font-bold mb-6 text-blue-100">PRO.T.E.C.S.</h5>
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300 border border-white/20">
                            <div class="flex items-center gap-3 mb-2">
                                <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <span class="font-bold text-sm">P</span>
                                </div>
                                <p class="font-bold">Professionalism</p>
                            </div>
                        </div>
                        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300 border border-white/20">
                            <div class="flex items-center gap-3 mb-2">
                                <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <span class="font-bold text-sm">T</span>
                                </div>
                                <p class="font-bold">Teamwork</p>
                            </div>
                        </div>
                        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300 border border-white/20">
                            <div class="flex items-center gap-3 mb-2">
                                <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <span class="font-bold text-sm">E</span>
                                </div>
                                <p class="font-bold">Efficiency / Competence</p>
                            </div>
                        </div>
                        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300 border border-white/20">
                            <div class="flex items-center gap-3 mb-2">
                                <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <span class="font-bold text-sm">C</span>
                                </div>
                                <p class="font-bold">Commitment</p>
                            </div>
                        </div>
                        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300 border border-white/20">
                            <div class="flex items-center gap-3 mb-2">
                                <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <span class="font-bold text-sm">S</span>
                                </div>
                                <p class="font-bold">Self-Discipline</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Core Competence Section -->
                <div>
                    <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                        <i class="fas fa-lightbulb"></i>
                        <span>Competence</span>
                    </div>
                    <h5 class="text-xl md:text-2xl font-bold mb-6 text-blue-100">Core Competence</h5>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div class="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300 border border-white/20">
                            <div class="shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1">
                                <i class="fas fa-check text-xs"></i>
                            </div>
                            <p>Continuous skills enhancement of personnel</p>
                        </div>
                        <div class="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300 border border-white/20">
                            <div class="shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1">
                                <i class="fas fa-check text-xs"></i>
                            </div>
                            <p>Ability to establish linkages and Partnerships</p>
                        </div>
                        <div class="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300 border border-white/20">
                            <div class="shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1">
                                <i class="fas fa-check text-xs"></i>
                            </div>
                            <p>Responsive Planning</p>
                        </div>
                        <div class="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300 border border-white/20">
                            <div class="shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1">
                                <i class="fas fa-check text-xs"></i>
                            </div>
                            <p>Timely decision-making</p>
                        </div>
                        <div class="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300 border border-white/20 md:col-span-2">
                            <div class="shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1">
                                <i class="fas fa-check text-xs"></i>
                            </div>
                            <p>Expedient implementation</p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex flex-col md:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                    <i class="fas fa-shield-alt text-xl text-blue-600 dark:text-blue-400"></i>
                    <div>
                        <p class="font-bold text-gray-900 dark:text-gray-100">Bureau of Jail Management and Penology</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Serving with integrity and professionalism</p>
                    </div>
                </div>
                <div class="text-center md:text-right">
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        © {{ date('Y') }} BJMP. All rights reserved.
                    </p>
                    <button data-scroll-to-top class="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium inline-flex items-center gap-2 cursor-pointer">
                        <i class="fas fa-arrow-up"></i>
                        Back to Top
                    </button>
                </div>
            </div>
        </div>
    </footer>

    @if (!(file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot'))))
        <!-- Fallback scripts if Vite build is unavailable -->
        <script src="{{ asset('js/theme-manager.js') }}"></script>
        <script src="{{ asset('js/dashboard/components/bjmp-overview.js') }}"></script>
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                if (typeof ThemeManager !== 'undefined') {
                    try {
                        var KEY = 'bjmp-theme-preference';
                        if (!localStorage.getItem(KEY)) localStorage.setItem(KEY, 'system');
                    } catch (e) {}
                }
            });
        </script>
    @endif
</body>
</html>
