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
    console.log('Executing fetchAndPopulateNews script...');
    
    try {
      await this.runOriginalScript();
      console.log('News population completed successfully');
    } catch (error: any) {
      console.error('News population failed:', error.message);
      throw error;
    }
  }

  private async runOriginalScript(): Promise<void> {
    const path = require('path');
    const fs = require('fs');
    
    console.log('[NEWS] ========== SCRIPT EXECUTION DEBUG INFO ==========');
    
    // Determine the correct script path and execution method
    const isProduction = process.env.NODE_ENV === 'production';
    const scriptDir = path.join(__dirname, '../../scripts');
    const tsScriptPath = path.join(scriptDir, 'fetchAndPopulateNews.ts');
    const jsScriptPath = path.join(scriptDir, 'fetchAndPopulateNews.js');
    
    console.log(`[NEWS] Environment: ${isProduction ? 'production' : 'development'}`);
    console.log(`[NEWS] Current working directory: ${process.cwd()}`);
    console.log(`[NEWS] __dirname: ${__dirname}`);
    console.log(`[NEWS] Script directory: ${scriptDir}`);
    console.log(`[NEWS] TypeScript script path: ${tsScriptPath}`);
    console.log(`[NEWS] JavaScript script path: ${jsScriptPath}`);
    
    // Check file existence
    const tsExists = fs.existsSync(tsScriptPath);
    const jsExists = fs.existsSync(jsScriptPath);
    console.log(`[NEWS] TypeScript file exists: ${tsExists}`);
    console.log(`[NEWS] JavaScript file exists: ${jsExists}`);
    
    // List directory contents for debugging
    try {
      const dirContents = fs.readdirSync(scriptDir);
      console.log(`[NEWS] Scripts directory contents: ${dirContents.join(', ')}`);
    } catch (error) {
      console.log(`[NEWS] ERROR: Could not read scripts directory: ${error}`);
    }
    
    // Check environment variables
    console.log(`[NEWS] NEWS_API_KEY exists: ${!!process.env.NEWS_API_KEY}`);
    console.log(`[NEWS] DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
    
    // Check if required tools are available
    try {
      require('child_process').execSync('node --version', { stdio: 'pipe' });
      console.log('[NEWS] Node.js is available');
    } catch (error) {
      console.log(`[NEWS] ERROR: Node.js not available: ${error}`);
    }
    
    try {
      require('child_process').execSync('npx --version', { stdio: 'pipe' });
      console.log('[NEWS] npx is available');
    } catch (error) {
      console.log(`[NEWS] ERROR: npx not available: ${error}`);
    }
    
    try {
      require('child_process').execSync('npx tsc --version', { stdio: 'pipe' });
      console.log('[NEWS] TypeScript compiler is available');
    } catch (error) {
      console.log(`[NEWS] WARNING: TypeScript compiler not available: ${error}`);
    }
    
    try {
      require('child_process').execSync('npx ts-node --version', { stdio: 'pipe' });
      console.log('[NEWS] ts-node is available');
    } catch (error) {
      console.log(`[NEWS] WARNING: ts-node not available: ${error}`);
    }
    
    console.log('[NEWS] ================================================');
    
    if (!tsExists) {
      throw new Error(`TypeScript script not found at: ${tsScriptPath}`);
    }
    
    if (isProduction) {
      console.log('[NEWS] Attempting production execution strategy...');
      await this.runInProduction(tsScriptPath, jsScriptPath);
    } else {
      console.log('[NEWS] Attempting development execution strategy...');
      await this.runInDevelopment(tsScriptPath);
    }
  }

  private async runInProduction(tsScriptPath: string, jsScriptPath: string): Promise<void> {
    const fs = require('fs');
    
    console.log('[NEWS] ========== PRODUCTION EXECUTION STRATEGY ==========');
    console.log('[NEWS] Step 1: Attempting TypeScript compilation...');
    
    // First, try to compile the TypeScript file to JavaScript
    try {
      console.log('[NEWS] Starting TypeScript compilation process...');
      await this.compileTypeScript(tsScriptPath, jsScriptPath);
      console.log('[NEWS] ✅ TypeScript compilation successful');
      
      // Check if the compiled file actually exists
      if (fs.existsSync(jsScriptPath)) {
        console.log('[NEWS] ✅ Compiled JavaScript file confirmed to exist');
        console.log('[NEWS] Step 2: Running compiled JavaScript script...');
        return await this.runCompiledScript(jsScriptPath);
      } else {
        console.log('[NEWS] ❌ Compiled JavaScript file not found after compilation');
        throw new Error('Compilation succeeded but output file not found');
      }
      
    } catch (compileError: any) {
      console.log(`[NEWS] ❌ TypeScript compilation failed: ${compileError.message}`);
      console.log('[NEWS] Step 2 (Fallback): Attempting ts-node execution...');
      return await this.runWithTsNode(tsScriptPath);
    }
  }

  private async runInDevelopment(tsScriptPath: string): Promise<void> {
    console.log('[NEWS] ========== DEVELOPMENT EXECUTION STRATEGY ==========');
    console.log('[NEWS] Using ts-node for direct TypeScript execution...');
    return await this.runWithTsNode(tsScriptPath);
  }

  private async compileTypeScript(tsPath: string, jsPath: string): Promise<void> {
    const { spawn } = require('child_process');
    const path = require('path');
    
    console.log(`[NEWS] Compilation input: ${tsPath}`);
    console.log(`[NEWS] Compilation output: ${jsPath}`);
    console.log(`[NEWS] Output directory: ${path.dirname(jsPath)}`);
    
    return new Promise((resolve, reject) => {
      const args = [
        'tsc', 
        tsPath, 
        '--outDir', path.dirname(jsPath), 
        '--target', 'es2020', 
        '--module', 'commonjs',
        '--moduleResolution', 'node',
        '--allowSyntheticDefaultImports',
        '--esModuleInterop'
      ];
      
      console.log(`[NEWS] Executing: npx ${args.join(' ')}`);
      
      const childProcess = spawn('npx', args, {
        stdio: 'pipe',
        shell: true
      });

      let stdout = '';
      let stderr = '';
      
      childProcess.stdout.on('data', (data: Buffer) => {
        const message = data.toString();
        stdout += message;
        console.log(`[NEWS COMPILE STDOUT] ${message.trim()}`);
      });
      
      childProcess.stderr.on('data', (data: Buffer) => {
        const message = data.toString();
        stderr += message;
        console.log(`[NEWS COMPILE STDERR] ${message.trim()}`);
      });

      childProcess.on('close', (code: number) => {
        console.log(`[NEWS] Compilation process exited with code: ${code}`);
        console.log(`[NEWS] STDOUT: ${stdout || '(empty)'}`);
        console.log(`[NEWS] STDERR: ${stderr || '(empty)'}`);
        
        if (code === 0) {
          console.log('[NEWS] ✅ Compilation process completed successfully');
          resolve();
        } else {
          console.log(`[NEWS] ❌ Compilation process failed with code ${code}`);
          reject(new Error(`TypeScript compilation failed with code ${code}: ${stderr}`));
        }
      });

      childProcess.on('error', (error: Error) => {
        console.log(`[NEWS] ❌ Compilation process error: ${error.message}`);
        reject(error);
      });

      // 60 second timeout for compilation
      const timeout = setTimeout(() => {
        console.log('[NEWS] ❌ Compilation timed out after 60 seconds');
        childProcess.kill();
        reject(new Error('TypeScript compilation timed out'));
      }, 60000);
      
      childProcess.on('close', () => {
        clearTimeout(timeout);
      });
    });
  }

  private async runCompiledScript(jsPath: string): Promise<void> {
    const { spawn } = require('child_process');
    
    console.log('[NEWS] ========== COMPILED SCRIPT EXECUTION ==========');
    console.log(`[NEWS] Executing compiled JavaScript: ${jsPath}`);
    console.log(`[NEWS] Command: node ${jsPath}`);
    
    return new Promise((resolve, reject) => {
      const childProcess = spawn('node', [jsPath], {
        stdio: 'pipe',
        shell: true,
        env: { ...process.env }, // Pass all environment variables
        cwd: require('path').dirname(jsPath) // Set working directory to script location
      });

      console.log(`[NEWS] Process spawned with PID: ${childProcess.pid}`);
      this.setupProcessHandlers(childProcess, resolve, reject, 'COMPILED');
    });
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
