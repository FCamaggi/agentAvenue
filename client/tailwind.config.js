/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'game-blue': '#2E75B6',
                'game-green': '#1E7E34',
                'game-beige': '#FDF6D8',
                'game-teal': '#14B8A6',
            },
        },
    },
    plugins: [],
}
