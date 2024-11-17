// jest.config.cjs
module.exports = {
  testEnvironment: "jest-environment-jsdom",  // Explicitly refer to the jsdom environment
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",  // Use babel-jest for transforming code
  },
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  testMatch: [
    "<rootDir>/pages/radars/tests/**/*.test.js"  // Ensure Jest looks in the right directory for tests
  ],
};
