// astro.config.mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/postcss";

export default defineConfig({
  site: "https://daily-a11y.com",
  base: "/",
  trailingSlash: "always",
  integrations: [react()],
  vite: {
    css: {
      postcss: {
        plugins: [tailwindcss()],
      },
    },
  },
});
