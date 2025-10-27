# Dark Mode Integration Guide

This guide explains how to integrate the dark mode toggle component across all your views.

## Quick Start

### 1. Include the Dark Mode Script

Add this to any view where you want dark mode functionality:

```blade
@vite('resources/js/modules/dark-mode-init.js')
```

### 2. Add the Toggle Component

Use the dark mode toggle component in your views:

```blade
<!-- Simple toggle switch -->
<x-dark-mode-toggle />

<!-- Button variant (recommended for headers) -->
<x-dark-mode-toggle variant="button" size="md" :showLabel="false" />

<!-- Dropdown variant (for settings pages) -->
<x-dark-mode-toggle variant="dropdown" size="lg" :showLabel="true" />
```

## Component Variants

### Toggle Switch (`variant="toggle"`)
- Best for: Settings pages, user preferences
- Shows: Sun/Moon icons with smooth transition
- Sizes: `sm`, `md`, `lg`

### Button (`variant="button"`)
- Best for: Headers, navigation bars
- Shows: Current theme icon
- Sizes: `sm`, `md`, `lg`

### Dropdown (`variant="dropdown"`)
- Best for: Settings pages, user menus
- Shows: All theme options (Light, Dark, System)
- Sizes: `sm`, `md`, `lg`

## Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | `'toggle'` | Component style: `'toggle'`, `'button'`, `'dropdown'` |
| `size` | string | `'md'` | Size: `'sm'`, `'md'`, `'lg'` |
| `showLabel` | boolean | `true` | Show theme label text |
| `label` | string | `'Theme'` | Custom label text |
| `class` | string | `''` | Additional CSS classes |

## Integration Examples

### Header Integration
```blade
<!-- Desktop header -->
<div class="flex items-center gap-2 ml-auto">
    <x-dark-mode-toggle variant="button" size="md" :showLabel="false" class="hidden sm:flex" />
    <!-- Other header elements -->
</div>

<!-- Mobile header -->
<div class="sm:hidden flex items-center justify-between">
    <div>Logo</div>
    <x-dark-mode-toggle variant="button" size="sm" :showLabel="false" />
</div>
```

### Settings Page Integration
```blade
<div class="space-y-4">
    <div class="flex items-center justify-between">
        <div>
            <h3 class="text-lg font-medium">Theme Preference</h3>
            <p class="text-sm text-gray-500">Choose your preferred theme</p>
        </div>
        <x-dark-mode-toggle variant="dropdown" size="lg" />
    </div>
</div>
```

### Sidebar Integration
```blade
<aside class="sidebar">
    <div class="sidebar-header">
        <div>Logo</div>
        <x-dark-mode-toggle variant="button" size="sm" :showLabel="false" />
    </div>
    <!-- Sidebar content -->
</aside>
```

## JavaScript API

### Global Functions
```javascript
// Toggle between themes
toggleTheme();

// Set specific theme
setTheme('light');   // 'light', 'dark', or 'system'
setTheme('dark');
setTheme('system');

// Check current state
isDarkMode();        // Returns boolean

// Initialize (usually automatic)
initDarkMode();
```

### Advanced Usage
```javascript
// Get manager instance
const manager = window.DarkModeManager;

// Listen for theme changes
manager.onThemeChange((event, theme, effectiveTheme) => {
    console.log('Theme changed to:', effectiveTheme);
});

// Get current theme
const currentTheme = manager.getCurrentTheme();
const isDark = manager.isDarkMode();
```

## Styling Your Components

### Using Your Color Palette
The dark mode system uses your existing Tailwind color palette:

```css
/* Light mode */
.bg-gray-50
.bg-white
.text-gray-900

/* Dark mode */
.dark:bg-gray-950
.dark:bg-gray-900
.dark:text-gray-100
```

### Custom Dark Mode Classes
```blade
<div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
    <h1 class="text-gray-900 dark:text-gray-100">Title</h1>
    <p class="text-gray-600 dark:text-gray-400">Description</p>
</div>
```

## Keyboard Shortcuts

- `Ctrl/Cmd + Shift + D`: Toggle theme
- `Escape`: Close dropdown menus

## Browser Support

- ✅ Chrome 88+
- ✅ Firefox 87+
- ✅ Safari 14+
- ✅ Edge 88+

## Troubleshooting

### Theme Not Persisting
- Check if localStorage is available
- Ensure the script is loaded before user interaction

### Toggle Not Working
- Verify the script is included: `@vite('resources/js/modules/dark-mode-init.js')`
- Check browser console for errors
- Ensure Tailwind CSS is properly configured

### Styling Issues
- Make sure you're using `dark:` prefixes in your classes
- Verify the `dark` class is being applied to the `<html>` element
- Check if your custom CSS conflicts with dark mode styles

## Migration from System Theme

If you're migrating from system-only dark mode:

1. Update your CSS to use the custom variant:
```css
@custom-variant dark (&:where(.dark, .dark *));
```

2. Replace `prefers-color-scheme` media queries with `.dark` classes
3. Add the toggle component to your layouts
4. Include the initialization script

## Performance

- Minimal JavaScript footprint (~5KB gzipped)
- No external dependencies
- Lazy initialization
- Efficient DOM updates
