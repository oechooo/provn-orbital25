// Quick test to check if probHistory is being returned by API

async function testProbHistory() {
  try {
    console.log('Testing probHistory API...');
    
    // First, let's check if server is running by testing a simple endpoint
    try {
      const testResponse = await fetch('http://localhost:3000/api/markets');
      console.log('Server response status:', testResponse.status);
    } catch (serverError) {
      console.error('Server not running or not accessible:', serverError.message);
      return;
    }
    
    // Get the first market
    const response = await fetch('http://localhost:3000/api/markets');
    const data = await response.json();
    const markets = data.markets;
    
    console.log('Found', markets.length, 'markets');
    
    if (markets.length > 0) {
      const marketId = markets[0].id;
      console.log('Testing market ID:', marketId);
      
      // Fetch market details
      const marketResponse = await fetch(`http://localhost:3000/api/markets/${marketId}`);
      const marketData = await marketResponse.json();
      const market = marketData.market;
      
      console.log('Market data:', {
        id: market.id,
        title: market.title || 'No title',
        probTrue: market.probTrue,
        probFalse: market.probFalse,
        hasResolvedField: 'resolved' in market,
        hasProbHistoryField: 'probHistory' in market,
        probHistory: market.probHistory
      });
      
      if (market.probHistory) {
        console.log('ProbHistory length:', market.probHistory.length);
        if (market.probHistory.length > 0) {
          console.log('First entry:', market.probHistory[0]);
          console.log('Last entry:', market.probHistory[market.probHistory.length - 1]);
        }
      } else {
        console.log('No probHistory found');
      }
      
      // Also check stakes count
      if (market.stakes) {
        console.log('Number of stakes:', market.stakes.length);
      }
    } else {
      console.log('No markets found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testProbHistory();
