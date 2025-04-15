module.exports = {
    transform: {
    "^.+\\.jsx?$": "babel-jest",
    },
    extensionsToTreatAsEsm: ['.js, test.js'],
    testEnvironment: "node",
  };