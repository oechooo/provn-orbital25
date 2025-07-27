// Test script to debug production API issues
console.log('Testing production API endpoints...');

const PRODUCTION_API = 'https://provn-orbital25-backend.onrender.com/api';

async function testEndpoint(url, description) {
    try {
        console.log(`\nTesting ${description}:`);
        console.log(`URL: ${url}`);
        
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.json();
            console.log(`Success:`, data);
            return data;
        } else {
            const errorText = await response.text();
            console.log(`Error Response:`, errorText);
            return null;
        }
    } catch (error) {
        console.log(`Network Error:`, error.message);
        return null;
    }
}

async function main() {
    // Test health check or basic endpoint
    await testEndpoint(`${PRODUCTION_API}/articles`, 'All Articles');
    
    // Test specific article that's failing
    await testEndpoint(`${PRODUCTION_API}/articles/2`, 'Article ID 2');
    
    // Test a few other article IDs
    await testEndpoint(`${PRODUCTION_API}/articles/1`, 'Article ID 1');
    await testEndpoint(`${PRODUCTION_API}/articles/3`, 'Article ID 3');
    
    // Test markets endpoint
    await testEndpoint(`${PRODUCTION_API}/markets`, 'All Markets');
    
    console.log('\n🔬 Production API test complete');
}

main().catch(console.error);
