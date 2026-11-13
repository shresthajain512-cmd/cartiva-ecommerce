const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// 1. Load Environment Variables from backend/.env
dotenv.config();

// 2. Initialize Express Application
const app = express();

// 3. Essential Middlewares
app.use(express.json()); // Parses incoming JSON payloads

// Enhanced Production-Ready CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL || 'https://cartiva-ecommerce.vercel.app',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()) : [])
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // 1. Allow non-browser requests (curl, server-to-server, automated test suites with no origin)
    if (!origin) return callback(null, true);

    // 2. Exact match against configured environment whitelist (production Vercel domain & approved origins)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // 3. In development mode only, allow localhost origins on any port
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    // 4. Reject unauthorized browser origins with deliberate CORS policy error
    const corsError = new Error('CORS policy: Request origin not authorized.');
    corsError.isCors = true;
    return callback(corsError);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// 4. Connect to Database (asynchronous, non-blocking)
connectDB();

// 5. Root Info Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    name: 'Cartiva API',
    description: 'Smart E-commerce RESTful API',
    version: '1.0.0',
    documentation: '/health'
  });
});

// 6. Objective 8: Health Check Endpoint
app.get('/health', (req, res) => {
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const dbState = mongoose.connection.readyState;
  const isConnected = dbState === 1;
  const statusCode = isConnected ? 200 : 503;

  res.status(statusCode).json({
    status: isConnected ? 'ok' : 'degraded',
    message: isConnected
      ? 'Cartiva Backend Server is running healthy 🚀'
      : 'Cartiva Backend Server is degraded: Database connection is unavailable',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatusMap[dbState] || 'unknown',
      connected: isConnected
    }
  });
});

// 7. Mount Feature API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 8. Error Handling Middlewares
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
app.use(notFound);      // 404 handler for undefined routes
app.use(errorHandler);  // Centralized JSON error response handler

// 9. Server Initialization & Clean Startup/Shutdown
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`\n========================================================`);
  console.log(`🚀 Cartiva Backend Server active on port ${PORT}`);
  console.log(`📍 Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`🩺 Health check : http://localhost:${PORT}/health`);
  console.log(`========================================================\n`);
});

// 10. Graceful Shutdown on SIGINT (Ctrl+C) and SIGTERM (kill)
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await mongoose.connection.close(false);
      console.log('MongoDB connection closed cleanly.');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err.message);
    }
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = app;
