const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const articles = await prisma.article.findMany();
  console.log('Articles in DB:', articles);
  console.log('Total articles:', articles.length);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

