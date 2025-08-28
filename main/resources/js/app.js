import './bootstrap';

import Alpine from 'alpinejs';

window.Alpine = Alpine;

Alpine.start();

// Expose SweetAlert2 globally for Blade inline usage
import Swal from 'sweetalert2';
window.Swal = Swal;

// Slideshow is loaded only on pages that include it explicitly