import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  // JavaScript base rules
  js.configs.recommended,

  // TypeScript base rules
  ...tseslint.configs.recommended,

  // Custom project rules
  {
    files: ["**/*.{js,jsx,ts,tsx}"], // include JS + TS
    ignores: ["dist", "node_modules"],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },

    plugins: {
      prettier: prettierPlugin,
    },

    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "prettier/prettier": "error",
    },
  },
];
