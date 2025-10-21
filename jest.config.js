module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|mjs)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(date-fns|@mui/x-date-pickers|@standard-schema|@reduxjs/toolkit)/)',
  ],
  moduleNameMapper: {
    '^@mui/x-date-pickers(.*)$': '<rootDir>/src/__mocks__/datePickersMock.js',
    '^date-fns(.*)$': '<rootDir>/src/__mocks__/dateFnsMock.js',
    '^@standard-schema/(.*)$': '<rootDir>/node_modules/@standard-schema/$1',
    '^@reduxjs/toolkit/query/react$': '<rootDir>/node_modules/@reduxjs/toolkit/dist/query/react/index.js',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  // Add support for ES modules
  extensionsToTreatAsEsm: ['.jsx', '.js'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};
