// Entry for Super Vision page JS
// Loads Flowbite (via CDN in blade) and SweetAlert2 interactions

import initSupervisionModalInteractions from './components/supervision-modal.js';

function ready(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

ready(() => {
  // Initialize supervision-specific behaviors
  initSupervisionModalInteractions();
});


