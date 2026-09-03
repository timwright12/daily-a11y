// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,jsx,js}"],
  theme: {
    extend: {
      colors: {
        // Modeled on a printed standards document, not a UI brand kit.
        // signal/moss are functional (fail/pass), never decorative.
        paper: "#faf8f4",
        ink: "#1c1917",
        // Darker than the 4.5:1 AA minimum on purpose: small mono labels
        // need headroom against font-fallback rendering (a slow/blocked
        // Google Font's fallback face measurably lightens effective
        // contrast at these sizes, even though the CSS color is unchanged).
        "ink-quiet": "#524c44",
        signal: "#8b2e2e",
        "signal-bg": "#f7edea",
        "signal-panel-label": "#6e2424",
        moss: "#3f5c3f",
        "moss-bg": "#edf2ea",
        "moss-panel-label": "#334a33",
        rule: "#d9d3c7",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ['"Source Sans 3"', "system-ui", "sans-serif"],
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          '"SF Mono"',
          "Consolas",
          "monospace",
        ],
      },
      // Every vertical gap in the design is a multiple of 0.5rem.
      spacing: {
        18: "4.5rem", // space * 9 (padding-top: calc(var(--space) * 9) equivalents)
      },
    },
  },
};
