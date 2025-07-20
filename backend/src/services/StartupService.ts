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
    
    // Check memory limit
    const memUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`Current memory usage: ${Math.round(memUsage)}MB`);
    
    if (memUsage > 300) {
      console.log('High memory usage detected, skipping news population to prevent out-of-memory error');
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
    // Determine which script to use based on environment
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
    const scriptName = isProduction ? 'mockAndPopulateNews.ts' : 'fetchAndPopulateNews.ts';
    
    console.log(`Executing ${scriptName} script (Environment: ${isProduction ? 'production' : 'development'})...`);
    
    try {
      await this.runScript(scriptName);
      console.log('News population completed successfully');
    } catch (error: any) {
      console.error('News population failed:', error.message);
      throw error;
    }
  }

  private async runScript(scriptName: string): Promise<void> {
    const path = require('path');
    const fs = require('fs');
    
    console.log('[NEWS] ========== SCRIPT EXECUTION ==========');
    
    // Determine the correct script path
    const scriptDir = path.join(__dirname, '../../scripts');
    const tsScriptPath = path.join(scriptDir, scriptName);
    
    console.log(`[NEWS] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[NEWS] Script: ${scriptName}`);
    console.log(`[NEWS] Script path: ${tsScriptPath}`);
    
    // Check file existence
    const tsExists = fs.existsSync(tsScriptPath);
    console.log(`[NEWS] TypeScript file exists: ${tsExists}`);
    
    if (!tsExists) {
      throw new Error(`TypeScript script not found at: ${tsScriptPath}`);
    }
    
    // Use simplified ts-node strategy for all environments (it's the most reliable)
    console.log('[NEWS] Using ts-node execution strategy...');
    await this.runWithTsNode(tsScriptPath);
  }

  private async runWithTsNode(tsPath: string): Promise<void> {
    const { spawn } = require('child_process');
    
    console.log('[NEWS] ========== TS-NODE EXECUTION ==========');
    console.log(`[NEWS] Executing TypeScript with ts-node: ${tsPath}`);
    console.log(`[NEWS] Command: npx ts-node ${tsPath}`);
    
    return new Promise((resolve, reject) => {
      const childProcess = spawn('npx', ['ts-node', tsPath], {
        stdio: 'pipe',
        shell: true,
        env: { ...process.env }, // Pass all environment variables
        cwd: require('path').dirname(tsPath) // Set working directory to script location
      });

      console.log(`[NEWS] Process spawned with PID: ${childProcess.pid}`);
      this.setupProcessHandlers(childProcess, resolve, reject, 'TS-NODE');
    });
  }

  private setupProcessHandlers(childProcess: any, resolve: () => void, reject: (error: Error) => void, strategy: string = 'UNKNOWN'): void {
    // Don't accumulate all output in memory - just stream it
    let hasErrors = false;
    let lastErrorSnippet = '';

    console.log(`[NEWS] Setting up process handlers for ${strategy} strategy`);

    childProcess.stdout.on('data', (data: Buffer) => {
      const message = data.toString();
      // Stream output to console with prefix (don't store in memory)
      message.split('\n').forEach(line => {
        if (line.trim()) {
          console.log(`[NEWS ${strategy}] ${line}`);
        }
      });
    });

    childProcess.stderr.on('data', (data: Buffer) => {
      const message = data.toString();
      hasErrors = true;
      // Only keep the last error snippet, not all errors
      lastErrorSnippet = message.slice(-500); // Keep only last 500 chars
      message.split('\n').forEach(line => {
        if (line.trim()) {
          console.error(`[NEWS ${strategy} ERROR] ${line}`);
        }
      });
    });

    childProcess.on('close', (code: number) => {
      console.log(`[NEWS ${strategy}] Process closed with exit code: ${code}`);
      
      if (code === 0) {
        console.log(`[NEWS ${strategy}] ✅ Execution completed successfully`);
        resolve();
      } else {
        console.log(`[NEWS ${strategy}] ❌ Execution failed`);
        console.log(`[NEWS ${strategy}] Error details: ${hasErrors ? lastErrorSnippet : 'No error details available'}`);
        reject(new Error(`${strategy} script exited with code ${code}. Error: ${hasErrors ? lastErrorSnippet : 'Unknown error'}`));
      }
    });

    childProcess.on('error', (error: Error) => {
      console.log(`[NEWS ${strategy}] ❌ Process error: ${error.message}`);
      reject(error);
    });

    // Set a timeout to prevent hanging (3 minutes instead of 5)
    const timeout = setTimeout(() => {
      console.log(`[NEWS ${strategy}] ❌ Execution timed out after 3 minutes`);
      childProcess.kill('SIGTERM');
      
      // If SIGTERM doesn't work, use SIGKILL after 5 seconds
      setTimeout(() => {
        if (!childProcess.killed) {
          console.log(`[NEWS ${strategy}] Force killing with SIGKILL`);
          childProcess.kill('SIGKILL');
        }
      }, 5000);
      
      reject(new Error(`${strategy} script execution timed out after 3 minutes`));
    }, 3 * 60 * 1000); // 3 minutes instead of 5

    childProcess.on('close', () => {
      clearTimeout(timeout);
    });
  }
}
