// Test to find markets with stakes and check their probHistory
async function findMarketsWithStakes() {
  try {
    console.log('Looking for markets with stakes...');
    
    const response = await fetch('http://localhost:3000/api/markets');
    const data = await response.json();
    const markets = data.markets;
    
    console.log('Total markets:', markets.length);
    
    let marketsWithStakes = [];
    
    // Search specifically for the air traffic controller article
    for (let i = 0; i < markets.length; i++) {
      const market = markets[i];
      
      // Fetch detailed market info
      const detailResponse = await fetch(`http://localhost:3000/api/markets/${market.id}`);
      const detailData = await detailResponse.json();
      const detailedMarket = detailData.market;
      
      
      // Check if this is the air traffic controller article
      if (detailedMarket.article && detailedMarket.article.title && 
          detailedMarket.article.title.includes('air traffic controllers')) {
        console.log(`\nFound Air Traffic Controller Market!`);
        console.log(`Market ID: ${detailedMarket.id}`);
        console.log(`Title: ${detailedMarket.article.title}`);
        console.log(`Stakes: ${detailedMarket.stakes.length}`);
        console.log(`ProbTrue: ${detailedMarket.probTrue}`);
        console.log(`ProbFalse: ${detailedMarket.probFalse}`);
        console.log(`ProbHistory: ${detailedMarket.probHistory ? `${detailedMarket.probHistory.length} entries` : 'null'}`);
        
        if (detailedMarket.probHistory && detailedMarket.probHistory.length > 0) {
          console.log(`First probHistory entry:`, detailedMarket.probHistory[0]);
          console.log(`Last probHistory entry:`, detailedMarket.probHistory[detailedMarket.probHistory.length - 1]);
        }
        
        // Show stake details
        console.log(`\nStake details:`);
        detailedMarket.stakes.forEach((stake, index) => {
          console.log(`  Stake ${index + 1}: ${stake.stakeAmount} PP on ${stake.prediction ? 'TRUE' : 'FALSE'} (ID: ${stake.id})`);
        });
      }
      
      if (detailedMarket.stakes && detailedMarket.stakes.length > 0) {
        marketsWithStakes.push({
          id: detailedMarket.id,
          stakesCount: detailedMarket.stakes.length,
          probHistory: detailedMarket.probHistory,
          probTrue: detailedMarket.probTrue,
          probFalse: detailedMarket.probFalse
        });
        
        console.log(`Market ${detailedMarket.id}: ${detailedMarket.stakes.length} stakes, probHistory: ${detailedMarket.probHistory ? detailedMarket.probHistory.length + ' entries' : 'null'}`);
      }
    }
    
    console.log('\nMarkets with stakes found:', marketsWithStakes.length);
    
    if (marketsWithStakes.length > 0) {
      console.log('First market with stakes:', marketsWithStakes[0]);
      
      if (marketsWithStakes[0].probHistory) {
        console.log('Sample probHistory entries:', marketsWithStakes[0].probHistory.slice(0, 2));
      }
    } else {
      console.log('No markets with stakes found in first 10 markets.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

findMarketsWithStakes();

