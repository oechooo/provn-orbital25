import { Article, Market } from '../prisma/client/index';

export type ArticleWithMarket = Article & {
  market: Market | null;
};