import '@testing-library/jest-dom';

// Set up crypto mock FIRST before any other imports
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mock-uuid-12345'),
  },
  writable: true,
  configurable: true,
});

// Also set it on global for backward compatibility
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mock-uuid-12345'),
  },
  writable: true,
  configurable: true,
});

// Mock fetch globally with proper response structure
const mockFetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve({ success: true }),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    headers: new Headers(),
    redirected: false,
    type: 'basic',
    url: '',
    clone: jest.fn(),
    body: null,
    bodyUsed: false,
    bytes: () => Promise.resolve(new Uint8Array()),
    formData: () => Promise.resolve(new FormData()),
  } as unknown as Response)
);

global.fetch = mockFetch;

// Mock matchMedia - guard against missing window
if (typeof window !== 'undefined' && window.matchMedia === undefined) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Mock WebGL context for Three.js
const mockWebGLContext = {
  canvas: typeof document !== 'undefined' ? document.createElement('canvas') : null,
  drawArrays: jest.fn(),
  drawElements: jest.fn(),
  createBuffer: jest.fn(() => ({})),
  bindBuffer: jest.fn(),
  bufferData: jest.fn(),
  createShader: jest.fn(() => ({})),
  shaderSource: jest.fn(),
  compileShader: jest.fn(),
  createProgram: jest.fn(() => ({})),
  attachShader: jest.fn(),
  linkProgram: jest.fn(),
  useProgram: jest.fn(),
  getAttribLocation: jest.fn(() => 0),
  getUniformLocation: jest.fn(() => ({})),
  enableVertexAttribArray: jest.fn(),
  vertexAttribPointer: jest.fn(),
  uniformMatrix4fv: jest.fn(),
  uniform3fv: jest.fn(),
  uniform1i: jest.fn(),
  clearColor: jest.fn(),
  clear: jest.fn(),
  viewport: jest.fn(),
  enable: jest.fn(),
  depthFunc: jest.fn(),
  blendFunc: jest.fn(),
  createTexture: jest.fn(() => ({})),
  bindTexture: jest.fn(),
  texImage2D: jest.fn(),
  texParameteri: jest.fn(),
  generateMipmap: jest.fn(),
  activeTexture: jest.fn(),
  uniform1f: jest.fn(),
  uniform2f: jest.fn(),
  uniform3f: jest.fn(),
  uniform4f: jest.fn(),
  uniform1fv: jest.fn(),
  uniform2fv: jest.fn(),
  uniform4fv: jest.fn(),
  uniformMatrix3fv: jest.fn(),
  getError: jest.fn(() => 0),
  getParameter: jest.fn(() => 0),
  getExtension: jest.fn(() => null),
  createFramebuffer: jest.fn(() => ({})),
  bindFramebuffer: jest.fn(),
  framebufferTexture2D: jest.fn(),
  checkFramebufferStatus: jest.fn(() => 36053), // FRAMEBUFFER_COMPLETE
  deleteFramebuffer: jest.fn(),
  createRenderbuffer: jest.fn(() => ({})),
  bindRenderbuffer: jest.fn(),
  renderbufferStorage: jest.fn(),
  framebufferRenderbuffer: jest.fn(),
  deleteRenderbuffer: jest.fn(),
  scissor: jest.fn(),
  clearDepth: jest.fn(),
  depthMask: jest.fn(),
  colorMask: jest.fn(),
  stencilMask: jest.fn(),
  stencilFunc: jest.fn(),
  stencilOp: jest.fn(),
  cullFace: jest.fn(),
  frontFace: jest.fn(),
  lineWidth: jest.fn(),
  polygonOffset: jest.fn(),
  sampleCoverage: jest.fn(),
  hint: jest.fn(),
  finish: jest.fn(),
  flush: jest.fn(),
  isContextLost: jest.fn(() => false),
  getSupportedExtensions: jest.fn(() => []),
  getShaderInfoLog: jest.fn(() => ''),
  getShaderParameter: jest.fn(() => 1),
  getProgramInfoLog: jest.fn(() => ''),
  getProgramParameter: jest.fn(() => 1),
  getActiveAttrib: jest.fn(() => ({ name: 'position', size: 3, type: 35665 })),
  getActiveUniform: jest.fn(() => ({ name: 'modelViewMatrix', size: 1, type: 35676 })),
  getVertexAttrib: jest.fn(() => 0),
  getVertexAttribOffset: jest.fn(() => 0),
  getBufferParameter: jest.fn(() => 0),
  getFramebufferAttachmentParameter: jest.fn(() => 0),
  getRenderbufferParameter: jest.fn(() => 0),
  getTexParameter: jest.fn(() => 0),
  isBuffer: jest.fn(() => true),
  isFramebuffer: jest.fn(() => true),
  isProgram: jest.fn(() => true),
  isRenderbuffer: jest.fn(() => true),
  isShader: jest.fn(() => true),
  isTexture: jest.fn(() => true),
  validateProgram: jest.fn(),
  deleteShader: jest.fn(),
  deleteProgram: jest.fn(),
  deleteBuffer: jest.fn(),
  deleteTexture: jest.fn(),
  detachShader: jest.fn(),
  readPixels: jest.fn(),
  copyTexImage2D: jest.fn(),
  copyTexSubImage2D: jest.fn(),
  texSubImage2D: jest.fn(),
  compressedTexImage2D: jest.fn(),
  compressedTexSubImage2D: jest.fn(),
  pixelStorei: jest.fn(),
  bindAttribLocation: jest.fn(),
  vertexAttrib1f: jest.fn(),
  vertexAttrib1fv: jest.fn(),
  vertexAttrib2f: jest.fn(),
  vertexAttrib2fv: jest.fn(),
  vertexAttrib3f: jest.fn(),
  vertexAttrib3fv: jest.fn(),
  vertexAttrib4f: jest.fn(),
  vertexAttrib4fv: jest.fn(),
  disableVertexAttribArray: jest.fn(),
  uniform1iv: jest.fn(),
  uniform2i: jest.fn(),
  uniform2iv: jest.fn(),
  uniform3i: jest.fn(),
  uniform3iv: jest.fn(),
  uniform4i: jest.fn(),
  uniform4iv: jest.fn(),
  uniformMatrix2fv: jest.fn(),
  getAttachedShaders: jest.fn(() => []),
  bufferSubData: jest.fn(),
  texParameterf: jest.fn(),
  depthRange: jest.fn(),
  disable: jest.fn(),
  isEnabled: jest.fn(() => false),
  clearStencil: jest.fn(),
  stencilOpSeparate: jest.fn(),
  stencilFuncSeparate: jest.fn(),
  stencilMaskSeparate: jest.fn(),
};

// Mock getContext for both WebGL and 2D contexts - guard against missing HTMLCanvasElement
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = jest.fn((contextId) => {
    if (contextId === 'webgl' || contextId === 'webgl2') {
      return mockWebGLContext as any;
    }
    if (contextId === '2d') {
      return {
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        getImageData: jest.fn(() => ({ data: new Uint8ClampedArray() })),
        putImageData: jest.fn(),
        createImageData: jest.fn(() => ({ data: new Uint8ClampedArray() })),
        setTransform: jest.fn(),
        drawImage: jest.fn(),
        save: jest.fn(),
        fillText: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        stroke: jest.fn(),
        translate: jest.fn(),
        scale: jest.fn(),
        rotate: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        measureText: jest.fn(() => ({ width: 0 })),
        transform: jest.fn(),
        rect: jest.fn(),
        clip: jest.fn(),
      };
    }
    return null;
  });

  HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,mock');
  
  HTMLCanvasElement.prototype.getBoundingClientRect = jest.fn(() => ({
    top: 0,
    left: 0,
    width: 800,
    height: 600,
    right: 800,
    bottom: 600,
    x: 0,
    y: 0,
    toJSON: jest.fn(),
  }));
}

// Mock requestAnimationFrame for Three.js
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn(); 