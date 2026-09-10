import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored / generated / native — not our source to lint.
    "public/vendor/**",
    "public/sw.js",
    "android/**",
    "capacitor/**",
    "scripts/**",
  ]),
  {
    rules: {
      // Pervasive in the admin list pages and a few service helpers where
      // rows come straight off `db.query`. Worth tightening with shared
      // row types later, but it shouldn't fail the lint in the meantime.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]);

export default eslintConfig;
