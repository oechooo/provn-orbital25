// Shared types for both frontend and backend

export type ArticleWithMarket = {
  id: number;
  sourceName: string;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  category: string | null;
  publishedAt: string;
  market: {
    id: number;
    probTrue: number;
    probFalse: number;
    nextResolve: string;
    outcome: boolean | null;
  } | null;
};
