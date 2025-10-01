import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
                'resources/js/slideshow.js',
                'resources/js/visitation/request/visitmodal.js',
                'resources/js/dashboard/home.js',
                'resources/js/officers/officers.js',
                'resources/js/profile/edit-profile-modal.js'
            ],
            refresh: true,
        }),
        tailwindcss(),
    ],
    server: {
        host: '0.0.0.0',       // allow access from LAN
        port: 5173,            // default Vite port
        strictPort: true,
        hmr: {
            host: '192.168.1.15', // your LAN IP
        },
    },
});