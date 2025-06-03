import { PrismaClient } from '@prisma/client';
import { CreateUserInput, UpdateUserInput } from '../models/User';

type UserWithoutPassword = {
    id: number;
    username: string;
    email: string;
    provePoints: number;
    resetToken: string | null;
    resetTokenExpiry: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export class UserService {
    constructor(private readonly prisma: PrismaClient) {}
    
    protected async createUser(data: CreateUserInput): Promise<UserWithoutPassword> {
        const user = await this.prisma.user.create({
            data: {
                ...data,
                provePoints: 100
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
      protected async getUser(id: number): Promise<UserWithoutPassword | null> {
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
            }        });
        return user;
    }

    protected async getUserWithoutStakes(id: number): Promise<UserWithoutPassword | null> {
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
    }    protected async deleteUser(id: number): Promise<void> {
        await this.prisma.user.delete({
            where: { id }
        });
    }    public async updateProvePoints(id: number, amount: number): Promise<void> {
        await this.prisma.user.update({
            where: { id },
            data: {
                provePoints: {
                    increment: amount
                }
            }        });
    }    private async updateUser(id: number, data: UpdateUserInput): Promise<UserWithoutPassword> {
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