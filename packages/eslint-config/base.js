/// @ts-check

import { defineConfig, globalIgnores } from "eslint/config";
import eslintJs from "@eslint/js";
import eslintTs from "typescript-eslint";
import prettier from "eslint-config-prettier/flat";
import process from "node:process";

export default defineConfig(
  eslintJs.configs.recommended,
  eslintTs.configs.recommendedTypeChecked,
  prettier,
  globalIgnores(["**/dist/**", "**/node_modules/**"]),
  {
    languageOptions: {
      sourceType: "module",
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.mjs", "*.js"],
        },
        tsconfigRootDir: process.cwd(),
      },
    },
  },
);
