import { PrismaClient, Stake } from '../prisma/client/index';
import { MarketService } from './MarketService';

export class StakeService {
  constructor(private readonly prisma: PrismaClient) {}

  async createStake(userId: number, marketId: number, prediction: boolean, stakeAmount: number): Promise<Stake> {
    // Validate user has enough provePoints before creating stake
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) { throw new Error('User not found');}
    if (user.provePoints < stakeAmount) { throw new Error('Insufficient prove points'); }
  
    const market = await this.prisma.market.findUnique({
      where: { id: marketId },
      select: { probTrue: true, probFalse: true }
    });
    if (!market) throw new Error('Market not found');

    const marketService = new MarketService(this.prisma);
    const { upside, sharesBought } = await marketService.getStakingParameters(marketId, prediction, stakeAmount);
    await marketService.updateOdds(marketId, prediction, sharesBought);

    // Create stake and update user's prove points atomically
    // TODO: encapsulate user logic in UserService
    return this.prisma.$transaction(async (tx) => {
      const stake = await tx.stake.create({
        data: {
          userId,
          marketId,
          resolved: false,
          prediction,
          stakeAmount,
          upside,
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

  async resolveStake(stakeId: number, finalOutcome: boolean): Promise<void> {
    // Fetch the stake with user info
    const stake = await this.prisma.stake.findUnique({
      where: { id: stakeId },
      include: { user: true }
    });
    if (!stake) throw new Error('Stake not found');

    const wasCorrect = stake.prediction === finalOutcome;

    // Mark the stake as resolved and set won field
    await this.prisma.stake.update({
      where: { id: stakeId },
      data: { 
        resolved: true,
        won: wasCorrect
      }
    });

    // Credit user if prediction was correct
    if (wasCorrect) {
      const winnings = stake.stakeAmount * stake.upside;
      await this.prisma.user.update({
        where: { id: stake.userId },
        data: {
          provePoints: {
            increment: winnings
          }
        }
      });
    }
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

    await this.prisma.$transaction([
      // Mark all stakes as resolved with won = null (refunded)
      this.prisma.stake.updateMany({
        where: { marketId },
        data: { 
          resolved: true,
          won: null
        }
      }),
      // Refund the stake amounts to users
      ...stakes.map(stake => 
        this.prisma.user.update({
          where: { id: stake.userId },
          data: {
            provePoints: {
              increment: stake.stakeAmount
            }
          }
        })
      )
    ]);
  }

  async resolveMarketStakes(marketId: number, outcome: boolean): Promise<void> {
    const stakes = await this.prisma.stake.findMany({
      where: { marketId }
    });

    const winningStakes = stakes.filter(stake => stake.prediction === outcome);
    const losingStakes = stakes.filter(stake => stake.prediction !== outcome);
    
    if (winningStakes.length === 0) {
      await this.refundStakes(marketId);
      return;
    }

    const totalStakeAmount = stakes.reduce((sum, stake) => sum + stake.stakeAmount, 0);
    const totalWinningAmount = winningStakes.reduce((sum, stake) => sum + stake.stakeAmount, 0);
    
    await this.prisma.$transaction([
      // Mark all stakes as resolved and set won field
      ...winningStakes.map(stake => 
        this.prisma.stake.update({
          where: { id: stake.id },
          data: { 
            resolved: true,
            won: true
          }
        })
      ),
      ...losingStakes.map(stake => 
        this.prisma.stake.update({
          where: { id: stake.id },
          data: { 
            resolved: true,
            won: false
          }
        })
      ),
      // Distribute winnings to winning stakes
      ...winningStakes.map(stake => {
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
    ]);
  }
}