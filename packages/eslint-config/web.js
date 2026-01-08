/// @ts-check

import { defineConfig } from "eslint/config";
import baseConfig from "./base.js";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig(...baseConfig, ...nextVitals, ...nextTs);
