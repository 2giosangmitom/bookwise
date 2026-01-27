import { defineConfig } from "eslint/config";
import baseConfig from "./base.mjs";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import pluginQuery from "@tanstack/eslint-plugin-query";

export default defineConfig(...baseConfig, ...nextVitals, ...nextTs, ...pluginQuery.configs["flat/recommended"], {
  rules: {
    "react-hooks/purity": "off",
  },
});
