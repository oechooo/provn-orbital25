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
    return new Promise((resolve, reject) => {
      try {
        console.log('Executing fetchAndPopulateNews script...');
        
        // Use spawn for better output streaming
        const { spawn } = require('child_process');
        const scriptPath = require('path').join(__dirname, '../../scripts/fetchAndPopulateNews.ts');
        
        const process = spawn('npx', ['ts-node', scriptPath], {
          stdio: 'pipe',
          shell: true
        });

        let output = '';
        let errorOutput = '';

        process.stdout.on('data', (data: Buffer) => {
          const message = data.toString();
          output += message;
          // Stream output to console with prefix
          message.split('\n').forEach(line => {
            if (line.trim()) {
              console.log(`[NEWS] ${line}`);
            }
          });
        });

        process.stderr.on('data', (data: Buffer) => {
          const message = data.toString();
          errorOutput += message;
          console.error(`[NEWS ERROR] ${message}`);
        });

        process.on('close', (code: number) => {
          if (code === 0) {
            console.log('News population completed successfully');
            resolve();
          } else {
            console.error(`News population failed with code ${code}`);
            console.error('Error output:', errorOutput);
            reject(new Error(`News population script exited with code ${code}`));
          }
        });

        // Set a timeout to prevent hanging
        const timeout = setTimeout(() => {
          process.kill();
          reject(new Error('News population script timed out after 5 minutes'));
        }, 5 * 60 * 1000); // 5 minutes

        process.on('close', () => {
          clearTimeout(timeout);
        });

      } catch (error) {
        console.error('Failed to start news population script:', error);
        reject(error);
      }
    });
  }
}
