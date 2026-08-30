import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";

const browserGlobals = {
  document: "readonly",
  window: "readonly",
  localStorage: "readonly",
  navigator: "readonly",
};

export default [
  { ignores: ["dist/**"] },
  js.configs.recommended,
  prettierConfig,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: browserGlobals,
    },
  },
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: browserGlobals,
    },
  },
  {
    files: ["*.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { process: "readonly" },
    },
  },
];
