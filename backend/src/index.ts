import './config/env';
import { app } from './app';
import { initDatabase, prisma } from './config/database';
import { UserService } from './services/UserService';

const userService = new UserService(prisma);

const port = process.env.PORT || 3000;

initDatabase()
  .then(() => {
    console.log('✅ Database connected');
    const server = app.listen(port, () => {
      console.log(`✅ Server running at http://localhost:${port}`);
      console.log(`ℹ️ Environment: ${process.env.NODE_ENV || 'development'}`);
    });

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
