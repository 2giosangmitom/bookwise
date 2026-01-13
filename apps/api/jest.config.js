/** @type {import("jest").Config} */
const config = {
  testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.ts$": ["@swc/jest"],
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  testEnvironment: "node",
};

module.exports = config;
