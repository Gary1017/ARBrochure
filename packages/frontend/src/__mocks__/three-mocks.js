// Mock Vector3
const Vector3 = jest.fn().mockImplementation(function(x = 0, y = 0, z = 0) {
  return {
    x, y, z,
    set: jest.fn().mockReturnThis(),
    clone: jest.fn().mockReturnValue(new Vector3(x, y, z)),
    copy: jest.fn().mockReturnThis(),
    add: jest.fn().mockReturnThis(),
    sub: jest.fn().mockReturnThis(),
    multiplyScalar: jest.fn().mockReturnThis(),
    normalize: jest.fn().mockReturnThis(),
    length: jest.fn().mockReturnValue(Math.sqrt(x*x + y*y + z*z)),
    distanceTo: jest.fn().mockImplementation((other) => {
      const dx = x - other.x;
      const dy = y - other.y;
      const dz = z - other.z;
      return Math.sqrt(dx*dx + dy*dy + dz*dz);
    }),
    lerp: jest.fn().mockReturnThis(),
  };
});

// Mock Quaternion
const Quaternion = jest.fn().mockImplementation(function(x = 0, y = 0, z = 0, w = 1) {
  return {
    x, y, z, w,
    set: jest.fn().mockReturnThis(),
    clone: jest.fn().mockReturnValue(new Quaternion(x, y, z, w)),
    copy: jest.fn().mockReturnThis(),
    setFromEuler: jest.fn().mockReturnThis(),
    normalize: jest.fn().mockReturnThis(),
    dot: jest.fn().mockImplementation((other) => x*other.x + y*other.y + z*other.z + w*other.w),
    slerp: jest.fn().mockReturnThis(),
  };
});

// Mock Euler
const Euler = jest.fn().mockImplementation(function(x = 0, y = 0, z = 0, order = 'XYZ') {
  return {
    x, y, z, order,
    set: jest.fn().mockReturnThis(),
    clone: jest.fn().mockReturnValue(new Euler(x, y, z, order)),
  };
});

// Mock Matrix4
const Matrix4 = jest.fn().mockImplementation(() => {
  const elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const obj = {
    elements,
    identity: jest.fn().mockReturnThis(),
    makeRotationY: jest.fn().mockReturnThis(),
    compose: jest.fn().mockReturnThis(),
    decompose: jest.fn().mockImplementation((position, quaternion, scale) => {
      position.set(0, 0, 0);
      quaternion.set(0, 0, 0, 1);
      scale.set(1, 1, 1);
      return obj;
    }),
    clone: jest.fn().mockReturnValue({
      elements: [...elements],
      identity: jest.fn().mockReturnThis(),
      makeRotationY: jest.fn().mockReturnThis(),
      compose: jest.fn().mockReturnThis(),
      decompose: jest.fn().mockImplementation((position, quaternion, scale) => {
        position.set(0, 0, 0);
        quaternion.set(0, 0, 0, 1);
        scale.set(1, 1, 1);
        return obj;
      }),
      copy: jest.fn().mockReturnThis(),
      equals: jest.fn().mockReturnValue(true),
      determinant: jest.fn().mockReturnValue(1),
    }),
    copy: jest.fn().mockReturnThis(),
    equals: jest.fn().mockReturnValue(true),
    determinant: jest.fn().mockReturnValue(1),
  };
  return obj;
});

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
  Vector3,
  Quaternion,
  Euler,
  Matrix4,
  GLTFLoader,
  OrbitControls,
}; 