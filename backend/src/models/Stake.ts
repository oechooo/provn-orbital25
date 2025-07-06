import { Stake, User } from '@prisma/client';

// Stake with only id and username from User
export type StakeWithUser = Stake & {
  user: Pick<User, 'id' | 'username'>;
};
