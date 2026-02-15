import cSpellConfigs from "@cspell/eslint-plugin/configs";
import eslintJs from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import checkFile from "eslint-plugin-check-file";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import eslintTs from "typescript-eslint";

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
  cSpellConfigs.recommended,
  eslintJs.configs.recommended,
  ...eslintTs.configs.recommended,
  {
    plugins: {
      "@stylistic": stylistic,
      "unused-imports": unusedImports,
      "check-file": checkFile
    }
  },
  {
    rules: {
      "no-unused-vars": "off",
      "eqeqeq": [ "error", "smart" ],
      "no-console": "error",
      "no-warning-comments": "warn",
      "unused-imports/no-unused-imports": "error",
      "@stylistic/max-len": [
        "error",
        {
          "code": 100,
          "ignoreComments": true,
          "ignoreUrls": true,
          "ignoreStrings": true,
          "ignoreTemplateLiterals": true
        } ],
      "@stylistic/indent": [ "error", 2 ],
      "@stylistic/linebreak-style": [ "error", "unix" ],
      "@stylistic/no-trailing-spaces": "error",
      "@stylistic/quotes": [ "error", "single" ],
      "@stylistic/semi": [ "error", "always" ],
      "@stylistic/no-extra-semi": "error",
      "@stylistic/no-multi-spaces": "error",
      "@stylistic/one-var-declaration-per-line": [ "error", "always" ],
      "@stylistic/object-curly-spacing": [ "error", "always" ],
      "@stylistic/array-bracket-newline": [ "error", { "multiline": true } ],
      "@stylistic/array-bracket-spacing": [ "error", "always" ],
      "@stylistic/block-spacing": [ "error", "always" ],
      "@stylistic/space-before-function-paren": "error",
      "@stylistic/comma-dangle": [ "error", "only-multiline" ],
      "@stylistic/comma-spacing": [ "error", { "before": false, "after": true } ],
      "@stylistic/keyword-spacing": [ "error", { "before": true, "after": true } ],
      "@stylistic/no-multiple-empty-lines": "error",
      "@stylistic/multiline-ternary": [ "error", "always" ],
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
      "@typescript-eslint/naming-convention": [
        "error",
        { selector: [ "variableLike", "memberLike" ], format: [ "camelCase" ] },
        { selector: [ "typeLike", "enumMember" ], format: [ "PascalCase" ] },
        { selector: "parameter", format: [ "camelCase", "PascalCase" ] },
        {
          selector: "classProperty",
          modifiers: [ "private" ],
          format: [ "camelCase" ],
          leadingUnderscore: "require"
        },
        {
          selector: "memberLike",
          modifiers: [ "static", "readonly" ],
          format: [ "UPPER_CASE" ]
        },
        {
          selector: "interface",
          format: [ "PascalCase" ],
          custom: {
            regex: "^I[A-Z]",
            match: false
          }
        },
        {
          selector: "objectLiteralProperty",
          format: null,
          modifiers: [ "requiresQuotes" ]
        },
        {
          selector: "objectLiteralProperty",
          format: [ "camelCase", "PascalCase" ],
        }
      ],
      "@cspell/spellchecker": [
        "warn",
        {
          configFile: new URL("./cspell.json", import.meta.url).toString(),
        }
      ]
    }
  },
  {
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        {
          "./tests/**": "*.spec",
          "./schemas/**": "*.schema",
        },
        {
          errorMessage: '"{{target}}" does not match the file naming convention "{{pattern}}.ts"'
        }
      ]
    }
  }
];
