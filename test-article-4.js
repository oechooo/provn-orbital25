// Test Article ID 4 specifically on production
console.log('Testing Article ID 4 on production...');

const PRODUCTION_API = 'https://provn-orbital25-backend.onrender.com/api';

async function testArticle4() {
    const url = `${PRODUCTION_API}/articles/4`;
    console.log('Testing URL:', url);
    
    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Status:', response.status);
        console.log('URL after fetch:', response.url);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Article 4 found:', data.article.title);
        } else {
            const errorText = await response.text();
            console.log('❌ Article 4 failed:', response.status, errorText);
        }
    } catch (error) {
        console.error('💥 Network error:', error);
    }
}

testArticle4();
