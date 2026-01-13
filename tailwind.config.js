/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'dashboard-bg': '#0f172a', // slate-950
                'dashboard-card': '#1e293b', // slate-800
                'dashboard-text': '#f8fafc', // slate-50
                'dashboard-text-muted': '#94a3b8', // slate-400
                'brand-blue': '#3b82f6',
                'brand-green': '#10b981',
                'brand-red': '#ef4444',
                'brand-yellow': '#f59e0b',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
