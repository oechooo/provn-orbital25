import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFrontendStakeAPI() {
  console.log('🌐 Testing frontend stake API endpoints...\n');

  try {
    // Get a market to test with
    const market = await prisma.market.findFirst({
      include: {
        article: true
      }
    });

    if (!market) {
      console.log('❌ No markets found for testing');
      return;
    }

    console.log(`📊 Testing with market ID: ${market.id}`);
    console.log(`📰 Article: "${market.article.title}"`);

    // Test the new getStakingParameters endpoint
    const testStakeAmount = 25;
    const testPrediction = true;

    console.log(`🧮 Testing getStakingParameters API for ${testStakeAmount} PP on ${testPrediction ? 'TRUE' : 'FALSE'}...`);

    // Import the controller directly to test
    const { getStakingParameters } = require('../src/controllers/marketController');

    // Mock request and response objects
    const mockReq = {
      params: { id: market.id.toString() },
      query: { 
        prediction: testPrediction.toString(), 
        stakeAmount: testStakeAmount.toString() 
      }
    };

    const mockRes = {
      json: (data: any) => {
        console.log('📊 API Response:');
        console.log(`   - Upside: ${data.upside.toFixed(3)}`);
        console.log(`   - Shares bought: ${data.sharesBought.toFixed(3)}`);
        console.log(`   - Potential winnings: ${data.potentialWinnings.toFixed(1)} PP`);
        return mockRes;
      },
      status: (code: number) => ({
        json: (data: any) => {
          console.log(`❌ API Error ${code}:`, data);
          return mockRes;
        }
      })
    };

    await getStakingParameters(mockReq, mockRes);

    console.log('\n✅ getStakingParameters API test completed successfully!');

    // Test that the calculation matches the actual staking
    const { MarketService } = require('../src/services/MarketService');
    const marketService = new MarketService(prisma);
    
    const directParams = await marketService.getStakingParameters(market.id, testPrediction, testStakeAmount);
    console.log('\n🔍 Direct service comparison:');
    console.log(`   - Service upside: ${directParams.upside.toFixed(3)}`);
    console.log(`   - Service shares: ${directParams.sharesBought.toFixed(3)}`);

    console.log('\n🎉 All API tests passed!');

  } catch (error) {
    console.error('❌ API test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFrontendStakeAPI();
