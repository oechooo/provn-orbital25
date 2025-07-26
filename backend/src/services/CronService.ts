import * as cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { MarketService } from './MarketService';

export class CronService {
  private marketService: MarketService;
  private prisma: PrismaClient;
  private tasks: Map<string, cron.ScheduledTask> = new Map();

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.marketService = new MarketService(prisma);
  }

  /**
   * Start the automatic market resolution cron job
   * Runs every hour to check for markets due for resolution
   */
  startMarketResolutionJob(): void {
    const task = cron.schedule('0 * * * *', async () => {
      console.log('[CronService] Running market resolution check...');
      await this.checkAndResolveMarkets();
    }, {
      timezone: 'UTC'
    });

    this.tasks.set('marketResolution', task);
    console.log('[CronService] Market resolution cron job started - runs every hour');
  }

  /**
   * Start all cron jobs
   */
  startAll(): void {
    this.startMarketResolutionJob();
    console.log('[CronService] All cron jobs started');
  }

  /**
   * Stop all cron jobs
   */
  stopAll(): void {
    this.tasks.forEach((task, name) => {
      task.stop();
      console.log(`[CronService] Stopped ${name} cron job`);
    });
    this.tasks.clear();
    console.log('[CronService] All cron jobs stopped');
  }

  /**
   * Stop a specific cron job
   */
  stop(jobName: string): void {
    const task = this.tasks.get(jobName);
    if (task) {
      task.stop();
      this.tasks.delete(jobName);
      console.log(`[CronService] Stopped ${jobName} cron job`);
    }
  }

  /**
   * Get status of all cron jobs
   */
  getStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    this.tasks.forEach((task, name) => {
      // Note: node-cron doesn't expose running status, so we just check if task exists
      status[name] = true;
    });
    return status;
  }

  /**
   * Check for markets that are due for resolution and resolve them
   */
  private async checkAndResolveMarkets(): Promise<void> {
    try {
      const now = new Date();
      
      // Find markets that are due for resolution
      const dueMarkets = await this.prisma.market.findMany({
        where: {
          nextResolve: {
            lte: now
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

      console.log(`[CronService] Found ${dueMarkets.length} markets due for resolution`);

      if (dueMarkets.length === 0) {
        return;
      }

      // Resolve each market
      const resolutionPromises = dueMarkets.map(async (market) => {
        try {
          console.log(`[CronService] Attempting to resolve market ${market.id} for article: "${market.article?.title}"`);
          await this.marketService.resolveMarket(market.id);
          console.log(`[CronService] Successfully resolved market ${market.id}`);
          return { marketId: market.id, success: true, error: null };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`[CronService] Failed to resolve market ${market.id}: ${errorMessage}`);
          return { marketId: market.id, success: false, error: errorMessage };
        }
      });

      const results = await Promise.allSettled(resolutionPromises);
      
      // Log summary
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - successful;
      
      console.log(`[CronService] Market resolution completed. Success: ${successful}, Failed: ${failed}`);

      // Log failed resolutions for debugging
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && !result.value.success) {
          console.error(`[CronService] Market ${result.value.marketId} failed: ${result.value.error}`);
        } else if (result.status === 'rejected') {
          console.error(`[CronService] Market resolution promise rejected:`, result.reason);
        }
      });

    } catch (error) {
      console.error('[CronService] Error in checkAndResolveMarkets:', error);
    }
  }

  /**
   * Manually trigger market resolution check (useful for testing)
   */
  async triggerMarketResolution(): Promise<void> {
    console.log('[CronService] Manually triggering market resolution check...');
    await this.checkAndResolveMarkets();
  }
}
