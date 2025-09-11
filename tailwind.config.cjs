// tailwind.config.cjs
module.exports = {
  content: ["./docs/**/*.{html,md}", "./overrides/**/*.{html,js}"],
  prefix: "tw-", // 👈 add prefix here
  theme: {
    extend: {},
  },
  plugins: [],
};
