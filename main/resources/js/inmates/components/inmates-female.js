// Female entrypoint: load main logic but ensure page gender is flagged as female via Blade
import '../inmates.jsx';

// Toggle the label text between "Switch to Female" and "Switch to Male" without navigation
document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector('[data-gender-toggle]');
  const toggleInput = /** @type {HTMLInputElement|null} */(document.querySelector('[data-gender-toggle-input]'));
  const labelText = /** @type {HTMLSpanElement|null} */(document.querySelector('[data-gender-toggle-label]'));
  const container = document.querySelector('[data-route-admin-inmates-male]');
  const maleUrl = container?.getAttribute('data-route-admin-inmates-male') || '/admin/inmates';
  const femaleUrl = container?.getAttribute('data-route-admin-inmates-female') || '/admin/inmates/female';
  const currentGender = (container?.getAttribute('data-current-gender') || '').toLowerCase();

  if (!wrapper || !toggleInput || !labelText) return;

  // Defaults per page
  if (currentGender === 'male') {
    labelText.textContent = 'Switch to Female';
    toggleInput.checked = false; // sky on male page
  } else if (currentGender === 'female') {
    labelText.textContent = 'Switch to Male';
    toggleInput.checked = true; // pink on female page
  } else {
    labelText.textContent = 'Switch to Female';
    toggleInput.checked = false;
  }

  // Update text and navigate to opposite page when toggled (single click)
  toggleInput.addEventListener('change', () => {
    // Update label immediately for visual feedback
    labelText.textContent = (currentGender === 'male') ? 'Switch to Female' : 'Switch to Male';

    // Always go to the opposite route regardless of resulting checkbox state
    const target = (currentGender === 'male') ? femaleUrl : maleUrl;
    const targetPath = new URL(target, window.location.origin).pathname;
    if (window.location.pathname !== targetPath) {
      window.location.assign(target);
    }
  });
});
