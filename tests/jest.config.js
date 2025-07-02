module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['../packages/frontend/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../packages/frontend/src/$1',
    '^@shared/(.*)$': '<rootDir>/../packages/shared/src/$1',
    '^three/examples/jsm/(.*)$': '<rootDir>/../packages/frontend/src/__mocks__/three-mocks.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(three)/)',
  ],
  testMatch: [
    '<rootDir>/**/*.(test|spec).(ts|tsx)',
  ],
  collectCoverageFrom: [
    '../packages/frontend/src/**/*.(ts|tsx)',
    '../packages/backend/src/**/*.(ts|tsx)',
    '!../packages/frontend/src/**/*.d.ts',
    '!../packages/frontend/src/main.tsx',
    '!../packages/frontend/src/vite-env.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testTimeout: 10000,
  roots: ['<rootDir>'],
  modulePaths: ['<rootDir>/../packages/frontend/src', '<rootDir>/../packages/shared/src'],
  displayName: 'Integration Tests',
}; 