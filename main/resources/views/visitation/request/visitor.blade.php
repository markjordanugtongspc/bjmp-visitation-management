<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visitation Form</title>
    <!-- Favicon -->
    <link rel="icon" href="{{ asset('images/logo/logo-temp_round.png') }}" type="image/png">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    
    <!-- Styles / Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js']) <!-- Kani gamiton aron ma import ang tailwind css nga naka built in -->
</head>
<body class="dark bg-white dark:bg-slate-900 text-[#1b1b18] min-h-screen"> <!-- Default Bacground - Dark Mode -->
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 font-['Poppins',_sans-serif]">
        <!-- Home Button -->
        <div class="mb-6 flex justify-start">
            <a href="{{ url('/') }}" class="inline-flex items-center gap-2 rounded-lg border border-black/5 dark:border-white/10 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                    <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v4.5a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198c.03-.028.061-.056.091-.086L12 5.43z" />
                </svg>
                Back to Home
            </a>
        </div>

        <!-- Header / Announcement -->
        <section class="rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-gray-900 p-6 shadow-md">
            <div class="flex items-start gap-4">
                <div class="mt-1 rounded-lg bg-blue-600/10 p-2 text-blue-600 dark:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 24 24" fill="currentColor"><path d="M7.17 6.17A3 3 0 0 1 9.3 5h5.4A3 3 0 0 1 17 8v8a3 3 0 0 1-3 3H7.5a3 3 0 0 1-3-3V9.7a3 3 0 0 1 .88-2.12l1.79-1.79Z"/><path d="M11 7h2v6h-2z"/></svg>
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
                            // Example availability: Mon/Wed/Fri open, others closed
                            $date = $today->copy()->day($d);
                            $dow = (int) $date->dayOfWeek; // 0 Sun ... 6 Sat
                            $isOpen = in_array($dow, [1,3,5]);
                        @endphp
                        <button type="button"
                                class="aspect-square rounded-lg border border-black/5 dark:border-white/10 flex items-center justify-center text-sm transition-colors
                                       {{ $isToday ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-blue-600/10 dark:hover:bg-blue-500/10' }}"
                                aria-label="Day {{ $d }}">
                            <span class="relative">
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
                    <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button type="button" id="btn-manual" class="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">Manual Request</button>
                        <button type="button" id="btn-auto" class="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">Automatic Request</button>
                    </div>
                </div>

                <div class="rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-gray-900 p-6 shadow-md">
                    <h4 class="text-base font-semibold text-gray-900 dark:text-gray-50">Visitation Information</h4>
                    <ul class="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300 list-disc ms-5">
                        <li>Available visiting days: Monday, Wednesday, Friday.</li>
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
    @vite('resources/js/visitation/request/visitmodal.js') <!-- Ingon ani pag tawag sa JS script gamit ng VITE -->
</body>
</html>