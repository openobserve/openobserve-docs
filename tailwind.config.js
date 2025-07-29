// tailwind.config.js
export default {
  content: [
    "./overrides/**/*.html", // For your footer.html, main.html
    "./docs/**/*.md", // If you use Markdown
    "./*.html", // Any other root-level custom files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
