<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Visitation Form</title>
    <!-- Favicon -->
    <link rel="icon" href="{{ asset('images/logo/bjmp_logo.png') }}" type="image/png">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    
    <!-- Styles / Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js']) <!-- Kani gamiton aron ma import ang tailwind css nga naka built in -->
</head>
<body class="dark bg-white dark:bg-slate-900 text-[#1b1b18] min-h-screen"> <!-- Default Bacground - Dark Mode -->
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 font-['Poppins',_sans-serif]">
        <!-- Home Button and Dark Mode Toggle -->
        <div class="mb-6 flex justify-between items-center">
            <a href="{{ url('/') }}" class="inline-flex items-center gap-2 rounded-lg border border-black/5 dark:border-white/10 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                    <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v4.5a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198c.03-.028.061-.056.091-.086L12 5.43z" />
                </svg>
                Back to Home
            </a>
            
            <!-- Theme Toggle Button -->
            <button data-theme-toggle class="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 h-9 w-9 text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Toggle theme">
                <svg data-theme-icon="light" class="w-4 h-4 hidden" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg data-theme-icon="dark" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>

        <!-- Header / Announcement -->
        <section class="rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-gray-900 p-6 shadow-md">
            <div class="flex items-start gap-4">
                <div class="mt-1 rounded-lg bg-blue-600/10 p-2 text-blue-600 dark:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 48 48"><g fill="none" stroke-width="3"><path fill="#8fbffa" d="M5.382 38.052c.303.525.691 1.088 1.057 1.585c.672.914 1.83 1.29 2.932 1.016c4.709-1.177 18.047-4.672 29.123-8.46c0 0-1.342-3.606-5.281-10.211c-3.94-6.605-6.196-9.67-6.196-9.67C18.2 20.011 8.498 29.808 5.125 33.299c-.79.816-1.042 2.008-.587 3.047c.248.565.541 1.183.844 1.707Z"/><path fill="#fff" d="M31.555 34.448a258 258 0 0 0 6.938-2.255s-1.342-3.606-5.28-10.211c-3.94-6.605-6.197-9.67-6.197-9.67a261 261 0 0 0-5.497 4.95c.302.218.578.47.816.762c.896 1.1 2.593 3.384 4.913 7.401c2.892 5.01 3.934 7.833 4.22 8.704q.052.158.087.32Z"/><path stroke="#2859c5" stroke-linecap="round" stroke-linejoin="round" d="M42.5 19h-3m-31 0h3m14-17v3M13.479 6.98l2.12 2.122M37.52 6.98l-2.122 2.122m-8.587 3.325c-8.819 7.698-18.314 17.38-21.687 20.87c-.79.817-1.042 2.008-.587 3.048c.248.565.541 1.182.844 1.707s.691 1.087 1.057 1.584c.672.915 1.83 1.291 2.932 1.016c4.709-1.177 17.842-4.558 28.918-8.346M26.046 11.099s2.397 2.621 7.166 10.882s5.841 11.647 5.841 11.647"/><path stroke="#2859c5" stroke-linecap="round" stroke-linejoin="round" d="M21.612 17.193s2.091 2.092 5.636 8.232s4.311 8.997 4.311 8.997m-8.863 2.935l.594 2.218a4.59 4.59 0 1 1-8.87 2.376l-.494-1.848"/></g></svg>
                </div>
                <div class="flex-1">
                    <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-50">Announcement</h2>
                    <p class="mt-1 text-sm text-gray-700 dark:text-gray-300">“Please ensure all visitor details are accurate. Bring a valid ID during your visitation schedule.”</p>
                </div>
            </div>
        </section>

        @php
            $today = now();
            $month = $today->format('F');
            $year = $today->format('Y');
            $start = $today->copy()->startOfMonth();
            $end = $today->copy()->endOfMonth();
            $startWeekday = (int) $start->dayOfWeek; // 0 Sun - 6 Sat
            $daysInMonth = (int) $today->daysInMonth;
            $weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        @endphp

        <!-- Main Grid: Calendar + Actions -->
        <section class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Calendar -->
            <div class="lg:col-span-2 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-gray-900 p-6 shadow-md">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-50">{{ $month }} {{ $year }}</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Select an available date to proceed.</p>
                    </div>
                    <div class="flex items-center gap-2 text-gray-500">
                        <span class="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400"><span class="size-2 rounded-full bg-blue-500"></span> Today</span>
                        <span class="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400"><span class="size-2 rounded-full bg-emerald-500"></span> Open</span>
                        <span class="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400"><span class="size-2 rounded-full bg-rose-500"></span> Closed</span>
                    </div>
                </div>

                <div class="mt-4 grid grid-cols-7 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                    @foreach ($weekdays as $w)
                        <div class="py-2">{{ $w }}</div>
                    @endforeach
                </div>

                <div class="grid grid-cols-7 gap-2">
                    @for ($i = 0; $i < $startWeekday; $i++)
                        <div class="aspect-square rounded-lg bg-transparent"></div>
                    @endfor

                    @for ($d = 1; $d <= $daysInMonth; $d++)
                        @php
                            $isToday = $d === (int) $today->day;
                            // Tuesday to Sunday are allowed (2,3,4,5,6,0)
                            $date = $today->copy()->day($d);
                            $dow = (int) $date->dayOfWeek; // 0 Sun ... 6 Sat
                            $isOpen = in_array($dow, [2,3,4,5,6,0]); // Tue-Sun
                            $dateString = $date->format('Y-m-d');
                        @endphp
                        <button type="button"
                           class="calendar-day aspect-square rounded-lg border border-black/5 dark:border-white/10 flex items-center justify-center text-sm transition-all duration-200 {{ $isOpen ? 'cursor-pointer hover:bg-blue-600/10 dark:hover:bg-blue-500/10' : 'cursor-not-allowed opacity-50' }}
                                  {{ $isToday ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100' }}
                                  {{ $isToday ? '' : 'hover:text-white' }}
                                  {{ $isToday ? '' : 'selected:text-gray-900' }}"
                           aria-label="Day {{ $d }}"
                           data-calendar-day="{{ $d }}"
                           data-calendar-month="{{ $today->month }}"
                           data-calendar-year="{{ $year }}"
                           data-is-open="{{ $isOpen ? 'true' : 'false' }}"
                           data-date="{{ $dateString }}"
>                        
                           <span class="relative transform transition-transform duration-200 ease-out {{ $isOpen ? 'hover:scale-105' : '' }}">
                            {{ $d }}
                            @if ($isOpen)
                              <span class="absolute -right-2 -top-2 size-1.5 rounded-full bg-emerald-500"></span>
                            @else
                              <span class="absolute -right-2 -top-2 size-1.5 rounded-full bg-rose-500"></span>
                            @endif
                          </span>
                        </button>
                    @endfor
                </div>
            </div>

            <!-- Actions / Info -->
            <div class="space-y-6">
                <div class="rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-gray-900 p-6 shadow-md">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-50">Start a Request</h3>
                    <p class="mt-1 text-sm text-gray-700 dark:text-gray-300">Choose how you want to submit your visitation request.</p>
                    <!-- Buttons: Automatic full-width on mobile; others adaptive -->
                    <div class="mt-4 space-y-3">
                        <!-- Prominent Automatic Request (single straight line on mobile) -->
                        <button type="button" id="btn-auto" class="w-full inline-flex items-center justify-center rounded-lg px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                            Automatic Request
                        </button>
                        <!-- Other actions -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button type="button" id="btn-manual" class="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-white bg-gray-800 hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer">
                                Manual Request
                            </button>
                            <button type="button" id="btn-conjugal" class="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-white bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 hover:from-rose-500 hover:via-pink-500 hover:to-fuchsia-500 active:from-rose-700 active:via-pink-700 active:to-fuchsia-700 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer">
                                Conjugal Visit
                            </button>
                        </div>
                    </div>
                </div>

                <div class="rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-gray-900 p-6 shadow-md">
                    <h4 class="text-base font-semibold text-gray-900 dark:text-gray-50">Visitation Information</h4>
                    <ul class="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300 list-disc ms-5">
                        <li>Available visiting days: <strong>Tuesday to Sunday</strong>.</li>
                        <li>Available visiting hours: <strong>9:00 AM - 12:00 PM</strong> and <strong>2:00 PM - 5:00 PM</strong>.</li>
                        <li>Cut-off time for requests: 3:00 PM the day before.</li>
                        <li>Maximum visitors per schedule: 2 adults (children allowed with guardian).</li>
                        <li>Bring a valid government-issued ID and your request reference code.</li>
                        <li>Follow dress code and facility guidelines at all times.</li>
                    </ul>
                </div>
            </div>
        </section>

        <!-- Footer note -->
        <p class="mt-8 text-center text-xs text-gray-600 dark:text-gray-400">This page is a work in progress. We will iterate on features and design over time.</p>
    </div>
    @vite(['resources/js/visitation/request/visitmodal.js', 'resources/js/visitation/calendar-handler.js', 'resources/js/theme-manager.js']) <!-- Ingon ani pag tawag sa JS script gamit ng VITE -->
</body>
</html>