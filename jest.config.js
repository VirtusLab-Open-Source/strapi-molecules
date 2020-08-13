module.exports = {
  name: "Unit test",
  testMatch: ["**/packages/**/__tests__/?(*.)+(spec|test).(js|ts)"],
  transform: {},
  coverageDirectory: "./coverage/",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  collectCoverage: true,
  verbose: true,
};
