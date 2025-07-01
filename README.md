# AR Brochure App

An Augmented Reality application that transforms static brochures into interactive 3D experiences. Built with React, TypeScript, Three.js, and mind-ar-js.

## 🎯 Features

- **Image Tracking**: Detect and track physical brochures using mind-ar-js
- **3D Model Rendering**: Display interactive 3D models with Three.js
- **Mobile-First**: Optimized for iOS and Android devices
- **Tap Interactions**: Touch-to-interact with 3D models using raycasting
- **Performance Analytics**: Real-time user interaction tracking via Feishu API
- **TDD Approach**: Test-driven development with Jest

## 🏗️ Project Structure

```
ARBrochure/
├── packages/
│   ├── frontend/          # React TypeScript frontend
│   ├── backend/           # Node.js Express API server
│   └── shared/            # Shared types and utilities
├── assets/                # 3D models, textures, AR targets
├── tests/                 # Integration tests
├── Docs/                  # Documentation
└── public/                # Static assets
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Mobile device with camera for testing

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ARBrochure
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment templates
   cp packages/backend/.env.example packages/backend/.env
   
   # Edit the .env file with your Feishu API credentials
   nano packages/backend/.env
   ```

4. **Start development servers**
   ```bash
   # Start both frontend and backend
   pnpm dev:all
   
   # Or start individually
   pnpm dev          # Frontend only (port 3000)
   pnpm dev:backend  # Backend only (port 3001)
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/api/health

## 📱 Mobile Testing

To test on mobile devices:

1. Ensure your mobile device is on the same network
2. Find your computer's IP address
3. Access: `http://YOUR_IP:3000`
4. Enable camera permissions when prompted

## 🧪 Testing

This project follows Test-Driven Development (TDD):

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## 🔧 Development Commands

```bash
# Development
pnpm dev:all              # Start all packages in development mode
pnpm dev                  # Start frontend only
pnpm dev:backend         # Start backend only

# Building
pnpm build:all           # Build all packages
pnpm build               # Build frontend only
pnpm build:backend       # Build backend only

# Testing
pnpm test                # Run all tests
pnpm test:watch          # Run tests in watch mode

# Code Quality
pnpm lint                # Lint all packages
pnpm type-check          # TypeScript type checking
```

## 🏛️ Architecture

### Frontend (React + Three.js + mind-ar-js)
- **React 18**: UI components and state management
- **Three.js**: 3D graphics rendering
- **mind-ar-js**: AR image tracking engine
- **TypeScript**: Type safety and developer experience
- **Styled Components**: CSS-in-JS styling
- **Vite**: Fast development and optimized builds

### Backend (Node.js + Express)
- **Express**: REST API server
- **TypeScript**: Type-safe backend development
- **Feishu API**: OA system integration and analytics
- **Rate Limiting**: API protection and abuse prevention
- **Security**: Helmet, CORS, and input validation

### Shared Package
- **Common Types**: Shared interfaces and types
- **Utilities**: Reusable functions and constants
- **API Contracts**: Request/response type definitions

## 📊 Performance Monitoring

The app collects anonymous usage analytics:

- App launch events
- Model interaction tracking
- Session duration
- AR tracking performance

Data is stored in Feishu Base for analysis and reporting.

## 🔒 Security Considerations

- Environment variables for sensitive data
- Rate limiting on API endpoints
- CORS protection
- Helmet security headers
- Input validation and sanitization

## 🚀 Deployment

### Frontend Deployment
```bash
pnpm build
# Deploy dist/ folder to your preferred hosting service
```

### Backend Deployment
```bash
pnpm build:backend
# Deploy to your Node.js hosting service
```

### Environment Variables

Required for production:

```env
# Backend
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# Feishu API
FEISHU_APP_ID=your_app_id
FEISHU_APP_SECRET=your_app_secret
FEISHU_TABLE_ID=your_table_id

# Security
JWT_SECRET=your_secure_secret
```

## 📖 API Documentation

### Analytics Endpoints
- `POST /api/analytics/events` - Log user interaction events
- `GET /api/analytics/stats` - Retrieve usage statistics

### Feishu Integration
- `GET /api/feishu/config` - Fetch app configuration
- `POST /api/feishu/data` - Store interaction data

### Health & Status
- `GET /api/health` - Server health check

## 🤝 Contributing

1. Follow TDD methodology (Red-Green-Refactor)
2. Write tests before implementing features
3. Maintain TypeScript strict mode compliance
4. Use conventional commit messages
5. Ensure mobile compatibility

## 📝 License

See [LICENSE](./LICENSE) file for details.

## 🔗 Documentation

- [Technical Specification](./Docs/Spec.md)
- [mind-ar-js Documentation](https://hiukim.github.io/mind-ar-js-doc/)
- [Three.js Documentation](https://threejs.org/docs/)
- [Feishu API Documentation](https://open.feishu.cn/document/)

## 🆘 Troubleshooting

### Common Issues

1. **Camera permissions denied**
   - Ensure HTTPS or localhost
   - Check browser camera settings

2. **AR tracking not working**
   - Verify target image quality
   - Ensure adequate lighting
   - Check mind-ar-js compatibility

3. **Performance issues on mobile**
   - Lower 3D model polygon count
   - Optimize texture sizes
   - Check frame rate monitoring

For more detailed troubleshooting, see the [Technical Specification](./Docs/Spec.md).
