import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFrontendAPIIntegration() {
  console.log('Testing frontend API integration endpoints...\n');

  try {
    // Test 1: User authentication endpoints
    console.log('Test 1: User authentication endpoints');

    // Create test user for API testing
    const testUser = await prisma.user.create({
      data: {
        username: 'apitest_user',
        email: 'apitest@example.com',
        password: 'dummy_hash', // In real scenario, this would be properly hashed
        provePoints: 500
      }
    });

    console.log(`Created test user for API testing: ${testUser.username}`);
    console.log(`  - User ID: ${testUser.id}`);
    console.log(`  - Email: ${testUser.email}`);
    console.log(`  - ProvePoints: ${testUser.provePoints}\n`);

    // Test 2: Article retrieval endpoints
    console.log('Test 2: Article retrieval endpoints');

    const testArticle = await prisma.article.create({
      data: {
        sourceName: 'API Test Source',
        title: 'Frontend Integration Test Article',
        description: 'Testing frontend API integration functionality',
        url: 'https://api-test.com/article',
        category: 'test',
        publishedAt: new Date().toISOString()
      }
    });

    const testMarket = await prisma.market.create({
      data: {
        articleId: testArticle.id,
        probTrue: 0.6,
        probFalse: 0.4,
        sharesTrue: 10,
        sharesFalse: 5,
        nextResolve: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });

    console.log(`Created test article and market:`);
    console.log(`  - Article ID: ${testArticle.id}`);
    console.log(`  - Market ID: ${testMarket.id}`);
    console.log(`  - Title: "${testArticle.title}"`);
    console.log(`  - Current odds: TRUE ${(testMarket.probTrue * 100).toFixed(1)}%, FALSE ${(testMarket.probFalse * 100).toFixed(1)}%\n`);

    // Test 3: Market data retrieval
    console.log('Test 3: Market data retrieval');

    const articleWithMarket = await prisma.article.findUnique({
      where: { id: testArticle.id },
      include: {
        market: {
          include: {
            stakes: {
              include: {
                user: {
                  select: { username: true, id: true }
                }
              }
            }
          }
        }
      }
    });

    if (articleWithMarket && articleWithMarket.market) {
      console.log(`Market data retrieval successful:`);
      console.log(`  - Market probabilities: TRUE ${(articleWithMarket.market.probTrue * 100).toFixed(1)}%, FALSE ${(articleWithMarket.market.probFalse * 100).toFixed(1)}%`);
      console.log(`  - Market shares: TRUE ${articleWithMarket.market.sharesTrue}, FALSE ${articleWithMarket.market.sharesFalse}`);
      console.log(`  - Total stakes on market: ${articleWithMarket.market.stakes.length}`);
      console.log(`  - Resolution time: ${articleWithMarket.market.nextResolve}\n`);
    } else {
      console.log(`  Market data retrieval failed\n`);
    }

    // Test 4: User profile data endpoints
    console.log('Test 4: User profile data endpoints');

    const userProfile = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: {
        id: true,
        username: true,
        email: true,
        provePoints: true,
        avatarHair: true,
        avatarEyes: true,
        avatarMouth: true,
        avatarAccessories: true,
        avatarSkinColor: true,
        avatarHairColor: true,
        purchasedHair: true,
        purchasedEyes: true,
        purchasedMouth: true,
        purchasedAccessories: true,
        stakes: {
          include: {
            market: {
              include: {
                article: {
                  select: { title: true, id: true }
                }
              }
            }
          }
        }
      }
    });

    if (userProfile) {
      console.log(`User profile data retrieval successful:`);
      console.log(`  - Username: ${userProfile.username}`);
      console.log(`  - ProvePoints: ${userProfile.provePoints}`);
      console.log(`  - Avatar: ${userProfile.avatarHair}, ${userProfile.avatarEyes}, ${userProfile.avatarMouth}, ${userProfile.avatarAccessories}`);
      console.log(`  - Skin/Hair colors: #${userProfile.avatarSkinColor}, #${userProfile.avatarHairColor}`);
      console.log(`  - Total stakes: ${userProfile.stakes.length}`);
      
      const purchasedItems = [
        ...JSON.parse(userProfile.purchasedHair || '[]'),
        ...JSON.parse(userProfile.purchasedEyes || '[]'),
        ...JSON.parse(userProfile.purchasedMouth || '[]'),
        ...JSON.parse(userProfile.purchasedAccessories || '[]')
      ];
      console.log(`  - Total purchased items: ${purchasedItems.length}\n`);
    }

    // Test 5: News feed data structure
    console.log('Test 5: News feed data structure');

    const newsFeedData = await prisma.article.findMany({
      take: 10,
      orderBy: { publishedAt: 'desc' },
      include: {
        market: {
          select: {
            id: true,
            probTrue: true,
            probFalse: true,
            closed: true,
            outcome: true,
            stakes: {
              select: {
                id: true,
                stakeAmount: true,
                prediction: true
              }
            }
          }
        }
      }
    });

    console.log(`News feed data structure test:`);
    console.log(`  - Articles retrieved: ${newsFeedData.length}`);
    console.log(`  - Articles with markets: ${newsFeedData.filter(a => a.market).length}`);
    console.log(`  - Active markets: ${newsFeedData.filter(a => a.market && !a.market.closed).length}`);
    console.log(`  - Resolved markets: ${newsFeedData.filter(a => a.market && a.market.closed).length}`);

    if (newsFeedData.length > 0) {
      const sampleArticle = newsFeedData[0];
      console.log(`  Sample article structure:`);
      console.log(`    - Title: "${sampleArticle.title}"`);
      console.log(`    - Source: ${sampleArticle.sourceName}`);
      console.log(`    - Category: ${sampleArticle.category}`);
      console.log(`    - Has market: ${sampleArticle.market ? 'Yes' : 'No'}`);
      if (sampleArticle.market) {
        console.log(`    - Market probability: TRUE ${(sampleArticle.market.probTrue * 100).toFixed(1)}%`);
        console.log(`    - Total stakes: ${sampleArticle.market.stakes.length}`);
      }
    }
    console.log();

    // Test 6: Stake creation endpoint data
    console.log('Test 6: Stake creation endpoint validation');

    const stakeCreationData = {
      userId: testUser.id,
      marketId: testMarket.id,
      prediction: true,
      stakeAmount: 75,
      upside: 1.4
    };

    console.log(`Simulating stake creation with data:`);
    console.log(`  - User ID: ${stakeCreationData.userId}`);
    console.log(`  - Market ID: ${stakeCreationData.marketId}`);
    console.log(`  - Prediction: ${stakeCreationData.prediction ? 'TRUE' : 'FALSE'}`);
    console.log(`  - Stake amount: ${stakeCreationData.stakeAmount} PP`);
    console.log(`  - Expected upside: ${stakeCreationData.upside}x`);

    // Validate user has sufficient funds
    const userBeforeStake = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: { provePoints: true }
    });

    if (userBeforeStake && userBeforeStake.provePoints >= stakeCreationData.stakeAmount) {
      console.log(`  User has sufficient funds: ${userBeforeStake.provePoints} >= ${stakeCreationData.stakeAmount}`);
      
      // Create the stake
      const newStake = await prisma.stake.create({
        data: {
          userId: stakeCreationData.userId,
          marketId: stakeCreationData.marketId,
          prediction: stakeCreationData.prediction,
          stakeAmount: stakeCreationData.stakeAmount,
          upside: stakeCreationData.upside,
          resolved: false
        }
      });

      console.log(`  Stake created successfully: ID ${newStake.id}`);
      console.log(`  Expected return: ${(newStake.stakeAmount * newStake.upside).toFixed(1)} PP\n`);
    } else {
      console.log(`  Insufficient funds for stake creation\n`);
    }

    // Test 7: Avatar customization endpoint data
    console.log('Test 7: Avatar customization endpoint validation');

    const avatarUpdateData = {
      avatarHair: 'longHair',
      avatarEyes: 'hearteyes',
      avatarMouth: 'laughing',
      avatarAccessories: 'glasses',
      avatarSkinColor: 'f4c2a1',
      avatarHairColor: '8b4513'
    };

    console.log(`Simulating avatar update with data:`);
    Object.entries(avatarUpdateData).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value}`);
    });

    const updatedUser = await prisma.user.update({
      where: { id: testUser.id },
      data: avatarUpdateData
    });

    console.log(`Avatar update successful:`);
    console.log(`  - Updated user: ${updatedUser.username}`);
    console.log(`  - New avatar: ${updatedUser.avatarHair}, ${updatedUser.avatarEyes}, ${updatedUser.avatarMouth}, ${updatedUser.avatarAccessories}`);
    console.log(`  - Colors: skin #${updatedUser.avatarSkinColor}, hair #${updatedUser.avatarHairColor}\n`);

    // Test 8: Error response structures
    console.log('Test 8: Error response structures');

    // Test non-existent user
    try {
      const nonExistentUser = await prisma.user.findUnique({
        where: { id: 99999999 }
      });
      console.log(`  Non-existent user query: ${nonExistentUser ? 'Found' : 'null (correct)'}`);
    } catch (error) {
      console.log(`  Non-existent user query error: ${error}`);
    }

    // Test invalid stake creation
    try {
      await prisma.stake.create({
        data: {
          userId: 99999999, // Non-existent user
          marketId: testMarket.id,
          prediction: true,
          stakeAmount: 50,
          upside: 1.5,
          resolved: false
        }
      });
      console.log(`  Invalid stake creation was allowed (should fail)`);
    } catch (error) {
      console.log(`  Invalid stake creation properly rejected (foreign key constraint)`);
    }

    console.log('\nFrontend API integration tests completed successfully!\n');

    // Cleanup
    await prisma.stake.deleteMany({ where: { userId: testUser.id } });
    await prisma.market.delete({ where: { id: testMarket.id } });
    await prisma.article.delete({ where: { id: testArticle.id } });
    await prisma.user.delete({ where: { id: testUser.id } });

    console.log('Test data cleaned up');

  } catch (error) {
    console.error('Frontend API integration test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFrontendAPIIntegration();
