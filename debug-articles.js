// Test multiple article IDs on production
const testArticles = [1, 2, 3, 4, 5, 34, 133];

async function testArticleIds() {
    console.log('Testing article IDs on production...\n');
    
    for (const id of testArticles) {
        try {
            const response = await fetch(`https://provn-orbital25-backend.onrender.com/api/articles/${id}`);
            console.log(`Article ${id}: ${response.status} - ${response.ok ? 'EXISTS' : 'NOT FOUND'}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`  Title: ${data.article?.title || 'No title'}`);
                console.log(`  Market: ${data.article?.market ? 'Yes' : 'No'}`);
            }
            console.log('');
        } catch (err) {
            console.log(`Article ${id}: ERROR - ${err.message}\n`);
        }
    }
    
    // Also test the articles list endpoint
    try {
        console.log('Testing articles list endpoint...');
        const response = await fetch('https://provn-orbital25-backend.onrender.com/api/articles');
        if (response.ok) {
            const data = await response.json();
            console.log(`Total articles found: ${data.articles?.length || 0}`);
            if (data.articles && data.articles.length > 0) {
                console.log('First few article IDs:');
                data.articles.slice(0, 5).forEach((article, index) => {
                    console.log(`  ${index + 1}. ID: ${article.id} - "${article.title}"`);
                });
            }
        } else {
            console.log(`Articles list failed: ${response.status}`);
        }
    } catch (err) {
        console.log(`Articles list error: ${err.message}`);
    }
}

testArticleIds();
