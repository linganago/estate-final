export default {
  testEnvironment: 'node',
  transform: {},

  testMatch: ['**/__tests__/**/*.test.js'],

  collectCoverageFrom: [
    'api/**/*.js',
    '!api/index.js',
  ],

  testTimeout: 60000,
};