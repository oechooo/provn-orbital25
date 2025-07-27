// src/services/StartupService.ts

import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

export class StartupService {
  constructor(private readonly prisma: PrismaClient) {}

  async runStartupTasks(): Promise<void> {
    console.log('Running startup tasks...');
    
    // Check if startup news population is disabled
    if (process.env.DISABLE_STARTUP_NEWS_POPULATION === 'true') {
      console.log('Startup news population disabled by environment variable');
      return;
    }
    
    try {
      // Check if we should run the news population
      const shouldPopulateNews = await this.shouldPopulateNews();
      
      if (shouldPopulateNews) {
        console.log('Running news population on startup...');
        await this.runNewsPopulation();
      } else {
        console.log('Skipping news population (already has recent articles)');
      }
      
      console.log('Startup tasks completed successfully');
    } catch (error) {
      console.error('Startup tasks failed:', error);
      // Don't exit the process, just log the error
      // The server should still start even if news population fails
    }
  }

  private async shouldPopulateNews(): Promise<boolean> {
    try {
      // Check if we have any articles from the last 24 hours
      const recentArticles = await this.prisma.article.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      return recentArticles === 0;
    } catch (error) {
      console.error('Error checking if news population is needed:', error);
      // Default to running it if we can't determine
      return true;
    }
  }

  private async runNewsPopulation(): Promise<void> {
    console.log('Executing news population...');
    
    try {
      // Run the news population directly instead of spawning a separate process
      // This avoids path and compilation issues in production
      await this.populateNewsDirectly();
      console.log('News population completed successfully');
    } catch (error: any) {
      console.error('News population failed:', error.message);
      throw error;
    }
  }

  private async populateNewsDirectly(): Promise<void> {
    console.log('[NEWS] Starting direct news population...');
    
    const API_KEY = process.env.NEWS_API_KEY;
    if (!API_KEY) {
      console.error('[NEWS] NEWS_API_KEY not found in environment variables');
      return;
    }

    const axios = require('axios');
    const bcrypt = require('bcrypt');

    try {
      // Create or get bot user
      let bot = await this.prisma.user.findUnique({
        where: { email: 'bot@provn.io' }
      });

      if (!bot) {
        console.log('[NEWS] Creating market bot...');
        const hashedPassword = await bcrypt.hash('bot_secure_password_123', 10);
        bot = await this.prisma.user.create({
          data: {
            username: 'market_bot',
            email: 'bot@provn.io',
            password: hashedPassword,
            provePoints: 50000,
            avatarSkinColor: '9ca3af',
            avatarHairColor: '374151',
            avatarHair: 'short01',
            avatarEyes: 'variant01',
            avatarMouth: 'variant01',
            avatarAccessories: 'none'
          }
        });
        console.log('[NEWS] Created bot user with 50000 PP');
      } else {
        console.log(`[NEWS] Bot user exists with ${bot.provePoints} PP`);
        // Top up if needed
        if (bot.provePoints < 1000) {
          await this.prisma.user.update({
            where: { id: bot.id },
            data: { provePoints: 50000 }
          });
          console.log('[NEWS] Topped up bot prove points');
        }
      }

      // Fetch news articles (limit to 2 categories to keep it fast)
      const categories = ['technology', 'business'];
      const fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      let totalCreated = 0;
      let totalMarkets = 0;

      for (const category of categories) {
        console.log(`[NEWS] Fetching ${category} articles...`);
        
        const url = `https://newsapi.org/v2/top-headlines?apiKey=${API_KEY}&category=${category}&from=${fromDate}&pageSize=3&page=1`;
        const response = await axios.get(url);
        const articles = response.data.articles;
        
        console.log(`[NEWS] Found ${articles.length} articles for ${category}`);

        for (const article of articles.slice(0, 3)) { // Limit to 3 per category
          try {
            const newArticle = await this.prisma.article.create({
              data: {
                sourceName: article.source?.name ?? 'Unknown',
                author: article.author ?? null,
                title: article.title,
                description: article.description ?? null,
                url: article.url,
                urlToImage: article.urlToImage ?? null,
                publishedAt: new Date(article.publishedAt),
                content: article.content ?? null,
                category: category,
              },
            });

            // Create market for the article
            const market = await this.prisma.market.create({
              data: {
                articleId: newArticle.id,
                resolveCount: 0,
                outcome: null,
                sharesTrue: 0,
                sharesFalse: 0,
                probTrue: 0.5,
                probFalse: 0.5,
                nextResolve: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                closed: false
              }
            });

            console.log(`[NEWS] Created: ${article.title.substring(0, 50)}...`);
            totalCreated++;
            totalMarkets++;

            // Create a few bot stakes for this market (simplified)
            const { MarketService } = require('../services/MarketService');
            const { StakeService } = require('../services/StakeService');
            
            const marketService = new MarketService(this.prisma);
            const stakeService = new StakeService(this.prisma);

            // Create 2-3 stakes per market
            const numStakes = 2 + Math.floor(Math.random() * 2);
            for (let i = 0; i < numStakes; i++) {
              try {
                const stakeAmount = 20 + Math.floor(Math.random() * 30); // 20-50 PP
                const prediction = Math.random() > 0.5;
                
                await stakeService.createStake(bot.id, market.id, prediction, stakeAmount);
                console.log(`[NEWS]   - Bot stake: ${stakeAmount} PP on ${prediction ? 'TRUE' : 'FALSE'}`);
                
                // Small delay between stakes
                await new Promise(resolve => setTimeout(resolve, 50));
              } catch (stakeError: any) {
                console.log(`[NEWS]   - Stake failed: ${stakeError.message}`);
                break; // Stop if bot runs out of points
              }
            }

          } catch (err: any) {
            if (err.code === 'P2002') {
              console.log(`[NEWS] Skipping duplicate: ${article.title.substring(0, 50)}...`);
            } else {
              console.error(`[NEWS] Error creating article: ${err.message}`);
            }
          }
        }
      }

      console.log(`[NEWS] Summary: ${totalCreated} articles, ${totalMarkets} markets created`);
      
    } catch (error: any) {
      console.error('[NEWS] Error in direct news population:', error.message);
      throw error;
    }
  }
}

