/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#10b981', // Emerald 500
                    hover: '#059669',   // Emerald 600
                },
                secondary: {
                    DEFAULT: '#1e293b', // Slate 800
                    foreground: '#f8fafc', // Slate 50
                },
                background: '#f8fafc', // Slate 50
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
