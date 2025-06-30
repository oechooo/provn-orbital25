// src/models/User.ts
import { User as PrismaUser } from '../prisma/client/index';

// Type definition that matches Prisma schema
export type User = PrismaUser;

// Export interface that can be used for creating new users
export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
}

// Export interface that can be used for updating users
export interface UpdateUserInput {
  username?: string;
  email?: string;
  password?: string;
}

export type UserWithoutPassword = {
    id: number;
    username: string;
    email: string;
    provePoints: number;
    resetToken: String | null;
    resetTokenExpiry: Date | null;
    createdAt: Date;
    updatedAt: Date;
};
