@props([
    'variant' => 'button',
    'size' => 'md',
    'class' => ''
])

@php
    $sizes = [
        'sm' => 'h-8 w-8',
        'md' => 'h-9 w-9',
        'lg' => 'h-10 w-10'
    ];
    $iconSizes = [
        'sm' => 'w-4 h-4',
        'md' => 'w-5 h-5',
        'lg' => 'w-6 h-6'
    ];
    $buttonSize = $sizes[$size] ?? $sizes['md'];
    $iconSize = $iconSizes[$size] ?? $iconSizes['md'];
@endphp

@if($variant === 'button')
    {{-- Based on Flowbite dark mode toggle button --}}
    <button 
        data-theme-toggle 
        type="button" 
        class="inline-flex items-center justify-center {{ $buttonSize }} rounded-lg
               text-gray-500 dark:text-gray-400 
               hover:bg-gray-100 dark:hover:bg-gray-700 
               focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700
               cursor-pointer {{ $class }}"
        aria-label="Toggle dark mode">
        
        {{-- Moon icon (dark mode) - Flowbite SVG --}}
        <svg data-icon="moon" class="{{ $iconSize }}" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
        </svg>
        
        {{-- Sun icon (light mode) - Flowbite SVG --}}
        <svg data-icon="sun" class="hidden {{ $iconSize }}" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path>
        </svg>
    </button>

@elseif($variant === 'mobile-dropdown')
    {{-- Mobile dropdown variant --}}
    <button 
        data-theme-toggle 
        type="button" 
        class="flex items-center gap-2 w-full px-4 py-2 text-sm text-left
               text-gray-700 dark:text-gray-300 
               hover:bg-gray-100 dark:hover:bg-gray-800
               cursor-pointer {{ $class }}">
        
        <svg data-icon="moon" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
        </svg>
        
        <svg data-icon="sun" class="hidden w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path>
        </svg>
        
        <span>Toggle Theme</span>
    </button>
@endif
