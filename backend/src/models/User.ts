import { User as PrismaUser } from '@prisma/client';

export type User = PrismaUser;

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  password?: string;
}
