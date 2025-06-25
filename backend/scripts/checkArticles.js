const { PrismaClient } = require('../src/prisma/client');

async function checkArticles() {
    const prisma = new PrismaClient();
    
    try {
        const articles = await prisma.article.findMany({
            include: {
                market: true
            }
        });
        
        console.log(`Found ${articles.length} articles:`);
        articles.forEach(article => {
            console.log(`- Article: ${article.title}`);
            console.log(`  URL: ${article.url}`);
            console.log(`  Has Market: ${article.market ? 'Yes' : 'No'}`);
            if (article.market) {
                console.log(`  Market Question: ${article.market.question}`);
            }
            console.log('');
        });
    } catch (error) {
        console.error('Error checking articles:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkArticles();
