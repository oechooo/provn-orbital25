import { PrismaClient } from '@prisma/client';

export class TestSetup {
  private static prismaInstances: Map<string, PrismaClient> = new Map();
  private static resetLocks: Map<string, boolean> = new Map();

  static async setupTestDatabase(testSuiteName?: string): Promise<PrismaClient> {
    const instanceKey = testSuiteName || 'default';
    
    if (!this.prismaInstances.has(instanceKey)) {
      // Create a unique Prisma instance for this test suite
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
          }
        }
      });
      
      this.prismaInstances.set(instanceKey, prisma);
      this.resetLocks.set(instanceKey, false);
      
      await this.resetDatabase(instanceKey);
    }
    
    return this.prismaInstances.get(instanceKey)!;
  }

  static async resetDatabase(instanceKey: string = 'default'): Promise<void> {
    const prisma = this.prismaInstances.get(instanceKey);
    if (!prisma) {
      throw new Error(`No Prisma instance found for key: ${instanceKey}`);
    }

    // Prevent concurrent resets for this instance
    if (this.resetLocks.get(instanceKey)) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.resetDatabase(instanceKey);
    }
    
    this.resetLocks.set(instanceKey, true);
    
    try {
      // Use transaction for reliable cleanup
      await prisma.$transaction(async (tx) => {
        // Clear all data in correct order (respecting foreign keys)
        await tx.$executeRaw`PRAGMA foreign_keys = OFF;`;
        await tx.$executeRaw`DELETE FROM CommentVote;`;
        await tx.$executeRaw`DELETE FROM Comment;`;
        await tx.$executeRaw`DELETE FROM Stake;`;
        await tx.$executeRaw`DELETE FROM Market;`;
        await tx.$executeRaw`DELETE FROM Article;`;
        await tx.$executeRaw`DELETE FROM User;`;
        
        // Reset sequences
        await tx.$executeRaw`UPDATE sqlite_sequence SET seq = 0 WHERE name IN ('User', 'Article', 'Market', 'Stake', 'Comment', 'CommentVote');`;
        await tx.$executeRaw`PRAGMA foreign_keys = ON;`;
      });
      
      // Add a small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 50));
      
    } catch (error) {
      console.error(`Database reset failed for ${instanceKey}:`, error);
      // Fallback cleanup 
      try {
        await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
        await prisma.$executeRaw`DELETE FROM CommentVote;`;
        await prisma.$executeRaw`DELETE FROM Comment;`;
        await prisma.$executeRaw`DELETE FROM Stake;`;
        await prisma.$executeRaw`DELETE FROM Market;`;
        await prisma.$executeRaw`DELETE FROM Article;`;
        await prisma.$executeRaw`DELETE FROM User;`;
        await prisma.$executeRaw`UPDATE sqlite_sequence SET seq = 0 WHERE name IN ('User', 'Article', 'Market', 'Stake', 'Comment', 'CommentVote');`;
        await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (fallbackError) {
        console.error(`Fallback reset failed for ${instanceKey}:`, fallbackError);
      }
    } finally {
      this.resetLocks.set(instanceKey, false);
    }
  }

  static async createTestUser(overrides: any = {}, instanceKey: string = 'default'): Promise<any> {
    const prisma = this.prismaInstances.get(instanceKey);
    if (!prisma) {
      throw new Error(`No Prisma instance found for key: ${instanceKey}`);
    }

    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    
    // Wait a bit to ensure unique timestamps
    await new Promise(resolve => setTimeout(resolve, 1));
    
    return await prisma.user.create({
      data: {
        username: `testuser_${timestamp}_${random}`,
        email: `test_${timestamp}_${random}@example.com`,
        password: 'hashed_password',
        provePoints: 1000,
        avatarSkinColor: 'f4c2a1',
        avatarHairColor: '8b4513',
        avatarHair: 'short01',
        avatarEyes: 'variant01',
        avatarMouth: 'variant01',
        avatarAccessories: 'none',
        purchasedHair: '[]',
        purchasedEyes: '[]',
        purchasedMouth: '[]',
        purchasedAccessories: '[]',
        ...overrides
      }
    });
  }

  static async createTestArticle(overrides: any = {}, instanceKey: string = 'default'): Promise<any> {
    const prisma = this.prismaInstances.get(instanceKey);
    if (!prisma) {
      throw new Error(`No Prisma instance found for key: ${instanceKey}`);
    }

    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    
    // Wait a bit to ensure unique timestamps
    await new Promise(resolve => setTimeout(resolve, 1));
    
    return await prisma.article.create({
      data: {
        sourceName: 'Test Source',
        title: `Test Article ${timestamp}_${random}`,
        description: 'Test description for testing purposes',
        url: `https://test.example.com/article_${timestamp}_${random}`,
        category: 'technology',
        publishedAt: new Date().toISOString(),
        ...overrides
      }
    });
  }

  static async createTestMarket(articleId: number, overrides: any = {}, instanceKey: string = 'default'): Promise<any> {
    const prisma = this.prismaInstances.get(instanceKey);
    if (!prisma) {
      throw new Error(`No Prisma instance found for key: ${instanceKey}`);
    }

    // Always create a new market rather than checking for existing ones
    // This prevents race conditions in tests
    return await prisma.market.create({
      data: {
        articleId,
        probTrue: 0.5,
        probFalse: 0.5,
        sharesTrue: 100,
        sharesFalse: 100,
        nextResolve: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        closed: false,
        outcome: null,
        probHistory: JSON.stringify([{ date: new Date().toISOString(), probTrue: 0.5 }]),
        ...overrides
      }
    });
  }

  static async teardown(instanceKey?: string): Promise<void> {
    if (instanceKey) {
      // Teardown specific instance
      const prisma = this.prismaInstances.get(instanceKey);
      if (prisma) {
        try {
          await this.resetDatabase(instanceKey);
          await prisma.$disconnect();
        } catch (error) {
          console.error(`Teardown error for ${instanceKey}:`, error);
        } finally {
          this.prismaInstances.delete(instanceKey);
          this.resetLocks.delete(instanceKey);
        }
      }
    } else {
      // Teardown all instances
      for (const [key, prisma] of this.prismaInstances.entries()) {
        try {
          await this.resetDatabase(key);
          await prisma.$disconnect();
        } catch (error) {
          console.error(`Teardown error for ${key}:`, error);
        }
      }
      this.prismaInstances.clear();
      this.resetLocks.clear();
    }
  }
}