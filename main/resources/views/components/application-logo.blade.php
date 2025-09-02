@props([
    'showText' => false,
    'heading' => 'BJMP Iligan',
    'subtext' => null,
    'size' => 'md', // xs, sm, md, lg, xl
])

@php
  $sizeMap = [
    'xs' => 'h-6 w-6',
    'sm' => 'h-8 w-8',
    'md' => 'h-9 w-9',
    'lg' => 'h-10 w-10 md:h-11 md:w-11',
    'xl' => 'h-12 w-12 md:h-14 md:w-14',
  ];
  $logoSize = $sizeMap[$size] ?? $sizeMap['md'];
@endphp

<div {{ $attributes->merge(['class' => 'flex items-center gap-3 justify-start']) }}>
  <img src="{{ asset('images/logo/logo-temp_round.png') }}" alt="Application Logo" class="{{ $logoSize }} flex-shrink-0 rounded-full ring-2 ring-blue-500/20 dark:ring-blue-400/30">
  @if($showText)
    <div class="leading-tight">
      <div class="text-sm font-semibold text-gray-900 dark:text-gray-50">{{ $heading }}</div>
      @if($subtext)
        <div class="text-[11px] text-gray-500 dark:text-gray-400">{{ $subtext }}</div>
      @endif
    </div>
  @endif
</div>
