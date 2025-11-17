import 'dotenv/config';
import connectMongo from './config/db.js';
import app from './app.js';

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectMongo();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
