const expoConfig = require("eslint-config-expo/flat");
const { defineConfig } = require("eslint/config");

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: [
      "node_modules/**",
      ".expo/**",
      "dist/**",
      "web-build/**",
      "coverage/**",
      // Git worktrees live inside the repo; their copies are linted on their
      // own checkout, and from here they sit outside every `files` pattern.
      ".claude/worktrees/**",
    ],
  },
  {
    rules: {
      // eslint-config-expo 56 enables React Compiler compatibility rules.
      // This project does not use the compiler, and these checks report false
      // positives for Reanimated SharedValues and stable icon registries.
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
    },
  },
  {
    // Node-only maintenance scripts (smoke checks, asset generation).
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        URL: "readonly",
        __dirname: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
      },
    },
  },
]);
