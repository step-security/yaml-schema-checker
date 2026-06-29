const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    ignores: ["dist/"],
  },
  {
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 13,
      sourceType: "module",
      globals: {
        ...globals.commonjs,
        ...globals.es6,
        ...globals.jest,
        ...globals.node,
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      semi: ["error", "always"],
      quotes: [2, "double"],
      "comma-style": ["error", "last"],
    },
  },
];
