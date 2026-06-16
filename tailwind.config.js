/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sora: ["Sora", "system-ui", "sans-serif"],
      },
      // Soft UI Color Palette
      colors: {
        // Background colors
        'soft-bg': '#E5E5E5',
        'soft-bg-light': '#F0F0F0',
        // Card & Surface colors
        'soft-white': '#FFFFFF',
        // Text & Elements
        'soft-dark': '#1A1A1A',
        'soft-gray': '#2D2D2D',
        // Inactive elements
        'soft-inactive': '#F5F5F5',
        // Accent colors (kept from original for brand)
        'soft-accent': '#6366f1',
        'soft-accent-light': '#818cf8',
      },
      // Box Shadow for Soft UI cards
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
      },
      // Border Radius for Soft UI
      borderRadius: {
        'soft': '16px',
      },
      keyframes: {
        cubeSpin: {
          from: { transform: "rotateX(22deg) rotateY(0deg)" },
          to:   { transform: "rotateX(22deg) rotateY(360deg)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        cubeSpin:   "cubeSpin 10s linear infinite",
        fadeInUp:   "fadeInUp 0.6s ease both",
        fadeIn:     "fadeIn 0.8s ease both",
        float:      "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
