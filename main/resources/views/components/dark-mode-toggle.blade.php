{{-- Dark Mode Toggle Component --}}
{{-- Usage: <x-dark-mode-toggle /> or <x-dark-mode-toggle variant="button" /> --}}

@props([
    'variant' => 'toggle', // 'toggle', 'button', 'dropdown', 'mobile-dropdown'
    'size' => 'md', // 'sm', 'md', 'lg'
    'showLabel' => true,
    'label' => 'Theme',
    'class' => ''
])

@php
    $sizeClasses = [
        'sm' => 'h-8 w-14 text-xs',
        'md' => 'h-9 w-16 text-sm', 
        'lg' => 'h-10 w-18 text-base'
    ];
    
    $iconSizes = [
        'sm' => 'h-3 w-3',
        'md' => 'h-4 w-4',
        'lg' => 'h-5 w-5'
    ];
    
    $sizeClass = $sizeClasses[$size] ?? $sizeClasses['md'];
    $iconSize = $iconSizes[$size] ?? $iconSizes['md'];
@endphp

@if($variant === 'toggle')
    {{-- Toggle Switch Variant --}}
    <div class="inline-flex items-center gap-2 {{ $class }}">
        @if($showLabel)
            <span class="text-sm font-medium text-gray-700 dark:text-gray-200" data-theme-indicator>
                Light
            </span>
        @endif
        
        <button 
            data-theme-toggle
            class="relative inline-flex items-center {{ $sizeClass }} rounded-full 
                   bg-gray-200 dark:bg-gray-700 
                   transition-colors duration-200 ease-in-out 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                   dark:focus:ring-offset-gray-800
                   hover:bg-gray-300 dark:hover:bg-gray-600
                   cursor-pointer"
            aria-label="Toggle dark mode"
            role="switch"
            aria-pressed="false"
        >
            <span class="sr-only">Toggle dark mode</span>
            
            {{-- Toggle Circle --}}
            <span class="inline-block {{ $size === 'sm' ? 'h-6 w-6' : ($size === 'lg' ? 'h-8 w-8' : 'h-7 w-7') }} 
                        transform rounded-full bg-white shadow-lg 
                        transition-transform duration-200 ease-in-out
                        translate-x-0.5 dark:translate-x-8">
                {{-- Sun Icon (Light Mode) --}}
                <svg class="{{ $iconSize }} text-yellow-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                             transition-opacity duration-200 dark:opacity-0" 
                     fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect width="24" height="24" fill="none"/>
                    <path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5s5-2.24 5-5s-2.24-5-5-5m-1-6v4h2V1zm0 18v4h2v-4zm12-8h-4v2h4zM5 11H1v2h4zm11.24 6.66l2.47 2.47l1.41-1.41l-2.47-2.47zM3.87 5.28l2.47 2.47l1.41-1.41l-2.47-2.47zm2.47 10.96l-2.47 2.47l1.41 1.41l2.47-2.47zM18.72 3.87l-2.47 2.47l1.41 1.41l2.47-2.47z" stroke-width="0.3" stroke="currentColor"/>
                </svg>
                
                {{-- Moon Icon (Dark Mode) --}}
                <svg class="{{ $iconSize }} text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                             transition-opacity duration-200 opacity-0 dark:opacity-100" 
                     fill="currentColor" viewBox="0 0 25 24" xmlns="http://www.w3.org/2000/svg">
                    <rect width="25" height="24" fill="none"/>
                    <path fill="currentColor" d="m16.07 3.344l-1.428.781l1.428.781l.781 1.428l.781-1.428l1.428-.781l-1.428-.781l-.78-1.428zM2.226 12c0-5.523 4.477-10 10-10h1.734l-.868 1.5c-.579 1-.866 2.189-.866 3.5a7 7 0 0 0 8.348 6.87l1.682-.327l-.543 1.626A10 10 0 0 1 12.227 22c-5.523 0-10-4.477-10-10m18.5-5.584l.914 1.67L23.31 9l-1.67.914l-.914 1.67l-.913-1.67L18.143 9l1.67-.914z" stroke-width="0.3" stroke="currentColor"/>
                </svg>
            </span>
        </button>
    </div>

@elseif($variant === 'button')
    {{-- Button Variant - No Background Container --}}
    <button 
        data-theme-toggle
        class="inline-flex items-center justify-center {{ $sizeClass }} rounded-lg 
               hover:bg-gray-100 dark:hover:bg-gray-800 
               transition-colors duration-200 ease-in-out
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
               dark:focus:ring-offset-gray-800
               cursor-pointer {{ $class }}"
        aria-label="Toggle theme"
    >
        {{-- Sun Icon (Light Mode) - Light Yellow --}}
        <svg class="{{ $iconSize }} text-yellow-500 dark:hidden" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" fill="none"/>
            <path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5s5-2.24 5-5s-2.24-5-5-5m-1-6v4h2V1zm0 18v4h2v-4zm12-8h-4v2h4zM5 11H1v2h4zm11.24 6.66l2.47 2.47l1.41-1.41l-2.47-2.47zM3.87 5.28l2.47 2.47l1.41-1.41l-2.47-2.47zm2.47 10.96l-2.47 2.47l1.41 1.41l2.47-2.47zM18.72 3.87l-2.47 2.47l1.41 1.41l2.47-2.47z" stroke-width="0.3" stroke="currentColor"/>
        </svg>
        
        {{-- Moon Icon (Dark Mode) - Light Dark Blue --}}
        <svg class="{{ $iconSize }} text-blue-400 hidden dark:block" fill="currentColor" viewBox="0 0 25 24" xmlns="http://www.w3.org/2000/svg">
            <rect width="25" height="24" fill="none"/>
            <path fill="currentColor" d="m16.07 3.344l-1.428.781l1.428.781l.781 1.428l.781-1.428l1.428-.781l-1.428-.781l-.78-1.428zM2.226 12c0-5.523 4.477-10 10-10h1.734l-.868 1.5c-.579 1-.866 2.189-.866 3.5a7 7 0 0 0 8.348 6.87l1.682-.327l-.543 1.626A10 10 0 0 1 12.227 22c-5.523 0-10-4.477-10-10m18.5-5.584l.914 1.67L23.31 9l-1.67.914l-.914 1.67l-.913-1.67L18.143 9l1.67-.914z" stroke-width="0.3" stroke="currentColor"/>
        </svg>
        
        @if($showLabel)
            <span class="text-sm font-medium" data-theme-indicator>Light</span>
        @endif
    </button>

@elseif($variant === 'dropdown')
    {{-- Dropdown Variant --}}
    <div class="relative {{ $class }}">
        <button 
            data-theme-dropdown-toggle
            class="inline-flex items-center gap-2 px-3 py-2 rounded-lg 
                   bg-gray-100 dark:bg-gray-800 
                   text-gray-700 dark:text-gray-200 
                   hover:bg-gray-200 dark:hover:bg-gray-700 
                   transition-colors duration-200 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                   dark:focus:ring-offset-gray-800
                   cursor-pointer"
            aria-label="Theme options"
        >
            {{-- Current theme icon --}}
            <svg class="{{ $iconSize }} text-yellow-500 dark:hidden" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" fill="none"/>
                <path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5s5-2.24 5-5s-2.24-5-5-5m-1-6v4h2V1zm0 18v4h2v-4zm12-8h-4v2h4zM5 11H1v2h4zm11.24 6.66l2.47 2.47l1.41-1.41l-2.47-2.47zM3.87 5.28l2.47 2.47l1.41-1.41l-2.47-2.47zm2.47 10.96l-2.47 2.47l1.41 1.41l2.47-2.47zM18.72 3.87l-2.47 2.47l1.41 1.41l2.47-2.47z" stroke-width="0.3" stroke="currentColor"/>
            </svg>
            
            <svg class="{{ $iconSize }} text-blue-500 hidden dark:block" fill="currentColor" viewBox="0 0 25 24" xmlns="http://www.w3.org/2000/svg">
                <rect width="25" height="24" fill="none"/>
                <path fill="currentColor" d="m16.07 3.344l-1.428.781l1.428.781l.781 1.428l.781-1.428l1.428-.781l-1.428-.781l-.78-1.428zM2.226 12c0-5.523 4.477-10 10-10h1.734l-.868 1.5c-.579 1-.866 2.189-.866 3.5a7 7 0 0 0 8.348 6.87l1.682-.327l-.543 1.626A10 10 0 0 1 12.227 22c-5.523 0-10-4.477-10-10m18.5-5.584l.914 1.67L23.31 9l-1.67.914l-.914 1.67l-.913-1.67L18.143 9l1.67-.914z" stroke-width="0.3" stroke="currentColor"/>
            </svg>
            
            @if($showLabel)
                <span class="text-sm font-medium" data-theme-indicator>Light</span>
            @endif
            
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        
        {{-- Dropdown Menu --}}
        <div 
            data-theme-dropdown-menu
            class="absolute right-0 mt-2 w-48 rounded-lg shadow-lg 
                   bg-white dark:bg-gray-800 
                   border border-gray-200 dark:border-gray-700 
                   hidden z-50"
        >
            <div class="py-1">
                <button 
                    data-theme-option="light"
                    class="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 
                           hover:bg-gray-100 dark:hover:bg-gray-700 
                           transition-colors duration-150 cursor-pointer"
                >
                    <svg class="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" fill="none"/>
                        <path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5s5-2.24 5-5s-2.24-5-5-5m-1-6v4h2V1zm0 18v4h2v-4zm12-8h-4v2h4zM5 11H1v2h4zm11.24 6.66l2.47 2.47l1.41-1.41l-2.47-2.47zM3.87 5.28l2.47 2.47l1.41-1.41l-2.47-2.47zm2.47 10.96l-2.47 2.47l1.41 1.41l2.47-2.47zM18.72 3.87l-2.47 2.47l1.41 1.41l2.47-2.47z" stroke-width="0.3" stroke="currentColor"/>
                    </svg>
                    <span>Light</span>
                    <svg class="h-4 w-4 ml-auto text-green-500 hidden" data-theme-check="light" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                </button>
                
                <button 
                    data-theme-option="dark"
                    class="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 
                           hover:bg-gray-100 dark:hover:bg-gray-700 
                           transition-colors duration-150 cursor-pointer"
                >
                    <svg class="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 25 24" xmlns="http://www.w3.org/2000/svg">
                        <rect width="25" height="24" fill="none"/>
                        <path fill="currentColor" d="m16.07 3.344l-1.428.781l1.428.781l.781 1.428l.781-1.428l1.428-.781l-1.428-.781l-.78-1.428zM2.226 12c0-5.523 4.477-10 10-10h1.734l-.868 1.5c-.579 1-.866 2.189-.866 3.5a7 7 0 0 0 8.348 6.87l1.682-.327l-.543 1.626A10 10 0 0 1 12.227 22c-5.523 0-10-4.477-10-10m18.5-5.584l.914 1.67L23.31 9l-1.67.914l-.914 1.67l-.913-1.67L18.143 9l1.67-.914z" stroke-width="0.3" stroke="currentColor"/>
                    </svg>
                    <span>Dark</span>
                    <svg class="h-4 w-4 ml-auto text-green-500 hidden" data-theme-check="dark" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                </button>
                
                <button 
                    data-theme-option="system"
                    class="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 
                           hover:bg-gray-100 dark:hover:bg-gray-700 
                           transition-colors duration-150 cursor-pointer"
                >
                    <svg class="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                    </svg>
                    <span>System</span>
                    <svg class="h-4 w-4 ml-auto text-green-500 hidden" data-theme-check="system" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

@elseif($variant === 'mobile-dropdown')
    {{-- Mobile Dropdown Variant - For User Dropdown Integration --}}
    <button 
        data-theme-toggle
        class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer {{ $class }}"
        aria-label="Toggle theme"
    >
        {{-- Sun Icon (Light Mode) - Light Yellow --}}
        <svg class="{{ $iconSize }} text-yellow-500 dark:hidden" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" fill="none"/>
            <path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5s5-2.24 5-5s-2.24-5-5-5m-1-6v4h2V1zm0 18v4h2v-4zm12-8h-4v2h4zM5 11H1v2h4zm11.24 6.66l2.47 2.47l1.41-1.41l-2.47-2.47zM3.87 5.28l2.47 2.47l1.41-1.41l-2.47-2.47zm2.47 10.96l-2.47 2.47l1.41 1.41l2.47-2.47zM18.72 3.87l-2.47 2.47l1.41 1.41l2.47-2.47z" stroke-width="0.3" stroke="currentColor"/>
        </svg>
        
        {{-- Moon Icon (Dark Mode) - Light Dark Blue --}}
        <svg class="{{ $iconSize }} text-blue-400 hidden dark:block" fill="currentColor" viewBox="0 0 25 24" xmlns="http://www.w3.org/2000/svg">
            <rect width="25" height="24" fill="none"/>
            <path fill="currentColor" d="m16.07 3.344l-1.428.781l1.428.781l.781 1.428l.781-1.428l1.428-.781l-1.428-.781l-.78-1.428zM2.226 12c0-5.523 4.477-10 10-10h1.734l-.868 1.5c-.579 1-.866 2.189-.866 3.5a7 7 0 0 0 8.348 6.87l1.682-.327l-.543 1.626A10 10 0 0 1 12.227 22c-5.523 0-10-4.477-10-10m18.5-5.584l.914 1.67L23.31 9l-1.67.914l-.914 1.67l-.913-1.67L18.143 9l1.67-.914z" stroke-width="0.3" stroke="currentColor"/>
        </svg>
        
        <span data-theme-indicator>Switch to Dark Mode</span>
    </button>
@endif
