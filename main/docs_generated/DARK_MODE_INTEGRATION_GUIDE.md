# Dark/Light Mode Integration Guide

## Overview
This guide documents the comprehensive dark/light mode integration for the BJMP Visitation Management System. The system now supports seamless theme switching with persistent user preferences.

---

## ✅ Completed Tasks

### 1. **Centralized Theme Manager** (`resources/js/theme-manager.js`)
- ✅ Created a comprehensive `ThemeManager` class
- ✅ Handles theme persistence via localStorage
- ✅ Supports system preference detection
- ✅ Provides themed SweetAlert2 configurations
- ✅ Exposes convenient methods: `showAlert()`, `showConfirm()`, `showToast()`, `showSuccess()`, `showError()`, `showWarning()`, `showInfo()`
- ✅ Automatically updates Flowbite components on theme change
- ✅ Dispatches custom `themeChanged` events

**Usage Example:**
```javascript
// Show themed confirmation
window.ThemeManager.showConfirm({
  title: 'Delete file?',
  text: 'This action cannot be undone.',
  icon: 'warning',
  variant: 'danger'
}).then((result) => {
  if (result.isConfirmed) {
    // Handle confirmation
  }
});

// Show success toast
window.ThemeManager.showSuccess('Operation completed successfully!');

// Toggle theme programmatically
window.ThemeManager.toggleTheme();
```

### 2. **Theme Toggle Component** (`resources/views/components/theme-toggle.blade.php`)
- ✅ Reusable Blade component for theme toggle buttons
- ✅ Supports multiple sizes: `sm`, `md`, `lg`
- ✅ Optional label display
- ✅ Automatically shows/hides sun/moon icons based on current theme

**Usage Example:**
```blade
{{-- Default size (md) --}}
<x-theme-toggle />

{{-- Small size with label --}}
<x-theme-toggle size="sm" :showLabel="true" />

{{-- Large size with custom class --}}
<x-theme-toggle size="lg" class="shadow-lg" />
```

### 3. **Updated Layouts**
- ✅ **app.blade.php**: Added dark mode classes to body and main container
- ✅ **guest.blade.php**: Added dark mode classes for authentication pages

### 4. **Updated Dashboard Views**
- ✅ **admin/dashboard.blade.php**: Full theme toggle integration (mobile sidebar, header, dropdown)
- ✅ **warden/dashboard.blade.php**: Full theme toggle integration

### 5. **Refactored JavaScript Files**
- ✅ **supervision/components/supervision-cards.js**: Migrated to use centralized ThemeManager
  - Removed custom `isDarkMode()`, `themedConfirm()`, `themedToast()` functions
  - Now uses `window.ThemeManager` methods

---

## 🔄 Pending Tasks

### Dashboard Views Requiring Theme Toggle Integration
The following dashboard files need the same pattern applied as `admin/dashboard.blade.php`:

**Admin Role:**
- `admin/inmates/inmates.blade.php`
- `admin/inmates/female/inmates-female.blade.php`
- `admin/officers/officers.blade.php`
- `admin/visitors/visitors.blade.php`

**Warden Role:**
- `warden/inmates/inmates.blade.php`
- `warden/inmates/female/inmates-female.blade.php`
- `warden/officers/officers.blade.php`
- `warden/visitors/visitors.blade.php`
- `warden/supervision/supervision.blade.php`

**Nurse Role:**
- `nurse/dashboard.blade.php`

**Searcher Role:**
- `searcher/dashboard.blade.php`
- `searcher/visitors/visitors.blade.php`
- `searcher/visitors/requests.blade.php`

**Other:**
- `profile/edit.blade.php`
- `visitation/request/visitor.blade.php`

### JavaScript Files Requiring Refactoring
Replace custom dark mode detection and SweetAlert2 theming with `window.ThemeManager`:

**High Priority:**
- `inmates/inmates.jsx` (257 dark mode references)
- `nurse/components/medical-card.js` (129 references)
- `visitors/visitors.js` (50 references)
- `visitors/allowed-visitors.js` (49 references)
- `inmates/components/inmate-cells.js` (60 references)
- `nurse/components/medical-visitation-scheduler.js` (52 references)

**Medium Priority:**
- `dashboard/components/role-based.js` (30 references)
- `supervision/components/file-preview.js` (29 references)
- `officers/officers.js` (24 references)
- `visitors/visitor-request-modal.js` (21 references)
- `supervision/components/supervision-form.js` (16 references)
- `profile/edit-profile-modal.js` (15 references)

**Low Priority:**
- `inmates/components/search-sort-filter.js` (11 references)
- `supervision/components/supervision-modal.js` (11 references)
- `nurse/components/inmate-selector.js` (10 references)
- `nurse/nurse-dashboard.js` (8 references)
- `dashboard/components/notifications.js` (7 references)
- `dashboard/components/recent-visitor-requests.js` (7 references)
- `visitation/calendar-handler.js` (5 references)
- `modules/navigation-extensions.js` (3 references)

### Component Blade Files Requiring Dark Mode Classes
Add `dark:` Tailwind classes to these components:

- `components/primary-button.blade.php`
- `components/secondary-button.blade.php`
- `components/danger-button.blade.php`
- `components/text-input.blade.php`
- `components/input-label.blade.php`
- `components/input-error.blade.php`
- `components/dropdown.blade.php`
- `components/dropdown-link.blade.php`
- `components/nav-link.blade.php`
- `components/responsive-nav-link.blade.php`
- `components/modal.blade.php`
- `components/notification-bell.blade.php`
- `components/application-logo.blade.php`

### View Pages Requiring Dark Mode Classes
Add `dark:` classes to all view pages in:
- `admin/` directory
- `warden/` directory
- `nurse/` directory
- `searcher/` directory
- `auth/` directory (login, register, forgot-password, etc.)
- `profile/` directory
- `visitation/` directory

---

## 📋 Implementation Pattern

### For Dashboard Views
Replace the commented dark mode toggle sections with the new component:

**Mobile Sidebar (before):**
```blade
<div class="sm:hidden flex items-center px-3 py-4 border-b border-gray-200 dark:border-gray-800">
    <a href="{{ route('dashboard') }}" class="flex items-center gap-2">
        <x-application-logo size="sm" :showText="true" heading="BJMP Iligan" subtext="Information & Visitation" />
    </a>
</div>
```

**Mobile Sidebar (after):**
```blade
<div class="sm:hidden flex items-center justify-between px-3 py-4 border-b border-gray-200 dark:border-gray-800">
    <a href="{{ route('dashboard') }}" class="flex items-center gap-2">
        <x-application-logo size="sm" :showText="true" heading="BJMP Iligan" subtext="Information & Visitation" />
    </a>
    <x-theme-toggle />
</div>
```

**Header Actions (before):**
```blade
<div class="flex items-center gap-2 ml-auto">
    <!-- Dark Mode Toggle removed; icons preserved ... -->
    <x-notification-bell />
```

**Header Actions (after):**
```blade
<div class="flex items-center gap-2 ml-auto">
    <x-theme-toggle />
    <x-notification-bell />
```

**User Dropdown Menu (add after first hr):**
```blade
<hr class="border-t border-gray-200 dark:border-gray-700">

<!-- Theme Toggle in Dropdown -->
<button data-theme-toggle class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-2">
    <svg data-theme-icon="light" class="w-4 h-4 hidden" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path>
    </svg>
    <svg data-theme-icon="dark" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
    </svg>
    <span>Toggle Theme</span>
</button>

<hr class="border-t border-gray-200 dark:border-gray-700">
```

### For JavaScript Files
Replace custom theme detection and SweetAlert2 theming:

**Before:**
```javascript
const PALETTE = {
  primary: '#3B82F6',
  danger: '#EF4444',
  darkBg: '#111827',
};

function isDarkMode() {
  return document.documentElement.classList.contains('dark')
    || window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function themedConfirm(options = {}) {
  const base = {
    showCancelButton: true,
    confirmButtonColor: options.variant === 'danger' ? PALETTE.danger : PALETTE.primary,
    cancelButtonColor: PALETTE.darkBg,
  };
  if (isDarkMode()) {
    base.background = PALETTE.darkBg;
    base.color = '#E5E7EB';
  }
  return window.Swal.fire({ ...base, ...options });
}

// Usage
themedConfirm({
  title: 'Delete?',
  text: 'Are you sure?',
  icon: 'warning',
  variant: 'danger'
});
```

**After:**
```javascript
// Use centralized theme manager
const themeManager = window.ThemeManager;

// Usage
themeManager.showConfirm({
  title: 'Delete?',
  text: 'Are you sure?',
  icon: 'warning',
  variant: 'danger'
});

// Or use convenience methods
themeManager.showSuccess('Operation completed!');
themeManager.showError('Something went wrong!', 'Error');
themeManager.showWarning('Please be careful!');
themeManager.showInfo('Here is some information');
```

### For Blade Components
Add dark mode classes to all color-related properties:

**Example Pattern:**
```blade
{{-- Background --}}
bg-white dark:bg-gray-800
bg-gray-100 dark:bg-gray-900
bg-gray-50 dark:bg-gray-950

{{-- Text --}}
text-gray-900 dark:text-gray-100
text-gray-700 dark:text-gray-300
text-gray-500 dark:text-gray-400

{{-- Borders --}}
border-gray-200 dark:border-gray-700
border-gray-300 dark:border-gray-600

{{-- Hover States --}}
hover:bg-gray-100 dark:hover:bg-gray-800
hover:text-gray-900 dark:hover:text-gray-100

{{-- Focus States --}}
focus:ring-blue-500 dark:focus:ring-blue-400
focus:border-blue-500 dark:focus:border-blue-400
```

**Do NOT modify:**
- Colored elements (red, blue, yellow, orange, green, etc.)
- Brand colors
- Status indicators
- Alert/notification colors

---

## 🎨 Tailwind Configuration

The `tailwind.config.js` is already configured with:
- `darkMode: 'class'` - Uses class-based dark mode
- Custom brand colors for light/dark variants
- Flowbite plugin integration

---

## 🔧 Technical Details

### Theme Persistence
- Stored in `localStorage` with key: `bjmp-theme-preference`
- Values: `'light'`, `'dark'`, or `'system'`
- Automatically applied on page load

### Theme Detection
- Checks for saved preference first
- Falls back to system preference if no saved preference
- Watches for system theme changes

### SweetAlert2 Theming
- Automatically applies theme-appropriate colors
- Custom classes for dark/light mode
- Consistent with Tailwind color palette

### Flowbite Integration
- Automatically reinitializes Flowbite components on theme change
- Ensures dropdowns, modals, and tooltips work correctly

---

## 📝 Notes

1. **SVG Icons**: The theme toggle uses inline SVG icons. You can replace these with your preferred icon library (e.g., Heroicons, Lucide).

2. **Color Preservation**: As requested, colored elements (red, orange, blue, yellow, etc.) are NOT modified with dark mode variants. Only neutral colors (gray, white, black) receive dark mode classes.

3. **SweetAlert2**: All SweetAlert2 modals automatically adapt to the current theme. No need to manually configure colors.

4. **Performance**: Theme changes are instant with no page reload required.

5. **Accessibility**: Theme toggle buttons include proper ARIA labels.

---

## 🚀 Next Steps

1. **Batch Update Dashboard Views**: Apply the theme toggle pattern to all remaining dashboard files
2. **Refactor JavaScript Files**: Replace custom theme functions with ThemeManager in all JS files
3. **Update Components**: Add dark mode classes to all Blade components
4. **Update Views**: Add dark mode classes to all view pages
5. **Test Thoroughly**: Test all pages in both light and dark modes
6. **User Documentation**: Create end-user documentation for the theme toggle feature

---

## 🐛 Troubleshooting

**Theme not persisting:**
- Check browser localStorage is enabled
- Verify `theme-manager.js` is loaded before other scripts

**Icons not switching:**
- Ensure `data-theme-icon` attributes are present
- Check that `updateToggleButtons()` is called after theme change

**SweetAlert2 not themed:**
- Verify `window.ThemeManager` is available
- Check that SweetAlert2 is loaded globally

**Flowbite components not updating:**
- Ensure Flowbite is loaded globally
- Check that `window.Flowbite.initFlowbite()` is called

---

## 📚 Resources

- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [SweetAlert2 Documentation](https://sweetalert2.github.io/)
- [Flowbite Documentation](https://flowbite.com/)

---

**Last Updated:** October 31, 2025
**Status:** In Progress - Core functionality complete, batch updates pending
