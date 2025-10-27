import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
                'resources/js/slideshow.js',
                'resources/js/visitation/request/visitmodal.js',
                'resources/js/dashboard/home.js',
                'resources/js/nurse/nurse-dashboard.js',
                'resources/js/officers/officers.js',
                'resources/js/profile/edit-profile-modal.js',
                'resources/js/inmates/inmates.js',
                'resources/js/inmates/components/inmates-female.js',
                'resources/js/inmates/components/points-system.js',
                'resources/js/modules/dark-mode-init.js',
                'resources/js/modules/flowbite-dark-mode.js',
                'resources/js/modules/sweetalert2-dark-mode.js'
            ],
            refresh: true,
        }),
        tailwindcss(),
    ],
});