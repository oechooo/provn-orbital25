import { CronService } from '../../services/CronService';
import { PrismaClient } from '@prisma/client';
import * as cron from 'node-cron';

// Mock node-cron
jest.mock('node-cron');

// Mock MarketService
jest.mock('../../services/MarketService', () => {
  return {
    MarketService: jest.fn().mockImplementation(() => ({
      resolveMarket: jest.fn()
    }))
  };
});

describe('CronService', () => {
  let cronService: CronService;
  let mockPrisma: jest.Mocked<PrismaClient>;
  let mockTask: jest.Mocked<cron.ScheduledTask>;
  let mockSchedule: jest.MockedFunction<typeof cron.schedule>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock Prisma
    mockPrisma = {
      market: {
        findMany: jest.fn(),
      },
    } as any;

    // Mock cron task
    mockTask = {
      start: jest.fn(),
      stop: jest.fn(),
      destroy: jest.fn(),
    } as any;

    // Mock cron.schedule
    mockSchedule = cron.schedule as jest.MockedFunction<typeof cron.schedule>;
    mockSchedule.mockReturnValue(mockTask);

    // Create CronService instance with mocked Prisma
    cronService = new CronService(mockPrisma);
  });

  afterEach(() => {
    // Clean up any running cron jobs
    cronService.stopAll();
  });

  describe('Constructor', () => {
    it('should create an instance of CronService', () => {
      expect(cronService).toBeInstanceOf(CronService);
    });
  });

  describe('startMarketResolutionJob', () => {
    it('should start the market resolution cron job', () => {
      cronService.startMarketResolutionJob();

      expect(mockSchedule).toHaveBeenCalledWith(
        '0 * * * *', // Every hour
        expect.any(Function),
        {
          timezone: 'UTC'
        }
      );
    });

    it('should create task with correct schedule', () => {
      cronService.startMarketResolutionJob();

      // Verify the cron expression is for every hour
      const [cronExpression] = mockSchedule.mock.calls[0];
      expect(cronExpression).toBe('0 * * * *');
    });
  });

  describe('startAll', () => {
    it('should start all cron jobs', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      cronService.startAll();

      expect(mockSchedule).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('[CronService] All cron jobs started');
      
      consoleSpy.mockRestore();
    });
  });

  describe('stopAll', () => {
    it('should stop all cron jobs', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      cronService.startAll();
      cronService.stopAll();

      expect(mockTask.stop).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Stopped'));
      
      consoleSpy.mockRestore();
    });

    it('should not throw error if no jobs are running', () => {
      expect(() => cronService.stopAll()).not.toThrow();
    });
  });

  describe('stop', () => {
    it('should stop a specific cron job', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      cronService.startMarketResolutionJob();
      cronService.stop('marketResolution');

      expect(mockTask.stop).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('[CronService] Stopped marketResolution cron job');
      
      consoleSpy.mockRestore();
    });

    it('should not throw error if job does not exist', () => {
      expect(() => cronService.stop('nonExistentJob')).not.toThrow();
    });
  });

  describe('getStatus', () => {
    it('should return status of all running jobs', () => {
      cronService.startMarketResolutionJob();
      
      const status = cronService.getStatus();
      
      expect(status).toEqual({
        marketResolution: true
      });
    });

    it('should return empty object when no jobs are running', () => {
      const status = cronService.getStatus();
      
      expect(status).toEqual({});
    });
  });

  describe('triggerMarketResolution', () => {
    it('should manually trigger market resolution', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Mock the database query to return no markets
      (mockPrisma.market.findMany as jest.Mock).mockResolvedValue([]);

      await cronService.triggerMarketResolution();

      expect(consoleSpy).toHaveBeenCalledWith('[CronService] Manually triggering market resolution check...');
      expect(mockPrisma.market.findMany).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle database errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock the database to throw an error
      (mockPrisma.market.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(cronService.triggerMarketResolution()).resolves.not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[CronService] Error in checkAndResolveMarkets:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Integration', () => {
    it('should handle the complete cron job lifecycle', () => {
      // Start the service
      cronService.startAll();
      expect(mockTask.start).not.toHaveBeenCalled(); // start() is not called by default

      // Check status
      const status = cronService.getStatus();
      expect(status.marketResolution).toBe(true);

      // Stop the service
      cronService.stopAll();
      expect(mockTask.stop).toHaveBeenCalled();
    });

    it('should schedule cron job with correct timezone', () => {
      cronService.startMarketResolutionJob();

      expect(mockSchedule).toHaveBeenCalledWith(
        '0 * * * *',
        expect.any(Function),
        expect.objectContaining({
          timezone: 'UTC'
        })
      );
    });

    it('should handle multiple start/stop cycles', () => {
      // Start and stop multiple times
      cronService.startAll();
      cronService.stopAll();
      
      cronService.startAll();
      cronService.stopAll();

      // Should work without errors
      expect(mockSchedule).toHaveBeenCalledTimes(2);
      expect(mockTask.stop).toHaveBeenCalledTimes(2);
    });
  });

  describe('Database queries', () => {
    it('should query for markets due for resolution', async () => {
      // Mock empty result
      (mockPrisma.market.findMany as jest.Mock).mockResolvedValue([]);

      await cronService.triggerMarketResolution();

      expect(mockPrisma.market.findMany).toHaveBeenCalledWith({
        where: {
          nextResolve: {
            lte: expect.any(Date)
          },
          closed: false
        },
        include: {
          article: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });
    });
  });
});
