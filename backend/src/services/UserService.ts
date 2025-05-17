// services/userService.ts

import { PrismaClient, User, Stake } from '@prisma/client';
import { CreateUserInput, UpdateUserInput } from '../models/User';

export class UserService {
    constructor(private readonly prisma: PrismaClient) {}

    // Create a new user
    protected async createUser(data: CreateUserInput): Promise<Omit<User, 'password'>> {
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

    // Get a user's full details, including stakes
    protected async getUser(id: number): Promise<(Omit<User, 'password'> & { stakes: Stake[] }) | null> {
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

    // Get a user's basic details, without stakes
    protected async getUserWithoutStakes(id: number): Promise<Omit<User, 'password'> | null> {
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

    // Delete a user
    protected async deleteUser(id: number): Promise<void> {
        await this.prisma.user.delete({
            where: { id }
        });
    }

    // Update the provePoints of a user
    public async updateProvePoints(id: number, amount: number): Promise<void> {
        await this.prisma.user.update({
            where: { id },
            data: {
                provePoints: {
                    increment: amount
                }
            }
        });
    }

    // Get statistics about a user's stakes
    protected async getUserStakeStats(id: number): Promise<{
        totalStakes: number;
        totalAmountStaked: number;
        winningStakes: number;
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
        
        // TODO: Calculate total winnings to match StakeService

        return {
            totalStakes,
            totalAmountStaked,
            winningStakes
        };
    }

    // Update user details
    private async updateUser(id: number, data: UpdateUserInput): Promise<Omit<User, 'password'>> {
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
}