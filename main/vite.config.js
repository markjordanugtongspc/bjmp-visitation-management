import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
                'resources/js/visitation/request/visitmodal.js',
                'resources/js/dashboard/home.js',
                'resources/js/admin/permissions.js',
                'resources/js/profile/edit-profile-modal.js'
            ],
            refresh: true,
        }),
        tailwindcss(),
    ],
});
