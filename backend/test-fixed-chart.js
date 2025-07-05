// Test the fixed API - check the air traffic controller market specifically
async function testFixedChart() {
  try {
    console.log('Testing the air traffic controller market (ID: 2)...');
    
    const response = await fetch('http://localhost:3000/api/markets/2');
    const data = await response.json();
    const market = data.market;
    
    console.log('Current market state:');
    console.log('- Stakes:', market.stakes.length);
    console.log('- ProbTrue:', market.probTrue);
    console.log('- ProbFalse:', market.probFalse);
    console.log('- ProbHistory entries:', market.probHistory ? market.probHistory.length : 'null');
    
    if (market.probHistory && market.probHistory.length > 0) {
      console.log('\nProbHistory:');
      market.probHistory.forEach((entry, index) => {
        const date = new Date(entry.timestamp).toLocaleTimeString();
        console.log(`  ${index + 1}. ${date}: ${entry.prediction ? 'TRUE' : 'FALSE'} stake of ${entry.stakeAmount} PP -> probTrue: ${(entry.probTrue * 100).toFixed(1)}%`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testFixedChart();
