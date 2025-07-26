"use strict";
// src/services/StartupService.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartupService = void 0;
class StartupService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    runStartupTasks() {
        return __awaiter(this, void 0, void 0, function* () {
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
                const shouldPopulateNews = yield this.shouldPopulateNews();
                if (shouldPopulateNews) {
                    console.log('Running news population on startup...');
                    yield this.runNewsPopulation();
                }
                else {
                    console.log('Skipping news population (already has recent articles)');
                }
                console.log('Startup tasks completed successfully');
            }
            catch (error) {
                console.error('Startup tasks failed:', error);
                // Don't exit the process, just log the error
                // The server should still start even if news population fails
            }
        });
    }
    shouldPopulateNews() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
                // In development, be more aggressive about fetching fresh news
                // Check for articles from the last 4 hours instead of 24 hours
                const timeWindow = isProduction ? 24 * 60 * 60 * 1000 : 4 * 60 * 60 * 1000; // 24h vs 4h
                // Check if we have any articles from the specified time window
                const recentArticles = yield this.prisma.article.count({
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - timeWindow)
                        }
                    }
                });
                console.log(`Found ${recentArticles} articles from last ${isProduction ? '24' : '4'} hours`);
                return recentArticles === 0;
            }
            catch (error) {
                console.error('Error checking if news population is needed:', error);
                // Default to running it if we can't determine
                return true;
            }
        });
    }
    runNewsPopulation() {
        return __awaiter(this, void 0, void 0, function* () {
            // Determine which script to use based on environment
            // In development (local), we want real news from NewsAPI
            // In production (Render), we want mock news to avoid API costs
            const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
            // Force real news in development for better testing
            const scriptName = isProduction ? 'mockAndPopulateNews.ts' : 'fetchAndPopulateNews.ts';
            console.log(`Executing ${scriptName} script (Environment: ${isProduction ? 'production' : 'development'})...`);
            try {
                yield this.runScript(scriptName);
                console.log('News population completed successfully');
            }
            catch (error) {
                console.error('News population failed:', error.message);
                throw error;
            }
        });
    }
    runScript(scriptName) {
        return __awaiter(this, void 0, void 0, function* () {
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
            yield this.runWithTsNode(tsScriptPath);
        });
    }
    runWithTsNode(tsPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const { spawn } = require('child_process');
            console.log('[NEWS] ========== TS-NODE EXECUTION ==========');
            console.log(`[NEWS] Executing TypeScript with ts-node: ${tsPath}`);
            console.log(`[NEWS] Command: npx ts-node ${tsPath}`);
            return new Promise((resolve, reject) => {
                const childProcess = spawn('npx', ['ts-node', tsPath], {
                    stdio: 'pipe',
                    shell: true,
                    env: Object.assign({}, process.env), // Pass all environment variables
                    cwd: require('path').dirname(tsPath) // Set working directory to script location
                });
                console.log(`[NEWS] Process spawned with PID: ${childProcess.pid}`);
                this.setupProcessHandlers(childProcess, resolve, reject, 'TS-NODE');
            });
        });
    }
    setupProcessHandlers(childProcess, resolve, reject, strategy = 'UNKNOWN') {
        // Don't accumulate all output in memory - just stream it
        let hasErrors = false;
        let lastErrorSnippet = '';
        console.log(`[NEWS] Setting up process handlers for ${strategy} strategy`);
        childProcess.stdout.on('data', (data) => {
            const message = data.toString();
            // Stream output to console with prefix (don't store in memory)
            message.split('\n').forEach(line => {
                if (line.trim()) {
                    console.log(`[NEWS ${strategy}] ${line}`);
                }
            });
        });
        childProcess.stderr.on('data', (data) => {
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
        childProcess.on('close', (code) => {
            console.log(`[NEWS ${strategy}] Process closed with exit code: ${code}`);
            if (code === 0) {
                console.log(`[NEWS ${strategy}] ✅ Execution completed successfully`);
                resolve();
            }
            else {
                console.log(`[NEWS ${strategy}] ❌ Execution failed`);
                console.log(`[NEWS ${strategy}] Error details: ${hasErrors ? lastErrorSnippet : 'No error details available'}`);
                reject(new Error(`${strategy} script exited with code ${code}. Error: ${hasErrors ? lastErrorSnippet : 'Unknown error'}`));
            }
        });
        childProcess.on('error', (error) => {
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
exports.StartupService = StartupService;
//# sourceMappingURL=StartupService.js.map