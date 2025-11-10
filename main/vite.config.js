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
        host: 'localhost',
        port: 5173,
        strictPort: false,
        hmr: {
            host: 'localhost',
            port: 5173,
            protocol: 'ws',
        },
        watch: {
            // Removed usePolling - uses native file system events (much faster)
            // Only enable polling if you're in Docker/VM/network mounts
            ignored: [
                '**/node_modules/**',
                '**/.git/**',
                '**/storage/**',
                '**/bootstrap/cache/**',
                '**/vendor/**',
            ],
        },
        cors: true,
        origin: 'http://localhost:5173',
    },
    optimizeDeps: {
        // Pre-bundle these dependencies for faster dev server startup
        include: [
            'alpinejs',
            'axios',
            'sweetalert2',
            'animate.css',
            'flowbite',
        ],
        // Exclude heavy dependencies that load on-demand
        exclude: ['face-api.js'],
        // Force optimization of these packages
        force: false,
    },
    build: {
        // Production build optimizations
        manifest: true,
        outDir: 'public/build',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                // Code splitting for better caching
                manualChunks: {
                    'vendor-core': ['alpinejs', 'axios'],
                    'vendor-ui': ['sweetalert2', 'animate.css', 'flowbite'],
                },
                // Optimize chunk file names
                chunkFileNames: 'js/[name]-[hash].js',
                entryFileNames: 'js/[name]-[hash].js',
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name.endsWith('.css')) {
                        return 'css/[name]-[hash][extname]';
                    }
                    return 'assets/[name]-[hash][extname]';
                },
            },
        },
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 1000,
        // Source maps for production debugging (disable if not needed)
        sourcemap: false,
        // Minification
        minify: 'esbuild',
        // CSS code splitting
        cssCodeSplit: true,
    },
    // Performance optimizations
    esbuild: {
        // Drop console and debugger in production
        drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
    // Resolve configuration
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
});