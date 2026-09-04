// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,jsx,js}"],
  theme: {
    extend: {
      colors: {
        // Modeled on a printed standards document, not a UI brand kit.
        // signal/moss are functional (fail/pass), never decorative.
        paper: "var(--color-paper)",
        ink: "var(--color-ink)",
        // Darker than the 4.5:1 AA minimum on purpose: small mono labels
        // need headroom against font-fallback rendering (a slow/blocked
        // Google Font's fallback face measurably lightens effective
        // contrast at these sizes, even though the CSS color is unchanged).
        "ink-quiet": "var(--color-ink-quiet)",
        signal: "var(--color-signal)",
        "signal-bg": "var(--color-signal-bg)",
        "signal-panel-label": "var(--color-signal-panel-label)",
        moss: "var(--color-moss)",
        "moss-bg": "var(--color-moss-bg)",
        "moss-panel-label": "var(--color-moss-panel-label)",
        rule: "var(--color-rule)",
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
