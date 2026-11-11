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
app.use(cors());         // Enables Cross-Origin Resource Sharing for frontend

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

  res.status(200).json({
    status: 'ok',
    message: 'Cartiva Backend Server is running healthy 🚀',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatusMap[dbState] || 'unknown',
      connected: dbState === 1
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
