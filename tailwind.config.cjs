// tailwind.config.cjs
module.exports = {
  content: ["./docs/**/*.{html,md}", "./overrides/**/*.{html,js}"],
  prefix: "tw-", // 👈 add prefix here
  safelist: [
    "tw-w-[500px]",
    "tw-w-[550px]",
    "tw-w-[560px]",
    "tw-w-[620px]",
    "tw-w-[700px]",
    "tw-w-72",
  ],
  theme: {
    extend: {},
    container: {
      screens: {
        sm: "30rem", // 672px (increased from 640px)
        md: "44rem", // 800px (increased from 768px)
        lg: "52rem", // 1088px (increased from 1024px)
        xl: "68rem", // 1360px (increased from 1280px)
        "2xl": "86rem", // 1600px (increased from 1536px)
      },
    },
  },
  plugins: [],
};
