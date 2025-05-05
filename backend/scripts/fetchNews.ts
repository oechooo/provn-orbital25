// scripts/fetchNews.ts

import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function fetchAndStoreArticles() {
  const API_KEY = process.env.NEWS_API_KEY;
  const CATEGORIES = ["business", "entertainment", "health", "science", "sports", "technology"];
  const QUERIES = 5;

  try {
    for (const category of CATEGORIES) {
      const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}&category=${category}&pageSize=${QUERIES}&page=1`;
      const response = await axios.get(url);
      const articles = response.data.articles;

      for (const article of articles) {
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
          await prisma.article.create({
            data: {
              sourceName: source.name ?? 'Unknown',
              author: author ?? null,
              title,
              description: description ?? null,
              url,
              urlToImage: urlToImage ?? null,
              publishedAt: new Date(publishedAt),
              content: content ?? null,
              category, // <-- Add this line
            },
          });
          console.log(`✅ Added article: ${title}`);
        } catch (err: any) {
          if (err.code === 'P2002') {
            console.log(`⚠️ Skipping duplicate article: ${title}`);
          } else {
            console.error(`❌ Error inserting article: ${title}`, err);
          }
        }
      }
    }
  } catch (err) {
    console.error('❌ Failed to fetch news:', err);
  } finally {
    await prisma.$disconnect();
  }
}

fetchAndStoreArticles();
