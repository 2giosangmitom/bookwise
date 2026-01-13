import { defineConfig, globalIgnores } from "eslint/config";
import eslintJs from "@eslint/js";
import eslintTs from "typescript-eslint";
import prettier from "eslint-plugin-prettier/recommended";

export default defineConfig(
  eslintJs.configs.recommended,
  eslintTs.configs.recommended,
  prettier,
  globalIgnores(["**/dist/**", "**/node_modules/**"]),
  {
    rules: {
      "@typescript-eslint/no-floating-promises": "off",
    },
  },
);
