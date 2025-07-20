// scripts/fetchNews.ts

import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function fetchAndStoreArticles() {
  console.log('🚀 Starting fetchNews.ts script...');
  console.log('📡 Fetching fresh news articles and creating markets...\n');
  
  const API_KEY = process.env.NEWS_API_KEY;
  
  if (!API_KEY) {
    console.error('❌ NEWS_API_KEY not found in environment variables');
    return;
  }
  
  console.log('✅ API Key found, proceeding with fetch...');
  
  const CATEGORIES = ["business", "entertainment", "health", "science", "sports", "technology"];
  const QUERIES = 5;
  const fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 24H ago

  try {
    let totalArticlesProcessed = 0;
    let totalArticlesCreated = 0;
    let totalMarketsCreated = 0;
    
    for (const category of CATEGORIES) {
      console.log(`\n📂 Processing category: ${category.toUpperCase()}`);
      const url = `https://newsapi.org/v2/top-headlines?apiKey=${API_KEY}&category=${category}&from=${fromDate}&pageSize=${QUERIES}&page=1`;
      const response = await axios.get(url);
      const articles = response.data.articles;
      
      console.log(`   Found ${articles.length} articles for ${category}`);
      totalArticlesProcessed += articles.length;

      for (const article of articles) {
        totalArticlesProcessed++;
        const {
          source,
          author,
          title,
          description,
          url,
          urlToImage,
          publishedAt,
          content,
        } = article;

        try {
          // Deduct 12 hours from the published date to adjust for timezone differences between ET and GMT+8
          const originalPublishedAt = new Date(publishedAt);
          const adjustedPublishedAt = new Date(originalPublishedAt.getTime() - 12 * 60 * 60 * 1000);
          
          const newArticle = await prisma.article.create({
            data: {
              sourceName: source.name ?? 'Unknown',
              author: author ?? null,
              title,
              description: description ?? null,
              url,
              urlToImage: urlToImage ?? null,
              publishedAt: adjustedPublishedAt,
              content: content ?? null,
              category, // <-- Add this line
            },
          });
          console.log(`✅ Added article: ${title}`);
          totalArticlesCreated++;
          
          // Create market for the new article
          try {
            const market = await prisma.market.create({
              data: {
                articleId: newArticle.id,
                resolveCount: 0,
                outcome: null,
                sharesTrue: 0,
                sharesFalse: 0,
                probTrue: 0.5,
                probFalse: 0.5,
                nextResolve: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                closed: false
              }
            });
            console.log(`📊 Created market ${market.id} for article ${newArticle.id}`);
            totalMarketsCreated++;
          } catch (marketErr: any) {
            console.error(`❌ Error creating market for article ${newArticle.id}:`, marketErr);
          }
        } catch (err: any) {
          if (err.code === 'P2002') {
            console.log(`⚠️ Skipping duplicate article: ${title}`);
          } else {
            console.error(`❌ Error inserting article: ${title}`, err);
          }
        }
      }
    }

    console.log(`\n✅ Process complete!`);
    console.log('\n📊 SUMMARY:');
    console.log(`📰 Total articles processed: ${totalArticlesProcessed}`);
    console.log(`✅ New articles created: ${totalArticlesCreated}`);
    console.log(`📊 Markets created: ${totalMarketsCreated}`);
    console.log(`⚠️  Duplicate articles skipped: ${totalArticlesProcessed - totalArticlesCreated}`);
  } catch (err) {
    console.error('❌ Failed to fetch news:', err);
  } finally {
    await prisma.$disconnect();
  }
}

fetchAndStoreArticles();
