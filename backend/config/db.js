const mongoose = require('mongoose');

/**
 * Connect to MongoDB using Mongoose
 * Reads the connection URI from process.env.MONGO_URI
 * Automatically sanitizes wrapping quotes, whitespace, and enforces the 'cartiva' database name.
 */
const connectDB = async () => {
  try {
    let rawUri = process.env.MONGO_URI;

    // 1. Sanitize the URI string if provided
    if (typeof rawUri === 'string') {
      rawUri = rawUri.trim();
      // Strip outer double or single quotes accidentally added in cloud dashboards
      if (
        (rawUri.startsWith('"') && rawUri.endsWith('"')) ||
        (rawUri.startsWith("'") && rawUri.endsWith("'"))
      ) {
        rawUri = rawUri.slice(1, -1).trim();
      }
    }

    const mongoUri = rawUri || 'mongodb://localhost:27017/cartiva';

    // 2. Validate URI scheme before connecting
    if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
      throw new Error(
        `Invalid MongoDB URI scheme. Connection string must start with 'mongodb://' or 'mongodb+srv://'.`
      );
    }

    // 3. Connect with explicit dbName: 'cartiva' and timeout
    const conn = await mongoose.connect(mongoUri, {
      dbName: 'cartiva',
      serverSelectionTimeoutMS: 5000 // Timeout after 5s if MongoDB host is unreachable
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name || 'cartiva'})`);
    return conn;
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Warning: ${error.message}`);
    console.warn(`💡 Tip: Make sure MongoDB is running locally or specify a valid MongoDB Atlas URI in backend/.env or cloud environment.`);
    return null;
  }
};

module.exports = connectDB;
