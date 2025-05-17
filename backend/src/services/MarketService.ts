import { PrismaClient, Market, Stake } from '@prisma/client';

export class MarketService {
  constructor(private readonly prisma: PrismaClient) {}

  protected async createMarket(articleId: number): Promise<Market> {
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

  async getMarketByArticle(articleId: number): Promise<(Market & { stakes: Stake[] }) | null> {
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
  } = {}): Promise<(Market & { stakes: Stake[] })[]> {
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
}
