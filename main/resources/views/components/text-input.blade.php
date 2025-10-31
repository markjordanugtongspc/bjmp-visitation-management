@props(['disabled' => false])

<input @disabled($disabled) {{ $attributes->merge(['class' => 'bg-white text-gray-900 border border-gray-300 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder-gray-400 dark:focus:border-blue-600 dark:focus:ring-blue-600 rounded-md shadow-sm transition-colors']) }}>
