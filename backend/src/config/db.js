const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri) {
      console.log('No MONGODB_URI found in environment. Starting MongoDB Memory Server...');
      mongoMemoryServer = await MongoMemoryServer.create();
      uri = mongoMemoryServer.getUri();
      console.log(`MongoDB Memory Server started at: ${uri}`);
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Attempting fallback to MongoDB Memory Server...');
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const fallbackUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(fallbackUri);
      console.log(`MongoDB Memory Server Fallback Connected: ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error(`Fatal DB Error: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
