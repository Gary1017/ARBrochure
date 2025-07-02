export default {
  projects: [
    {
      displayName: 'Components (jsdom)',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testEnvironmentOptions: {
        pretendToBeVisual: false,
        resources: 'usable',
      },
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@shared/(.*)$': '<rootDir>/../shared/src/$1',
        '^three/examples/jsm/(.*)$': '<rootDir>/src/__mocks__/three-mocks.js',
        '^canvas$': '<rootDir>/src/__mocks__/canvas.js',
      },
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          isolatedModules: true,
        }],
      },
      transformIgnorePatterns: [
        'node_modules/(?!(three)/)',
      ],
      testMatch: [
        '<rootDir>/src/components/**/__tests__/**/*.(ts|tsx)',
      ],
      testPathIgnorePatterns: [
        '<rootDir>/src/components/__tests__/ARScene.test.tsx', // Known issue: jsdom canvas.node dependency
      ],
      collectCoverageFrom: [
        'src/components/**/*.(ts|tsx)',
        '!src/**/*.d.ts',
      ],
      maxWorkers: 1,
    },
    {
      displayName: 'Services (node)',
      preset: 'ts-jest',
      testEnvironment: 'node',
      setupFiles: ['<rootDir>/src/setupTests.node.ts'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@shared/(.*)$': '<rootDir>/../shared/src/$1',
        '^three$': '<rootDir>/src/__mocks__/three-mocks.js',
        '^three/examples/jsm/(.*)$': '<rootDir>/src/__mocks__/three-mocks.js',
      },
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          isolatedModules: true,
        }],
      },
      transformIgnorePatterns: [
        'node_modules/(?!three)',
      ],
      testMatch: [
        '<rootDir>/src/services/**/__tests__/**/*.(ts|tsx)',
      ],
      collectCoverageFrom: [
        'src/services/**/*.(ts|tsx)',
        '!src/**/*.d.ts',
      ],
      maxWorkers: 1,
    },
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testTimeout: 10000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
}; 