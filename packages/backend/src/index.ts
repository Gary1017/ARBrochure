import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Basic health check route
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Analytics events endpoint
app.post('/api/analytics/events', (req, res) => {
  try {
    const event = req.body;
    
    // Validate event structure
    if (!event.timestamp || !event.event_type || !event.session_id || !event.user_id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event structure',
        message: 'Missing required fields: timestamp, event_type, session_id, user_id'
      });
    }

    // Log the event (in production, this would be sent to Feishu Database)
    console.log('Analytics Event:', {
      timestamp: event.timestamp,
      event_type: event.event_type,
      model_id: event.model_id,
      session_id: event.session_id,
      user_id: event.user_id
    });

    // TODO: Send to Feishu Database API
    // For now, just acknowledge receipt
    res.json({
      success: true,
      message: 'Event logged successfully',
      data: {
        event_id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });

  } catch (error) {
    console.error('Error processing analytics event:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process analytics event'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
}); 