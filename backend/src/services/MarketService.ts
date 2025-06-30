import { PrismaClient, Market, Stake } from '../prisma/client/index';
import { MarketWithRelations } from '../models/Market';
import { StakeService } from './StakeService';

// at liquidity = 1000, 1000PP moves the probabilities from 50% to 73%, and 2000PP moves it to 88%.
const LIQUIDITY = 1000;
const CONFIDENCE_THRESHOLD = 0.95; // 95% confidence

export class MarketService {
  constructor(private readonly prisma: PrismaClient) {}

  async getAllMarkets(): Promise<MarketWithRelations[]> {
    return this.prisma.market.findMany({
      include: {
        article: true,
        stakes: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  async getMarketById(id: number): Promise<MarketWithRelations> {
    const market = await this.prisma.market.findUnique({
      where: { id },
      include: {
        article: true,
        stakes: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });
    if (!market) throw new Error('Market not found');
    return market;
  }

  async createMarket(articleId: number): Promise<Market> {
    // Verify article exists and doesn't already have a market
    const article = await this.prisma.article.findFirst({
      where: {
        id: articleId,
        market: null,
      },
    });

    if (!article) {
      throw new Error('Article not found or already has a market');
    }

    // Set nextResolve to 7 days from now
    const nextResolve = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return this.prisma.market.create({
      data: {
        articleId,
        resolveCount: 0,
        outcome: null,
        sharesTrue: 0,
        sharesFalse: 0,
        probTrue: 0.5,
        probFalse: 0.5,
        nextResolve,
      },
      include: {
        article: true,
        stakes: true,
      },
    });
  }

  async getMarket(id: number): Promise<(Market & { stakes: Stake[] }) | null> {
    return this.prisma.market.findUnique({
      where: { id },
      include: {
        article: true,
        stakes: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });
  }

  async getMarketByArticle(articleId: number): Promise<MarketWithRelations | null> {
    return this.prisma.market.findUnique({
      where: { articleId },
      include: {
        article: true,
        stakes: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });
  }

  async listMarkets(options: {
    includeClosed?: boolean;
    category?: string;
    take?: number;
    skip?: number;
  } = {}): Promise<MarketWithRelations[]> {
    const { includeClosed = false, category, take, skip } = options;

    return this.prisma.market.findMany({
      where: {
        closed: includeClosed ? undefined : false,
        article: category
          ? {
              category,
            }
          : undefined,
      },
      include: {
        article: true,
        stakes: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take,
      skip,
    });
  }

  async isContentious(marketId: number): Promise<boolean> {
    const { probTrue, probFalse } = await this.getImpliedProbability(marketId);
    // Not contentious if either probability is above the confidence threshold
    return !(probTrue >= CONFIDENCE_THRESHOLD || probFalse >= CONFIDENCE_THRESHOLD);
  }

  async resolveMarket(marketId: number): Promise<void> {
    const market = await this.getMarketById(marketId);
    if (!market) throw new Error('Market not found');

    let outcomeToUse: boolean | null = market.outcome;
    if (outcomeToUse === null) {
      const { probTrue, probFalse } = await this.getImpliedProbability(marketId);
      const contentious = await this.isContentious(marketId);
      if (contentious) {
        throw new Error('Market is contentious and cannot be auto-resolved.');
      }
      // Not contentious: resolve to the higher probability
      outcomeToUse = probTrue > probFalse;
    }

    // Find all stakes for this market in the current period
    const stakesToResolve = market.stakes.filter(
      (stake) =>
        stake.createdAt >= market.lastResolve &&
        stake.createdAt < market.nextResolve &&
        !stake.resolved
    );

    // Resolve each stake
    const stakeService = new StakeService(this.prisma);
    for (const stake of stakesToResolve) {
      await stakeService.resolveStake(stake.id, outcomeToUse!);
    }

    // Update market timing and status
    let newNextResolve = market.nextResolve;
    let newClosed = market.closed;
    let newResolveCount = market.resolveCount + 1;
    let newOutcome = null;
    const newLastResolve = market.nextResolve;

    // Set nextResolve and closed based on resolveCount
    if (market.resolveCount === 0) {
      // First resolution: next is 1 month from createdAt
      newNextResolve = new Date(market.createdAt.getTime());
      newNextResolve.setMonth(newNextResolve.getMonth() + 1);
    } else if (market.resolveCount === 1) {
      // Second resolution: next is 6 months from createdAt
      newNextResolve = new Date(market.createdAt.getTime());
      newNextResolve.setMonth(newNextResolve.getMonth() + 6);
    } else if (market.resolveCount === 2) {
      // Third resolution: close the market
      newClosed = true;
    }

    await this.prisma.market.update({
      where: { id: marketId },
      data: {
        lastResolve: newLastResolve,
        nextResolve: newNextResolve,
        closed: newClosed,
        resolveCount: newResolveCount,
        outcome: newOutcome,
      },
    });
  }

  async getMarketStatistics(id: number): Promise<{
    totalParticipants: number;
    totalStakeAmount: number;
    trueCount: number;
    falseCount: number;
    trueAmount: number;
    falseAmount: number;
  }> {
    const market = await this.prisma.market.findUnique({
      where: { id },
      include: {
        stakes: true,
      },
    });

    if (!market) {
      throw new Error('Market not found');
    }

    const trueStakes = market.stakes.filter((stake) => stake.prediction === true);
    const falseStakes = market.stakes.filter((stake) => stake.prediction === false);

    return {
      totalParticipants: market.stakes.length,
      totalStakeAmount: market.stakes.reduce((sum, stake) => sum + stake.stakeAmount, 0),
      trueCount: trueStakes.length,
      falseCount: falseStakes.length,
      trueAmount: trueStakes.reduce((sum, stake) => sum + stake.stakeAmount, 0),
      falseAmount: falseStakes.reduce((sum, stake) => sum + stake.stakeAmount, 0),
    };
  }

  async deleteMarket(id: number): Promise<void> {
    await this.prisma.market.delete({
      where: { id },
    });
  }

  // Calculates LMSR odds for a given market.
  async getImpliedProbability(marketId: number): Promise<{ probTrue: number; probFalse: number }> {
    const market = await this.getMarketById(marketId);
    const expTrue = Math.exp(market.sharesTrue / LIQUIDITY);
    const expFalse = Math.exp(market.sharesFalse / LIQUIDITY);
    const denom = expTrue + expFalse;

    return {
      probTrue: expTrue / denom,
      probFalse: expFalse / denom,
    };
  }

  async getStakingParameters(marketId: number, predictedOutcome: boolean, ppCount: number): Promise<{
    upside: number;
    sharesBought: number
  }> {
    const market = await this.getMarketById(marketId);
    const expTrue = Math.exp(market.sharesTrue / LIQUIDITY);
    const expFalse = Math.exp(market.sharesFalse / LIQUIDITY);
    const sharesBought = predictedOutcome
      ? LIQUIDITY * Math.log(
          Math.exp(ppCount / LIQUIDITY) * (expTrue + expFalse) - expFalse
        ) - market.sharesTrue
      : LIQUIDITY * Math.log(
          Math.exp(ppCount / LIQUIDITY) * (expTrue + expFalse) - expTrue
        ) - market.sharesFalse;
    return {
      upside: sharesBought / ppCount,
      sharesBought
    }
  }
  async updateOdds(marketId: number, predictedOutcome: boolean, sharesBought: number): Promise<void> {
    const market = await this.getMarketById(marketId);

    // Calculate new shares
    const newSharesTrue = predictedOutcome
      ? market.sharesTrue + sharesBought
      : market.sharesTrue;
    const newSharesFalse = !predictedOutcome
      ? market.sharesFalse + sharesBought
      : market.sharesFalse;
    await this.prisma.market.update({
      where: { id: marketId },
      data: {
        sharesTrue: newSharesTrue,
        sharesFalse: newSharesFalse,
      },
    });

    // Recalculate probabilities
    const { probTrue, probFalse } = await this.getImpliedProbability(marketId);
    await this.prisma.market.update({
      where: { id: marketId },
      data: {
        probTrue,
        probFalse,
      },
    });
  }

  // Admin functions
  async setMarketOutcome(marketId: number, outcome: boolean | null): Promise<void> {
    const market = await this.getMarketById(marketId);
    if (!market) throw new Error('Market not found');

    await this.prisma.market.update({
      where: { id: marketId },
      data: {
        outcome: outcome,
      },
    });
  }
}
