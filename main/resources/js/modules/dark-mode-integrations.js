/**
 * Dark Mode Integrations
 * SweetAlert2: Uses 'auto' theme parameter (official docs)
 * Flowbite: Already integrated via Tailwind 'dark' class
 */

import manager from './dark-mode-manager.js';

class DarkModeIntegrations {
  constructor() {
    this.originalSwal = null;
  }
  
  /**
   * Initialize integrations
   */
  init() {
    this.setupSweetAlert2();
  }
  
  /**
   * Wrap SweetAlert2 to always use auto theme
   * Official docs: https://sweetalert2.github.io/#themes
   */
  setupSweetAlert2() {
    // Wait for Swal to be available
    const checkSwal = () => {
      if (window.Swal) {
        this.patchSwal();
      } else {
        setTimeout(checkSwal, 100);
      }
    };
    
    checkSwal();
  }
  
  /**
   * Patch Swal to auto-inject theme: 'auto'
   */
  patchSwal() {
    if (!window.Swal || this.originalSwal) return;
    
    this.originalSwal = window.Swal;
    
    // Create wrapper that adds theme: 'auto' to all calls
    window.Swal = new Proxy(this.originalSwal, {
      get: (target, prop) => {
        if (prop === 'fire') {
          return (options) => {
            // Inject theme: 'auto' if not specified
            const config = typeof options === 'string' 
              ? { title: options, theme: 'auto' }
              : { ...options, theme: options?.theme || 'auto' };
            
            return target.fire(config);
          };
        }
        return target[prop];
      }
    });
    
    console.log('✅ SweetAlert2 auto-theme enabled');
  }
}

export default new DarkModeIntegrations();

