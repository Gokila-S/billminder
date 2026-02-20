/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'sans': ['Outfit', 'sans-serif'],
            },
            colors: {
                'pop-pink': '#ff6f91',
                'pop-yellow': '#f9d56e',
                'pop-blue': '#845ec2',
                'pop-dark': '#2c3e50',
            },
            boxShadow: {
                'brutal': '4px 4px 0px 0px rgba(0,0,0,1)',
                'brutal-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
            },
            keyframes: {
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
                    '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
                },
            },
            animation: {
                shake: 'shake 0.5s ease-in-out',
            },
        },
    },
    plugins: [],
}
