@props([
    'showText' => false,
    'heading' => 'BJMP Iligan',
    'subtext' => null,
])

<div {{ $attributes->merge(['class' => 'flex items-center gap-3']) }}>
    <img src="{{ asset('images/logo/logo-temp_round.png') }}" alt="Application Logo" class="h-9 w-9 flex-shrink-0 rounded-full ring-2 ring-blue-500/20 dark:ring-blue-400/30">
    @if($showText)
        <div class="leading-tight">
            <div class="text-sm font-semibold text-gray-900 dark:text-gray-50">{{ $heading }}</div>
            @if($subtext)
                <div class="text-[11px] text-gray-500 dark:text-gray-400">{{ $subtext }}</div>
            @endif
        </div>
    @endif
</div>
