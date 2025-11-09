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
                'resources/js/inmates/inmates.jsx',
                'resources/js/inmates/components/inmates-female.js',
                'resources/js/inmates/components/points-system.js',
                
            ],
            refresh: [
                'resources/views/**/*.blade.php',
                'routes/**/*.php',
                'app/Http/Controllers/**/*.php',
                'app/Models/**/*.php',
            ],
        }),
        tailwindcss(),
    ],
    server: {
        hmr: {
            host: 'localhost',
        },
        watch: {
            usePolling: true,
        }
    },
});