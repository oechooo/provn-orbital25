import { Market, Article } from '../prisma/client/index';
import { StakeWithUser } from './Stake';

export type MarketWithRelations = Market & {
  stakes: StakeWithUser[];
  article: Article;
};