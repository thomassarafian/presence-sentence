import mongoose from 'mongoose';

const connectMongo = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal) => {
      console.log(`${signal} received. Closing MongoDB connection...`);
      try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed gracefully');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error during MongoDB disconnection:', err);
        process.exit(1);
      }
    };

    // Handle process termination
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    // Handle nodemon restarts
    process.once('SIGUSR2', async () => {
      await mongoose.connection.close();
      process.kill(process.pid, 'SIGUSR2');
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);

    // In development, show full error
    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    }

    // Exit process with failure
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 * Useful for testing or manual disconnection
 */
export const disconnectMongo = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
    throw error;
  }
};

/**
 * Check if MongoDB is connected
 * @returns {boolean} Connection status
 */
export const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

export default connectMongo;
