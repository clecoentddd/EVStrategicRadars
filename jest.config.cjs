const { config } = require('dotenv'); // Use require for CommonJS
config({ path: '.env.local' }); // Load environment variables
const path = require('path');

console.log('jest.config.cjs path:',  path.resolve(__dirname, './jest.config.cjs')); // Reference your setup file if needed

module.exports = {
  testEnvironment: "jest-environment-jsdom",  // Explicitly refer to the jsdom environment
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",  // Use babel-jest for transforming code
  },
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  testMatch: [
    "<rootDir>/pages/radars/tests/**/*.test.js"  // Ensure Jest looks in the right directory for tests
  ],
  setupFiles: [path.resolve(__dirname, './jest.config.cjs')], // Reference your setup file if needed
};
