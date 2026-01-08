/// @ts-check

import { defineConfig } from "eslint/config";
import baseConfig from "./base.js";
import globals from "globals";

export default defineConfig(...baseConfig, {
  languageOptions: {
    globals: {
      ...globals.node,
    },
  },
});
