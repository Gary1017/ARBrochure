// Mock GLTFLoader
const GLTFLoader = jest.fn().mockImplementation(() => ({
  load: jest.fn(),
}));

// Mock other Three.js examples if needed
const OrbitControls = jest.fn().mockImplementation(() => ({
  enableDamping: jest.fn(),
  dampingFactor: jest.fn(),
  screenSpacePanning: jest.fn(),
  minDistance: jest.fn(),
  maxDistance: jest.fn(),
  maxPolarAngle: jest.fn(),
}));

module.exports = {
  GLTFLoader,
  OrbitControls,
}; 