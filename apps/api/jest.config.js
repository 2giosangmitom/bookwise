/** @type {import("jest").Config} */
const config = {
  transform: {
    "^.+\\.(t|j)s?$": ["@swc/jest"],
  },
  testEnvironment: "node",
};

module.exports = config;
