{{-- Dark Mode Layout Component --}}
{{-- A layout wrapper that includes dark mode functionality --}}

@props([
    'showToggle' => true,
    'toggleVariant' => 'button',
    'toggleSize' => 'md',
    'togglePosition' => 'header', // 'header', 'sidebar', 'floating'
    'class' => ''
])

<div class="{{ $class }}">
    @if($showToggle && $togglePosition === 'floating')
        {{-- Floating toggle (bottom right) --}}
        <div class="fixed bottom-4 right-4 z-50">
            <x-dark-mode-toggle 
                :variant="$toggleVariant" 
                :size="$toggleSize" 
                :showLabel="false"
                class="shadow-lg"
            />
        </div>
    @endif

    {{-- Main content --}}
    <div>
        {{ $slot }}
    </div>

    {{-- Include dark mode script --}}
    @vite('resources/js/modules/dark-mode-init.js')
</div>
