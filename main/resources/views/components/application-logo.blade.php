@props([
    'showText' => false,
    'heading' => 'BJMP Iligan',
    'subtext' => null,
    'size' => 'md', // xs, sm, md, lg, xl
])

@php
  $sizeMap = [
    'xs' => 'h-10 w-10',
    'sm' => 'h-12 w-12',
    'md' => 'h-16 w-16',
    'lg' => 'h-20 w-20 md:h-24 md:w-24',
    'xl' => 'h-24 w-24 md:h-28 md:w-28',
  ];
  $logoSize = $sizeMap[$size] ?? $sizeMap['md'];
@endphp

<div {{ $attributes->merge(['class' => 'flex items-center gap-3 justify-start']) }}>
  <img src="{{ asset('images/logo/bjmp_logo.png') }}" alt="Application Logo" class="{{ $logoSize }} flex-shrink-0 rounded-full ring-0">
  @if($showText)
    <div class="leading-tight">
      <div class="text-sm font-semibold text-gray-900 dark:text-gray-50">{{ $heading }}</div>
      @if($subtext)
        <div class="text-[11px] text-gray-500 dark:text-gray-400">{{ $subtext }}</div>
      @endif
    </div>
  @endif
</div>
