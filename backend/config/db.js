const mongoose = require('mongoose');

/**
 * Connect to MongoDB using Mongoose
 * Reads the connection URI from process.env.MONGO_URI
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cartiva';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5s if MongoDB host is unreachable
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Warning: ${error.message}`);
    console.warn(`💡 Tip: Make sure MongoDB is running locally or specify a valid MongoDB Atlas URI in backend/.env`);
    return null;
  }
};

module.exports = connectDB;
