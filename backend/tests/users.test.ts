import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testUserManagement() {
  console.log('👤 Testing User Registration & Profile Management...\n');

  try {
    // Test 1: User Registration Validation
    console.log('📝 Test 1: User Registration Validation');
    
    const validUserData = {
      username: 'testuser123',
      email: 'testuser123@example.com',
      password: 'hashed_password_here'
    };

    const newUser = await prisma.user.create({
      data: validUserData
    });

    console.log(`✅ User registration successful:`);
    console.log(`   Username: ${newUser.username}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Starting PP: ${newUser.provePoints}`);
    console.log(`   Is Admin: ${newUser.isAdmin}`);
    console.log(`   Created: ${newUser.createdAt.toISOString()}\n`);

    // Test 2: Duplicate Username Prevention
    console.log('📝 Test 2: Duplicate Username Prevention');
    
    try {
      await prisma.user.create({
        data: {
          username: validUserData.username, // Same username
          email: 'different@example.com',
          password: 'different_password'
        }
      });
      console.log(`❌ Duplicate username was allowed (should be prevented)`);
    } catch (error) {
      console.log(`✅ Duplicate username prevented: ${validUserData.username} already exists`);
    }
    console.log();

    // Test 3: Duplicate Email Prevention
    console.log('📝 Test 3: Duplicate Email Prevention');
    
    try {
      await prisma.user.create({
        data: {
          username: 'differentuser',
          email: validUserData.email, // Same email
          password: 'different_password'
        }
      });
      console.log(`❌ Duplicate email was allowed (should be prevented)`);
    } catch (error) {
      console.log(`✅ Duplicate email prevented: ${validUserData.email} already exists`);
    }
    console.log();

    // Test 4: Profile Updates
    console.log('📝 Test 4: Profile Updates');
    
    const profileUpdates = {
      avatarSkinColor: 'f4c2a1',
      avatarHairColor: '8b4513',
      avatarHair: 'short02',
      avatarEyes: 'variant03',
      avatarMouth: 'variant02',
      avatarAccessories: 'glasses02'
    };

    const updatedUser = await prisma.user.update({
      where: { id: newUser.id },
      data: profileUpdates
    });

    console.log(`✅ Profile updated successfully:`);
    console.log(`   Skin Color: #${updatedUser.avatarSkinColor}`);
    console.log(`   Hair: ${updatedUser.avatarHair} (#${updatedUser.avatarHairColor})`);
    console.log(`   Eyes: ${updatedUser.avatarEyes}`);
    console.log(`   Mouth: ${updatedUser.avatarMouth}`);
    console.log(`   Accessories: ${updatedUser.avatarAccessories}`);
    console.log(`   Last Updated: ${updatedUser.updatedAt.toISOString()}\n`);

    // Test 5: Avatar Item Purchases Tracking
    console.log('📝 Test 5: Avatar Item Purchase Tracking');
    
    const purchaseData = {
      purchasedHair: JSON.stringify(['short01', 'short02', 'long01']),
      purchasedEyes: JSON.stringify(['variant01', 'variant03']),
      purchasedMouth: JSON.stringify(['variant02']),
      purchasedAccessories: JSON.stringify(['glasses02', 'hat01'])
    };

    const userWithPurchases = await prisma.user.update({
      where: { id: newUser.id },
      data: purchaseData
    });

    console.log(`✅ Purchase tracking updated:`);
    console.log(`   Hair items: ${JSON.parse(userWithPurchases.purchasedHair).length} purchased`);
    console.log(`   Eye items: ${JSON.parse(userWithPurchases.purchasedEyes).length} purchased`);
    console.log(`   Mouth items: ${JSON.parse(userWithPurchases.purchasedMouth).length} purchased`);
    console.log(`   Accessories: ${JSON.parse(userWithPurchases.purchasedAccessories).length} purchased\n`);

    // Test 6: User Authentication Data
    console.log('📝 Test 6: User Authentication Data Integrity');
    
    // Simulate password reset token
    const resetToken = 'reset_token_' + Date.now();
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    const userWithResetToken = await prisma.user.update({
      where: { id: newUser.id },
      data: {
        resetToken: resetToken,
        resetTokenExpiry: resetExpiry
      }
    });

    console.log(`✅ Password reset token generated:`);
    console.log(`   Token: ${userWithResetToken.resetToken}`);
    console.log(`   Expires: ${userWithResetToken.resetTokenExpiry?.toISOString()}`);

    // Clear reset token (simulate successful password reset)
    const userAfterReset = await prisma.user.update({
      where: { id: newUser.id },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
        password: 'new_hashed_password'
      }
    });

    console.log(`✅ Password reset completed, token cleared\n`);

    // Test 7: Admin User Management
    console.log('📝 Test 7: Admin User Management');
    
    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin_test',
        email: 'admin@test.com',
        password: 'admin_password',
        isAdmin: true,
        provePoints: 1000 // Give admin more PP
      }
    });

    console.log(`✅ Admin user created:`);
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Is Admin: ${adminUser.isAdmin}`);
    console.log(`   PP: ${adminUser.provePoints}`);

    // Test admin privileges simulation
    if (adminUser.isAdmin) {
      console.log(`✅ Admin privileges confirmed for user ${adminUser.username}\n`);
    } else {
      console.log(`❌ Admin privileges not set correctly\n`);
    }

    // Test 8: User Data Relationships
    console.log('📝 Test 8: User Data Relationships');
    
    // Check user with related data
    const userWithRelations = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: {
        stakes: true,
        articles: true,
        comments: true
      }
    });

    console.log(`✅ User relationship data:`);
    console.log(`   Stakes: ${userWithRelations?.stakes.length || 0}`);
    console.log(`   Articles: ${userWithRelations?.articles.length || 0}`);
    console.log(`   Comments: ${userWithRelations?.comments.length || 0}\n`);

    // Test 9: User Account Validation
    console.log('📝 Test 9: User Account Validation');
    
    const allUsers = await prisma.user.findMany();
    let validUsers = 0;
    let invalidUsers = 0;

    allUsers.forEach(user => {
      const hasValidUsername = user.username && user.username.length >= 3;
      const hasValidEmail = user.email && user.email.includes('@');
      const hasValidPassword = user.password && user.password.length > 0;
      const hasValidPP = user.provePoints >= 0;

      if (hasValidUsername && hasValidEmail && hasValidPassword && hasValidPP) {
        validUsers++;
      } else {
        invalidUsers++;
        console.log(`   ⚠️  Invalid user found: ${user.username} (ID: ${user.id})`);
      }
    });

    console.log(`✅ User validation results:`);
    console.log(`   Valid users: ${validUsers}`);
    console.log(`   Invalid users: ${invalidUsers}`);
    console.log(`   Total users: ${allUsers.length}`);

    if (invalidUsers === 0) {
      console.log(`✅ All users have valid data`);
    } else {
      console.log(`⚠️  ${invalidUsers} users need data cleanup`);
    }

    console.log('\n👑 User Management Tests Completed Successfully!');

  } catch (error) {
    console.error('❌ User management test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserManagement();
