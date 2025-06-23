import { PrismaClient, Market, Stake } from '@prisma/client';
import { MarketWithRelations } from '../models/Market';

// at liquidity = 1000, 1000PP moves the probabilities from 50% to 73%, and 2000PP moves it to 88%.
const liquidity = 1000;

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

    return this.prisma.market.create({
      data: {
        articleId,
        resolved: false,
        outcome: null,
        sharesTrue: 0,
        sharesFalse: 0,
        probTrue: 0.5,
        probFalse: 0.5,
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
    includeResolved?: boolean;
    category?: string;
    take?: number;
    skip?: number;
  } = {}): Promise<MarketWithRelations[]> {
    const { includeResolved = false, category, take, skip } = options;

    return this.prisma.market.findMany({
      where: {
        resolved: includeResolved ? undefined : false,
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

  async resolveMarket(id: number, outcome: boolean): Promise<Market> {
    const market = await this.getMarket(id);
    if (!market) {
      throw new Error('Market not found');
    }

    if (market.resolved) {
      throw new Error('Market is already resolved');
    }

    // Use a transaction to ensure both market update and stake resolution happen atomically
    return this.prisma.$transaction(async (tx) => {
      const updatedMarket = await tx.market.update({
        where: { id },
        data: {
          resolved: true,
          outcome,
        },
        include: {
          stakes: true,
          article: true,
        },
      });

      // Calculate and distribute winnings
      const stakes = updatedMarket.stakes;
      const winningStakes = stakes.filter((stake) => stake.prediction === outcome);
      const totalStakeAmount = stakes.reduce((sum, stake) => sum + stake.stakeAmount, 0);

      if (winningStakes.length > 0) {
        const totalWinningAmount = winningStakes.reduce((sum, stake) => sum + stake.stakeAmount, 0);

        await Promise.all(
          winningStakes.map((stake) => {
            const winnings = (stake.stakeAmount / totalWinningAmount) * totalStakeAmount;
            return tx.user.update({
              where: { id: stake.userId },
              data: {
                provePoints: {
                  increment: winnings,
                },
              },
            });
          })
        );
      } else {
        // Refund all stakes if no winners
        await Promise.all(
          stakes.map((stake) =>
            tx.user.update({
              where: { id: stake.userId },
              data: {
                provePoints: {
                  increment: stake.stakeAmount,
                },
              },
            })
          )
        );
      }

      return updatedMarket;
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
    const expTrue = Math.exp(market.sharesTrue / liquidity);
    const expFalse = Math.exp(market.sharesFalse / liquidity);
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
    const expTrue = Math.exp(market.sharesTrue / liquidity);
    const expFalse = Math.exp(market.sharesFalse / liquidity);
    const sharesBought = predictedOutcome
      ? liquidity * Math.log(
          Math.exp(ppCount / liquidity) * (expTrue + expFalse) - expFalse
        ) - market.sharesTrue
      : liquidity * Math.log(
          Math.exp(ppCount / liquidity) * (expTrue + expFalse) - expTrue
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
}
