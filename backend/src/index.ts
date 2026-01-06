import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { initializeDatabase, pool } from './db/database';
import { validateLLMConnection } from './services/llm';
import reviewsRouter from './routes/reviews';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - handles preflight requests
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['*'];

app.use(
  cors({
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Handle preflight requests for all routes
app.options('*', cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'running',
      },
    });
  } catch (error) {
    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
    });
  }
});

// API routes
app.use('/api/reviews', reviewsRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Fynd Review Management API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      submitReview: 'POST /api/reviews',
      getReviews: 'GET /api/reviews',
      getStats: 'GET /api/reviews/stats',
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', error);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : error.message,
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    console.log('='.repeat(60));
    console.log('Fynd Review Management API - Starting...');
    console.log('='.repeat(60));
    
    // Validate environment variables
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY environment variable is required');
    }
    
    // Initialize database
    console.log('\n[1/3] Initializing database...');
    await initializeDatabase();
    
    // Validate LLM connection
    console.log('\n[2/3] Validating LLM API connection...');
    await validateLLMConnection();
    
    // Start server
    console.log('\n[3/3] Starting HTTP server...');
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ API Base URL: http://localhost:${PORT}`);
      console.log('='.repeat(60) + '\n');
    });
    
  } catch (error) {
    console.error('\n✗ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

