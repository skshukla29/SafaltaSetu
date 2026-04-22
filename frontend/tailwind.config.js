module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        accent: "#2563EB",
        accent2: "#60A5FA",
        danger: "#F87171",
        warning: "#FBBF24",
        success: "#34D399",
      },
      backdropBlur: { glass: "16px" },
      fontFamily: { sans: ["Inter", "sans-serif"] },
    },
  },
  plugins: [],
}
