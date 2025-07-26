const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('🗑️ Clearing entire database...');
    
    // Delete in correct order to respect foreign key constraints
    
    // 1. Delete CommentVotes first (references Comments)
    const deletedCommentVotes = await prisma.commentVote.deleteMany();
    console.log(`✅ Deleted ${deletedCommentVotes.count} comment votes`);
    
    // 2. Delete Comments (references Articles and Users)
    const deletedComments = await prisma.comment.deleteMany();
    console.log(`✅ Deleted ${deletedComments.count} comments`);
    
    // 3. Delete Stakes (references Markets and Users)
    const deletedStakes = await prisma.stake.deleteMany();
    console.log(`✅ Deleted ${deletedStakes.count} stakes`);
    
    // 4. Delete Markets (references Articles)
    const deletedMarkets = await prisma.market.deleteMany();
    console.log(`✅ Deleted ${deletedMarkets.count} markets`);
    
    // 5. Delete Articles (references Users)
    const deletedArticles = await prisma.article.deleteMany();
    console.log(`✅ Deleted ${deletedArticles.count} articles`);
    
    // 6. Delete Users (no dependencies, but keep one admin user)
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        NOT: {
          isAdmin: true
        }
      }
    });
    console.log(`✅ Deleted ${deletedUsers.count} users (keeping admin users)`);
    
    console.log('🎉 Database cleared successfully!');
    
    // Verify the database state
    const articleCount = await prisma.article.count();
    const marketCount = await prisma.market.count();
    const stakeCount = await prisma.stake.count();
    const userCount = await prisma.user.count();
    const commentCount = await prisma.comment.count();
    const commentVoteCount = await prisma.commentVote.count();
    
    console.log('📊 Final counts:');
    console.log(`   - Articles: ${articleCount}`);
    console.log(`   - Markets: ${marketCount}`);
    console.log(`   - Stakes: ${stakeCount}`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Comments: ${commentCount}`);
    console.log(`   - Comment Votes: ${commentVoteCount}`);
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
