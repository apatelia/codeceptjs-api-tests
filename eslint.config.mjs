import eslintJs from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import teslint from "typescript-eslint";

export default [
  {
    files: [ "**/*.{js,ts}" ]
  },
  {
    ignores: [
      "node_modules/*",
      "reports/*",
      "output/*",
      "eslint.config.mjs",
    ]
  },
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  eslintJs.configs.recommended,
  ...teslint.configs.recommended,
  {
    plugins: {
      "@stylistic": stylistic,
      "unused-imports": unusedImports,
    }
  },
  {
    rules: {
      "no-unused-vars": "off",
      "eqeqeq": [ "error", "smart" ],
      "no-console": "error",
      "no-warning-comments": "warn",
      "unused-imports/no-unused-imports": "error",
      "@stylistic/quotes": [ "error", "single" ],
      "@stylistic/semi": [ "error", "always" ],
      "@stylistic/one-var-declaration-per-line": [ "error", "always" ],
      "@stylistic/object-curly-spacing": [ "error", "always" ],
      "@stylistic/indent": [ "error", 2 ],
      "@stylistic/linebreak-style": [ "error", "unix" ],
      "@stylistic/no-trailing-spaces": "error",
      "@stylistic/array-bracket-newline": [ "error", { "multiline": true } ],
      "@stylistic/array-bracket-spacing": [ "error", "always" ],
      "@stylistic/block-spacing": [ "error", "always" ],
      "@stylistic/space-before-function-paren": "error",
      "@stylistic/comma-dangle": [ "error", "only-multiline" ],
      "@stylistic/comma-spacing": [ "error", { "before": false, "after": true } ],
      "@stylistic/eol-last": [ "error", "always" ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/no-deprecated": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "vars": "all",
          "args": "all",
          "caughtErrors": "all",
        }
      ],
    }
  }
];
