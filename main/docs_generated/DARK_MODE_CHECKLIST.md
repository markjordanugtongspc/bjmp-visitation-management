# Dark Mode Implementation Checklist

Quick reference checklist for completing the dark/light mode integration.

---

## ✅ Completed

- [x] Create centralized theme manager (`theme-manager.js`)
- [x] Create theme toggle component (`theme-toggle.blade.php`)
- [x] Update `app.blade.php` layout
- [x] Update `guest.blade.php` layout
- [x] Update `admin/dashboard.blade.php`
- [x] Update `warden/dashboard.blade.php`
- [x] Refactor `supervision/components/supervision-cards.js`
- [x] Create documentation

---

## 📋 Dashboard Views - Theme Toggle Integration

### Admin Role
- [ ] `admin/inmates/inmates.blade.php`
- [ ] `admin/inmates/female/inmates-female.blade.php`
- [ ] `admin/officers/officers.blade.php`
- [ ] `admin/visitors/visitors.blade.php`

### Warden Role
- [ ] `warden/inmates/inmates.blade.php`
- [ ] `warden/inmates/female/inmates-female.blade.php`
- [ ] `warden/officers/officers.blade.php`
- [ ] `warden/visitors/visitors.blade.php`
- [ ] `warden/supervision/supervision.blade.php`

### Nurse Role
- [ ] `nurse/dashboard.blade.php`

### Searcher Role
- [ ] `searcher/dashboard.blade.php`
- [ ] `searcher/visitors/visitors.blade.php`
- [ ] `searcher/visitors/requests.blade.php`

### Other
- [ ] `profile/edit.blade.php`
- [ ] `visitation/request/visitor.blade.php`

**For each file, add:**
1. `<x-theme-toggle />` in mobile sidebar header
2. `<x-theme-toggle />` in main header actions
3. Theme toggle button in user dropdown menu

---

## 🔧 JavaScript Files - ThemeManager Migration

### High Priority (Most References)
- [ ] `inmates/inmates.jsx` (257 refs)
- [ ] `nurse/components/medical-card.js` (129 refs)
- [ ] `inmates/components/inmate-cells.js` (60 refs)
- [ ] `nurse/components/medical-visitation-scheduler.js` (52 refs)
- [ ] `visitors/visitors.js` (50 refs)
- [ ] `visitors/allowed-visitors.js` (49 refs)

### Medium Priority
- [ ] `dashboard/components/role-based.js` (30 refs)
- [ ] `supervision/components/file-preview.js` (29 refs)
- [ ] `officers/officers.js` (24 refs)
- [ ] `visitors/visitor-request-modal.js` (21 refs)
- [ ] `supervision/components/supervision-form.js` (16 refs)
- [ ] `profile/edit-profile-modal.js` (15 refs)

### Low Priority
- [ ] `inmates/components/search-sort-filter.js` (11 refs)
- [ ] `supervision/components/supervision-modal.js` (11 refs)
- [ ] `nurse/components/inmate-selector.js` (10 refs)
- [ ] `nurse/nurse-dashboard.js` (8 refs)
- [ ] `dashboard/components/notifications.js` (7 refs)
- [ ] `dashboard/components/recent-visitor-requests.js` (7 refs)
- [ ] `visitation/calendar-handler.js` (5 refs)
- [ ] `modules/navigation-extensions.js` (3 refs)

**For each file:**
1. Remove custom `PALETTE`, `isDarkMode()`, `themedConfirm()`, `themedToast()`
2. Add `const themeManager = window.ThemeManager;`
3. Replace all usage with ThemeManager methods

---

## 🎨 Blade Components - Dark Mode Classes

- [ ] `components/primary-button.blade.php`
- [ ] `components/secondary-button.blade.php`
- [ ] `components/danger-button.blade.php`
- [ ] `components/text-input.blade.php`
- [ ] `components/input-label.blade.php`
- [ ] `components/input-error.blade.php`
- [ ] `components/dropdown.blade.php`
- [ ] `components/dropdown-link.blade.php`
- [ ] `components/nav-link.blade.php`
- [ ] `components/responsive-nav-link.blade.php`
- [ ] `components/modal.blade.php`
- [ ] `components/notification-bell.blade.php`
- [ ] `components/application-logo.blade.php`

**Add dark: classes for:**
- Backgrounds
- Text colors
- Borders
- Hover states
- Focus states

---

## 📄 View Pages - Dark Mode Classes

### Auth Pages
- [ ] `auth/login.blade.php`
- [ ] `auth/register.blade.php`
- [ ] `auth/forgot-password.blade.php`
- [ ] `auth/reset-password.blade.php`
- [ ] `auth/verify-email.blade.php`
- [ ] `auth/confirm-password.blade.php`

### Profile Pages
- [ ] `profile/edit.blade.php`
- [ ] `profile/partials/update-profile-information-form.blade.php`
- [ ] `profile/partials/update-password-form.blade.php`
- [ ] `profile/partials/delete-user-form.blade.php`

### Admin Pages
- [ ] All pages in `admin/` directory

### Warden Pages
- [ ] All pages in `warden/` directory

### Nurse Pages
- [ ] All pages in `nurse/` directory

### Searcher Pages
- [ ] All pages in `searcher/` directory

### Visitation Pages
- [ ] All pages in `visitation/` directory

---

## 🧪 Testing

- [ ] Theme toggle works in all dashboard views
- [ ] Theme persists across page reloads
- [ ] Theme persists across browser sessions
- [ ] All SweetAlert2 modals themed correctly
- [ ] All Flowbite components work in both themes
- [ ] All forms readable in both themes
- [ ] All tables readable in both themes
- [ ] All cards/panels readable in both themes
- [ ] All navigation readable in both themes
- [ ] System preference detection works
- [ ] No console errors
- [ ] Mobile responsive in both themes
- [ ] Tablet responsive in both themes
- [ ] Desktop responsive in both themes

---

## 🎯 Optional Enhancements

- [ ] Replace theme toggle icons (see `THEME_TOGGLE_ICONS.md`)
- [ ] Add theme toggle to mobile navigation
- [ ] Add theme preference to user profile settings
- [ ] Add smooth transitions for theme changes
- [ ] Add keyboard shortcut for theme toggle (e.g., Ctrl+Shift+D)
- [ ] Add theme preview in settings
- [ ] Add auto theme switching based on time of day
- [ ] Add custom theme colors option

---

## 📚 Reference Documents

- `DARK_MODE_INTEGRATION_GUIDE.md` - Detailed implementation guide
- `THEME_TOGGLE_ICONS.md` - Icon replacement options
- `IMPLEMENTATION_SUMMARY.md` - What's been done and what's next

---

## 💡 Quick Tips

1. **Search for "Dark Mode Toggle removed"** to find files needing updates
2. **Search for "isDarkMode()"** in JS files to find custom implementations
3. **Test in both themes** after each major change
4. **Use browser DevTools** to verify dark mode classes are applied
5. **Check localStorage** for `bjmp-theme-preference` key
6. **Verify ThemeManager** is available: `console.log(window.ThemeManager)`

---

**Last Updated:** October 31, 2025
