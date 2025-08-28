import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.js',
    ],
    darkMode: 'class',

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                brand: {
                    primary: {
                        light: '#1E3A8A', // Blue 800
                        dark: '#3B82F6', // Blue 500
                    },
                    secondary: {
                        light: '#F3F4F6', // Gray 100
                        dark: '#111827', // Gray 900
                    },
                    background: {
                        light: '#FFFFFF',
                        dark: '#0F172A', // Slate 900
                    },
                    text: {
                        light: '#111827', // Gray 900
                        dark: '#F9FAFB', // Gray 50
                    },
                    accent: {
                        light: '#F59E0B', // Amber 500
                        dark: '#FBBF24', // Amber 400
                    },
                    button: {
                        primary: {
                            light: '#2563EB', // Blue 600
                            dark: '#3B82F6', // Blue 500
                        },
                        hover: {
                            light: '#1D4ED8', // Blue 700
                            dark: '#60A5FA', // Blue 400
                        },
                    },
                },
            },
        },
    },

    plugins: [forms],
};


