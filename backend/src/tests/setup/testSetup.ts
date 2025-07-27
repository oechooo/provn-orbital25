import { PrismaClient } from '@prisma/client';

export class TestSetup {
  private static prisma: PrismaClient;

  static async setupTestDatabase(): Promise<PrismaClient> {
    if (!this.prisma) {
      // Use test database or in-memory for testing
      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
          }
        }
      });
      
      await this.resetDatabase();
    }
    
    return this.prisma;
  }

  static async resetDatabase(): Promise<void> {
    try {
      // Disable foreign key constraints temporarily
      await this.prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
      
      // Clear all data
      await this.prisma.stake.deleteMany();
      await this.prisma.market.deleteMany();
      await this.prisma.article.deleteMany();
      await this.prisma.user.deleteMany();
      
      // Re-enable foreign key constraints
      await this.prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
    } catch (error) {
      console.error('Database reset failed:', error);
      // Re-enable foreign keys even if reset failed
      try {
        await this.prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
      } catch (fkError) {
        console.error('Failed to re-enable foreign keys:', fkError);
      }
      throw error;
    }
  }

  static async createTestUser(overrides: any = {}): Promise<any> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return await this.prisma.user.create({
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

  static async createTestArticle(overrides: any = {}): Promise<any> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return await this.prisma.article.create({
      data: {
        sourceName: 'Test Source',
        title: `Test Article ${timestamp}`,
        description: 'Test description for testing purposes',
        url: `https://test.example.com/article_${timestamp}_${random}`,
        category: 'technology',
        publishedAt: new Date().toISOString(),
        ...overrides
      }
    });
  }

  static async createTestMarket(articleId: number, overrides: any = {}): Promise<any> {
    return await this.prisma.market.create({
      data: {
        articleId,
        probTrue: 0.5,
        probFalse: 0.5,
        sharesTrue: 0,
        sharesFalse: 0,
        nextResolve: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        closed: false,
        outcome: null,
        ...overrides
      }
    });
  }

  static async teardown(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
  }
}
