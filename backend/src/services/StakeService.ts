import { PrismaClient, Stake } from '@prisma/client';

export class StakeService {
  constructor(private readonly prisma: PrismaClient) {}

  async createStake(userId: number, marketId: number, prediction: boolean, stakeAmount: number): Promise<Stake> {
    // Validate user has enough provePoints before creating stake
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.provePoints < stakeAmount) {
      throw new Error('Insufficient prove points');
    }

    // Create stake and update user's prove points atomically
    return this.prisma.$transaction(async (tx) => {
      const stake = await tx.stake.create({
        data: {
          userId,
          marketId,
          prediction,
          stakeAmount,
        }
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          provePoints: {
            decrement: stakeAmount
          }
        }
      });

      return stake;
    });
  }

  async getUserStakes(userId: number): Promise<Stake[]> {
    return this.prisma.stake.findMany({
      where: { userId },
      include: {
        market: {
          include: {
            article: true
          }
        }
      }
    });
  }

  async getMarketStakes(marketId: number): Promise<Stake[]> {
    return this.prisma.stake.findMany({
      where: { marketId },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
  }

  async calculateMarketTotals(marketId: number): Promise<{ totalTrue: number; totalFalse: number }> {
    const stakes = await this.prisma.stake.groupBy({
      by: ['prediction'],
      where: { marketId },
      _sum: {
        stakeAmount: true
      }
    });

    const trueStakes = stakes.find(s => s.prediction)
    const falseStakes = stakes.find(s => !s.prediction)

    return {
      totalTrue: trueStakes?._sum?.stakeAmount ?? 0,
      totalFalse: falseStakes?._sum?.stakeAmount ?? 0
    };
  }

  async refundStakes(marketId: number): Promise<void> {
    const stakes = await this.prisma.stake.findMany({
      where: { marketId }
    });

    await this.prisma.$transaction(
      stakes.map(stake => 
        this.prisma.user.update({
          where: { id: stake.userId },
          data: {
            provePoints: {
              increment: stake.stakeAmount
            }
          }
        })
      )
    );
  }

  async resolveMarketStakes(marketId: number, outcome: boolean): Promise<void> {
    const stakes = await this.prisma.stake.findMany({
      where: { marketId }
    });

    const winningStakes = stakes.filter(stake => stake.prediction === outcome);
    const totalStakeAmount = stakes.reduce((sum, stake) => sum + stake.stakeAmount, 0);
    
    if (winningStakes.length === 0) {
      await this.refundStakes(marketId);
      return;
    }

    const totalWinningAmount = winningStakes.reduce((sum, stake) => sum + stake.stakeAmount, 0);
    
    await this.prisma.$transaction(
      winningStakes.map(stake => {
        const winnings = (stake.stakeAmount / totalWinningAmount) * totalStakeAmount;
        return this.prisma.user.update({
          where: { id: stake.userId },
          data: {
            provePoints: {
              increment: winnings
            }
          }
        });
      })
    );
  }
}