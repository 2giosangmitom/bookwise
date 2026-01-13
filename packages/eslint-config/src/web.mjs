import { defineConfig } from "eslint/config";
import baseConfig from "./base.mjs";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig(...baseConfig, ...nextVitals, ...nextTs, {
  rules: {
    "react-hooks/purity": "off",
  },
});
