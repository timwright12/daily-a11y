import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import astro from "eslint-plugin-astro";
import prettierConfig from "eslint-config-prettier";

const browserGlobals = {
  document: "readonly",
  window: "readonly",
  localStorage: "readonly",
  navigator: "readonly",
};

export default [
  { ignores: ["dist/**", ".astro/**"] },
  js.configs.recommended,
  ...astro.configs.recommended,
  prettierConfig,
  {
    files: ["src/**/*.{js,jsx}"],
    plugins: { react, "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: browserGlobals,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
    settings: { react: { version: "detect" } },
  },
  {
    files: ["tests/**/*.{js,jsx}"],
    plugins: { react, "jsx-a11y": jsxA11y },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...browserGlobals, Event: "readonly" },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...react.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
    settings: { react: { version: "detect" } },
  },
  {
    files: ["*.config.js", "*.config.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { process: "readonly" },
    },
  },
  {
    // Inline <script> blocks in .astro files are linted by eslint-plugin-astro
    // as virtual *.astro/*.js (or *.ts, when @typescript-eslint/parser is
    // available) files. `dataLayer` is the Google Analytics gtag.js snippet's
    // own global (created by `window.dataLayer = ...` and referenced
    // unqualified afterward, per Google's standard snippet) — not a browser
    // API, so it isn't in eslint-plugin-astro's built-in globals.
    files: ["**/*.astro/*.js", "**/*.astro/*.ts"],
    languageOptions: {
      globals: { dataLayer: "writable" },
    },
  },
];
