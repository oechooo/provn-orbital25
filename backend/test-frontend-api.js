// Test the frontend API directly to simulate what ProbChart is doing
async function testFrontendAPI() {
  console.log('=== Testing Frontend API Call ===');
  
  try {
    // This simulates what the frontend marketAPI.getMarketById does
    const response = await fetch('http://localhost:3000/api/markets/2', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Raw response data:', data);
    
    const market = data.market;
    
    console.log('=== Frontend Processing (similar to ProbChart) ===');
    console.log('Market data received:', {
      id: market.id,
      title: market.title || market.article?.title || 'No title',
      probTrue: market.probTrue,
      probFalse: market.probFalse,
      hasProbHistory: 'probHistory' in market,
      probHistoryType: typeof market.probHistory,
      probHistoryValue: market.probHistory,
      probHistoryLength: market.probHistory ? market.probHistory.length : 'N/A'
    });
    
    const history = market.probHistory || [];
    console.log('Processed history array:', history);
    console.log('History length:', history.length);
    
    if (history.length === 0) {
      console.log('PROBLEM: probHistory is empty - this would show empty chart state');
    } else {
      console.log('SUCCESS: probHistory has data - chart should render');
      console.log('First entry:', history[0]);
      console.log('Last entry:', history[history.length - 1]);
    }
    
  } catch (error) {
    console.error('API Error:', error);
  }
}

testFrontendAPI();

