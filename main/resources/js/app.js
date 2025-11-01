import './bootstrap';
import 'animate.css';

import Alpine from 'alpinejs';

window.Alpine = Alpine;

Alpine.start();

// Expose SweetAlert2 globally for Blade inline usage
import Swal from 'sweetalert2';
window.Swal = Swal;

// Import common utilities
import * as CommonUtils from './common';
window.CommonUtils = CommonUtils;

// Import theme manager for dark/light mode
import ThemeManager from './theme-manager';
window.ThemeManager = ThemeManager;

// Import bump message system for Assistant Warden
import './dashboard/components/bump-message';

// Import warden notifications system
import './dashboard/components/warden-notifications';

// Slideshow is loaded only on pages that include it explicitly