import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import pluginQuery from "@tanstack/eslint-plugin-query";

export default defineConfig([
  { ignores: ["dist"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  ...pluginQuery.configs["flat/recommended"],
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: {
        version: "18.3",
      },
    },
    rules: {
      "no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^[_A-Z]",
          argsIgnorePattern: "^[_A-Z]",
        },
      ],
    },
  },
  reactHooks.configs["recommended-latest"],
  reactRefresh.configs.vite,
]);
