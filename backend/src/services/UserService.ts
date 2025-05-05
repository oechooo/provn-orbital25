// services/userService.ts

import { PrismaClient, User, Stake } from '@prisma/client';
import { CreateUserInput, UpdateUserInput } from '../models/User';

export class UserService {
    constructor(private readonly prisma: PrismaClient) {}

    // Create a new user
    async createUser(data: CreateUserInput): Promise<Omit<User, 'password'>> {
        const user = await this.prisma.user.create({
            data: {
                ...data,
                provePoints: 100 // Default starting points
            },
            select: {
                id: true,
                username: true,
                email: true,
                provePoints: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return user;
    }

    // Get a user's basic details
    async getUser(id: number): Promise<Omit<User, 'password'> | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                provePoints: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return user;
    }

    // Get a user's details, including stakes
    async getUserWithStakes(id: number): Promise<(Omit<User, 'password'> & { stakes: Stake[] }) | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                provePoints: true,
                createdAt: true,
                updatedAt: true,
                stakes: {
                    include: {
                        market: {
                            include: {
                                article: true
                            }
                        }
                    }
                }
            }
        });
        return user;
    }

    // Update user details
    async updateUser(id: number, data: UpdateUserInput): Promise<Omit<User, 'password'>> {
        const user = await this.prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                username: true,
                email: true,
                provePoints: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return user;
    }

    // Delete a user
    async deleteUser(id: number): Promise<void> {
        await this.prisma.user.delete({
            where: { id }
        });
    }

    // Get a user by their email
    async getUserByEmail(email: string): Promise<Omit<User, 'password'> | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                username: true,
                email: true,
                provePoints: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return user;
    }

    // Get statistics about a user's stakes
    async getUserStakeStats(id: number): Promise<{
        totalStakes: number;
        totalAmountStaked: number;
        winningStakes: number;
        totalWinnings: number;
    }> {
        const stakes = await this.prisma.stake.findMany({
            where: { 
                userId: id,
                market: {
                    resolved: true
                }
            },
            include: {
                market: true
            }
        });

        const totalStakes = stakes.length;
        const totalAmountStaked = stakes.reduce((sum, stake) => sum + stake.stakeAmount, 0);
        const winningStakes = stakes.filter(stake => stake.prediction === stake.market.outcome).length;
        
        // Calculate total winnings (this is simplified - actual winnings calculation should match StakeService)
        const totalWinnings = stakes.reduce((sum, stake) => {
            if (stake.prediction === stake.market.outcome) {
                return sum + (stake.stakeAmount * 2); // Simplified winning calculation
            }
            return sum;
        }, 0);

        return {
            totalStakes,
            totalAmountStaked,
            winningStakes,
            totalWinnings
        };
    }

    // Update the provePoints of a user
    async updateProvePoints(id: number, amount: number): Promise<void> {
        await this.prisma.user.update({
            where: { id },
            data: {
                provePoints: {
                    increment: amount
                }
            }
        });
    }
}