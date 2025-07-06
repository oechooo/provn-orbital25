import { Article, Market } from '@prisma/client';

export type ArticleWithMarket = Article & {
  market: Market | null;
};
