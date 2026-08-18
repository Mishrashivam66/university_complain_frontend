import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  // ==========================================
  // IGNORE BUILD FILES
  // ==========================================

  globalIgnores(["dist", "node_modules"]),

  // ==========================================
  // FRONTEND JS / JSX
  // ==========================================

  {
    files: ["**/*.{js,jsx}"],

    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    languageOptions: {
      globals: globals.browser,

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    rules: {
      // ==========================================
      // REACT HOOKS
      // ==========================================

      "react-hooks/set-state-in-effect": "off",

      // ==========================================
      // VITE FAST REFRESH
      // Allows Context + custom hooks in same file
      // ==========================================

      "react-refresh/only-export-components": "off",
    },
  },
]);
