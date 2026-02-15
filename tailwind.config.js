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
            }
        },
    },
    plugins: [],
}
