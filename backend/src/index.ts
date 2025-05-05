import './config/env';
import { app } from './app';
import { initDatabase } from './config/database';

// Use environment variables with fallbacks
const port = process.env.PORT || 3000;

// Initialize database connection
initDatabase()
  .then(() => {
    console.log('Database connection established');
    
    // Start server after DB is initialized
    const server = app.listen(port, () => {
      console.log(`✅ Server running at http://localhost:${port}`);
      console.log(`ℹ️ Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });
  })
  .catch((error) => {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  });