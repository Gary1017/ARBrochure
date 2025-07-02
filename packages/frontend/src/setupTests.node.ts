// Setup for Node.js test environment (for service tests)

// Mock crypto.randomUUID FIRST - with counter for unique values
let uuidCounter = 0;
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: jest.fn(() => `mock-uuid-${++uuidCounter}`),
  },
  writable: true,
  configurable: true,
});

// Also set it on global for backward compatibility
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => `mock-uuid-${++uuidCounter}`),
  },
  writable: true,
  configurable: true,
});

// Mock fetch with proper Jest mock functions
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: jest.fn(() => Promise.resolve({ success: true })),
    text: jest.fn(() => Promise.resolve('')),
    blob: jest.fn(() => Promise.resolve(new Blob())),
    arrayBuffer: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
    headers: {},
    redirected: false,
    type: 'basic',
    url: '',
    clone: jest.fn(),
    body: null,
    bodyUsed: false,
  } as any)
);

// Mock requestAnimationFrame for Three.js
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn(); 