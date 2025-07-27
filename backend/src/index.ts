import './config/env';
import { app } from './app';
import { initDatabase, prisma } from './config/database';
import { UserService } from './services/UserService';
import { ArticleService } from './services/ArticleService';
import { MarketService } from './services/MarketService';
import { StakeService } from './services/StakeService';
import { StartupService } from './services/StartupService';
import { CronService } from './services/CronService';

// Initialize core services
const userService = new UserService(prisma);
const articleService = new ArticleService(prisma);
const marketService = new MarketService(prisma);
const stakeService = new StakeService(prisma);
const startupService = new StartupService(prisma);
const cronService = new CronService(prisma);

const port = process.env.PORT || 3000;

initDatabase()
  .then(async () => {
    console.log('Database connected');
    
    // Start the server first
    const server = app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Start cron jobs
    cronService.startAll();

    // Run startup tasks asynchronously after server starts
    // This ensures the server is available even if startup tasks take time
    setImmediate(async () => {
      try {
        await startupService.runStartupTasks();
      } catch (error) {
        console.error('Startup tasks failed, but server is still running:', error);
      }
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      cronService.stopAll();
      server.close(() => {
        console.log('Process terminated');
      });
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

