import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { ArticleService } from '../services/ArticleService';
import { MarketService } from '../services/MarketService';
import axios from 'axios';

const articleService = new ArticleService(prisma);
const marketService = new MarketService(prisma);

export const getArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, limit = 10, offset = 0 } = req.query;
    
    const articles = await articleService.getFilteredArticles({
      category: category as string,
      limit: parseInt(limit as string),
    });

    res.json({ 
      articles,
      total: articles.length 
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ message: 'Error fetching articles' });
  }
};

export const getArticleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const article = await articleService.getArticleById(parseInt(id));
    
    if (!article) {
      res.status(404).json({ message: 'Article not found' });
      return;
    }
    
    res.json({ article });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ message: 'Error fetching article' });
  }
};

export const refreshArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Starting news refresh...');
    
    const API_KEY = process.env.NEWS_API_KEY;
    if (!API_KEY) {
      res.status(500).json({ message: 'News API key not configured' });
      return;
    }

    const CATEGORIES = ["business", "health", "science", "technology"];
    const ARTICLES_PER_CATEGORY = 5;
    let totalFetched = 0;
    let marketsCreated = 0;

    for (const category of CATEGORIES) {
      try {
        const url = `https://newsapi.org/v2/top-headlines?apiKey=${API_KEY}&category=${category}&pageSize=${ARTICLES_PER_CATEGORY}&language=en&sortBy=publishedAt`;
        
        console.log(`📰 Fetching ${category} articles...`);
        const response = await axios.get(url);
        const articles = response.data.articles;

        for (const article of articles) {
          if (!article.title || !article.url) continue;

          try {
            // Create article
            const newArticle = await articleService.createArticle({
              sourceName: article.source?.name || 'Unknown Source',
              author: article.author || null,
              title: article.title,
              description: article.description || null,
              url: article.url,
              urlToImage: article.urlToImage || null,
              publishedAt: new Date(article.publishedAt),
              content: article.content || null,
              category: category,
            });

            console.log(`✅ Created article: ${newArticle.title}`);
            totalFetched++;

            // Create market for the article
            try {
              const market = await marketService.createMarket(newArticle.id);
              console.log(`📊 Created market ${market.id} for article ${newArticle.id}`);
              marketsCreated++;
            } catch (marketError: any) {
              if (marketError.message.includes('already has a market')) {
                console.log(`⚠️ Market already exists for article: ${newArticle.title}`);
              } else {
                console.error(`❌ Error creating market for article ${newArticle.id}:`, marketError.message);
              }
            }

          } catch (articleError: any) {
            if (articleError.code === 'P2002') {
              console.log(`⚠️ Article already exists: ${article.title}`);
            } else {
              console.error(`❌ Error creating article:`, articleError.message);
            }
          }
        }
      } catch (categoryError) {
        console.error(`❌ Error fetching ${category} articles:`, categoryError);
      }
    }

    console.log(`🎉 News refresh completed: ${totalFetched} articles, ${marketsCreated} markets created`);
    
    res.json({ 
      message: 'Articles refreshed successfully',
      articlesCreated: totalFetched,
      marketsCreated: marketsCreated
    });

  } catch (error) {
    console.error('Refresh articles error:', error);
    res.status(500).json({ message: 'Error refreshing articles' });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await articleService.getCategories();
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};
