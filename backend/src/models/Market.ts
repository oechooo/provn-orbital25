import { Market, Article } from '@prisma/client';
import { StakeWithUser } from './Stake';

export type MarketWithRelations = Market & {
  stakes: StakeWithUser[];
  article: Article;
};