module.exports = {
  setupFiles: ["./tests/setupEnv.js"], // Env variables ke liye
  setupFilesAfterEnv: ["./jest.setup.js"], // Jest setup
  testEnvironment: "jsdom", // React ke tests ke liye
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest", // Babel Jest transform use kar rahe hain
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy", // CSS imports ko mock karne ke liye
  },
};
