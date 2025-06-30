// services/userService.ts

import { PrismaClient } from '../prisma/client/index';
import { CreateUserInput, UpdateUserInput, UserWithoutPassword } from '../models/User';

export class UserService {
    constructor(private readonly prisma: PrismaClient) {}    // Create a new user
    public async createUser(data: CreateUserInput): Promise<UserWithoutPassword> {
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
                resetToken: true,
                resetTokenExpiry: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return user;
    }
    
    // Get a user's full details, including stakes
    public async getUser(id: number): Promise<(UserWithoutPassword & { stakes: any[] }) | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                provePoints: true,
                resetToken: true,
                resetTokenExpiry: true,
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
    public async getUserWithoutStakes(id: number): Promise<UserWithoutPassword | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                provePoints: true,
                resetToken: true,
                resetTokenExpiry: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return user;
    }

    // Delete a user
    public async deleteUser(id: number): Promise<void> {
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
    public async getUserStakeStats(id: number): Promise<{
        totalStakes: number;
        totalAmountStaked: number;
        winningStakes: number;
    }> {
        const stakes = await this.prisma.stake.findMany({
            where: { 
                userId: id
            },
            include: {
                market: true
            }
        });

        const totalStakes = stakes.length;
        const totalAmountStaked = stakes.reduce((sum: number, stake: any) => sum + stake.stakeAmount, 0);
        const winningStakes = stakes.filter((stake: any) => stake.prediction === stake.market.outcome).length;

        // TODO: Calculate total winnings to match StakeService

        return {
            totalStakes,
            totalAmountStaked,
            winningStakes
        };
    }

    // Update user details
    public async updateUser(id: number, data: UpdateUserInput): Promise<UserWithoutPassword> {
        const user = await this.prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                username: true,
                email: true,
                provePoints: true,
                resetToken: true,
                resetTokenExpiry: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return user;
    }
}