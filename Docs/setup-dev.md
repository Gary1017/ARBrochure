# Development Setup Guide

This guide will help you set up the AR Brochure development environment.

## 🛠️ Environment Configuration

### 1. Backend Environment Variables

Create a `.env` file in `packages/backend/` with the following variables:

```env
# Backend Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Feishu API Configuration (Required for analytics)
FEISHU_APP_ID=your_feishu_app_id_here
FEISHU_APP_SECRET=your_feishu_app_secret_here
FEISHU_BASE_URL=https://open.feishu.cn
FEISHU_TABLE_ID=your_feishu_table_id_here

# Security
JWT_SECRET=your_super_secure_jwt_secret_key_here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug

# AR Configuration
AR_TARGET_IMAGE_URL=https://example.com/target-image.png
AR_MODELS_BASE_URL=https://example.com/models/

# Analytics
ANALYTICS_RETENTION_DAYS=30
ENABLE_ANALYTICS=true
```

### 2. Feishu API Setup

To integrate with Feishu Database API:

1. **Create Feishu App**:
   - Go to [Feishu Open Platform](https://open.feishu.cn/)
   - Create a new app
   - Note down your `App ID` and `App Secret`

2. **Create Feishu Base (Database)**:
   - Create a new Base in Feishu
   - Create a table for AR events with these fields:
     - `timestamp` (DateTime)
     - `event_type` (Text)
     - `model_id` (Text)
     - `session_id` (Text)
     - `user_id` (Text)
   - Note down the `Table ID`

3. **Configure Permissions**:
   - Grant your app access to the Base
   - Enable read/write permissions

### 3. Project Installation Steps

```bash
# 1. Install dependencies
pnpm install

# 2. Create backend environment file
cp packages/backend/.env.example packages/backend/.env

# 3. Edit the .env file with your Feishu credentials
# (Use your preferred editor)
code packages/backend/.env
# or
nano packages/backend/.env

# 4. Build shared package first
pnpm --filter shared build

# 5. Start development servers
pnpm dev:all
```

## 🔧 Development Tools Setup

### VS Code Extensions (Recommended)

Install these extensions for the best development experience:

- **TypeScript and JavaScript Language Features** (built-in)
- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **Jest Runner**
- **ESLint**
- **Prettier**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**

### Browser Setup for AR Testing

1. **Chrome/Edge (Recommended)**:
   - Enable WebXR flags in chrome://flags
   - Allow camera access for localhost

2. **Firefox**:
   - Enable WebXR in about:config
   - Set `dom.webxr.enabled` to true

3. **Mobile Testing**:
   - Ensure your mobile device is on the same network
   - Access via your computer's IP address
   - Enable camera permissions when prompted

## 📱 Mobile Development Workflow

### 1. Network Setup
```bash
# Find your computer's IP address
# Windows:
ipconfig
# Look for "IPv4 Address" under your network adapter

# macOS/Linux:
ifconfig
# Look for inet address under your network interface
```

### 2. Mobile Access
- Connect your mobile device to the same WiFi network
- Open browser and navigate to: `http://YOUR_IP_ADDRESS:3000`
- Accept camera permissions when prompted

### 3. Debug Mobile Issues
- Use Chrome DevTools for remote debugging
- Check browser console for AR-related errors
- Monitor network requests for API issues

## 🧪 Testing Setup

### 1. Run Tests
```bash
# All tests
pnpm test

# Frontend tests only
pnpm --filter frontend test

# Backend tests only
pnpm --filter backend test

# Watch mode for development
pnpm test:watch
```

### 2. Coverage Reports
```bash
# Generate coverage report
pnpm test:coverage

# View coverage in browser
open packages/frontend/coverage/lcov-report/index.html
```

## 🚀 Build and Deploy

### Development Builds
```bash
# Build all packages
pnpm build:all

# Build frontend only
pnpm build

# Build backend only
pnpm build:backend
```

### Production Deployment
1. Set environment variables for production
2. Build the project: `pnpm build:all`
3. Deploy frontend `dist/` folder to static hosting
4. Deploy backend to Node.js hosting service

## 🔍 Troubleshooting

### Common Development Issues

1. **Port conflicts**:
   ```bash
   # Check what's using port 3000/3001
   netstat -ano | findstr :3000
   # Kill the process if needed
   ```

2. **TypeScript errors**:
   ```bash
   # Clear TypeScript cache
   pnpm --filter frontend type-check
   pnpm --filter backend type-check
   ```

3. **Node modules issues**:
   ```bash
   # Clean install
   rm -rf node_modules packages/*/node_modules
   pnpm install
   ```

4. **AR not working**:
   - Check browser camera permissions
   - Ensure HTTPS or localhost
   - Verify target image quality
   - Check console for mind-ar-js errors

### Performance Optimization

1. **Frontend Performance**:
   - Monitor bundle size with `pnpm build --analyze`
   - Use React DevTools Profiler
   - Check Three.js performance with stats.js

2. **Backend Performance**:
   - Monitor API response times
   - Check database query performance
   - Use logging to identify bottlenecks

## 📚 Development Resources

- [mind-ar-js Documentation](https://hiukim.github.io/mind-ar-js-doc/)
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Feishu API Documentation](https://open.feishu.cn/document/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Git Workflow

1. **Branch naming**: `feature/description` or `fix/description`
2. **Commit messages**: Use conventional commits
3. **Before committing**:
   ```bash
   pnpm lint
   pnpm type-check
   pnpm test
   ```
4. **Create PR with**:
   - Clear description
   - Test results
   - Screenshots/videos for UI changes 