#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

async function startupScript() {
  console.log('🚀 Starting deployment initialization...');
  
  try {
    // Ensure we're in the right directory
    process.chdir(path.join(__dirname, '..'));
    
    console.log('📦 Installing dependencies...');
    
    console.log('🔄 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('🗄️ Setting up database...');
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
    
    console.log('✅ Database setup complete!');
    
    // Run the production setup to verify everything is working
    const { setupProduction } = require('./setupProduction');
    await setupProduction();
    
    console.log('🎉 Deployment initialization successful!');
    
  } catch (error) {
    console.error('❌ Deployment initialization failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startupScript().catch(console.error);
}

module.exports = { startupScript };
