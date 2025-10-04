#!/usr/bin/env node

/**
 * Verify Database Connection Configuration
 * 
 * This script checks if your DATABASE_URL and DIRECT_URL are properly configured
 * for Supabase + Vercel deployment.
 */

const { PrismaClient } = require('@prisma/client');

async function verifyDatabaseConnection() {
  console.log('🔍 Verifying Database Configuration...\n');

  // Check environment variables
  const dbUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  console.log('Environment Variables:');
  console.log('----------------------');
  
  if (!dbUrl) {
    console.log('❌ DATABASE_URL is not set');
  } else {
    console.log('✅ DATABASE_URL is set');
    
    // Check if it's using the transaction pooler (port 6543)
    if (dbUrl.includes(':6543/')) {
      console.log('   ✅ Using Transaction Pooler (port 6543) - Good for serverless!');
    } else if (dbUrl.includes(':5432/')) {
      console.log('   ⚠️  Using Direct Connection (port 5432) - May cause issues in serverless environments');
      console.log('   💡 Consider using Transaction Pooler (port 6543) for Vercel');
    } else {
      console.log('   ℹ️  Port detection unclear');
    }
    
    // Mask password for security
    const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':***@');
    console.log('   URL:', maskedUrl);
  }

  if (!directUrl) {
    console.log('⚠️  DIRECT_URL is not set (recommended for migrations)');
  } else {
    console.log('✅ DIRECT_URL is set');
    
    if (directUrl.includes(':5432/')) {
      console.log('   ✅ Using Direct Connection (port 5432) - Good for migrations!');
    }
    
    const maskedDirectUrl = directUrl.replace(/:[^:@]+@/, ':***@');
    console.log('   URL:', maskedDirectUrl);
  }

  console.log('\n');

  // Try to connect to database
  if (dbUrl) {
    console.log('🔌 Testing Database Connection...');
    const prisma = new PrismaClient();
    
    try {
      await prisma.$connect();
      console.log('✅ Successfully connected to database!\n');

      // Test a simple query
      console.log('📊 Testing query...');
      const clubCount = await prisma.club.count();
      const eventCount = await prisma.event.count();
      
      console.log(`✅ Found ${clubCount} clubs and ${eventCount} events\n`);
      
      await prisma.$disconnect();
      
      console.log('✨ Database configuration looks good!');
      console.log('\n💡 Next steps:');
      console.log('   1. Make sure these environment variables are set in Vercel');
      console.log('   2. Use DATABASE_URL with Transaction Pooler (port 6543)');
      console.log('   3. Use DIRECT_URL with Direct Connection (port 5432)');
      console.log('   4. Redeploy your Vercel app');
      
    } catch (error) {
      console.log('❌ Failed to connect to database');
      console.error('Error:', error.message);
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Check your database password is correct');
      console.log('   2. Verify the connection string format');
      console.log('   3. Ensure your IP is allowed in Supabase (if you have IP restrictions)');
      console.log('   4. Try resetting your database password in Supabase dashboard');
      
      await prisma.$disconnect();
      process.exit(1);
    }
  } else {
    console.log('❌ Cannot test connection - DATABASE_URL is not set');
    console.log('\n💡 Set your DATABASE_URL in .env file:');
    console.log('   DATABASE_URL="postgresql://postgres.xggibmxtcwmefybrfngf:[PASSWORD]@aws-1-ca-central-1.pooler.supabase.com:6543/postgres"');
    process.exit(1);
  }
}

verifyDatabaseConnection().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
