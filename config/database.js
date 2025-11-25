// Load environment variables
require('dotenv').config();

const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`Connection Error: ${error.message}`);
    // Don't exit - allow app to run without DB for now
    console.log('Running without database connection...');
  }
};

module.exports = connectDB;