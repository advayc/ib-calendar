#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Run this locally to verify your Supabase connection works before deploying
 * Usage: node scripts/test-db-connection.js
 */

require('dotenv').config({ path: '.env.local' });

const checkEnv = () => {
  console.log('\n📋 Checking Environment Variables...\n');
  
  const required = ['DATABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  const optional = ['ADMIN_PASSWORD_HASH', 'DEV_ADMIN_PASSWORD'];
  
  let allGood = true;
  
  required.forEach(key => {
    const value = process.env[key];
    if (!value) {
      console.log(`❌ ${key}: NOT SET`);
      allGood = false;
    } else if (key === 'DATABASE_URL') {
      const masked = value.replace(/:[^:/@]+@/, ':****@');
      console.log(`✅ ${key}: ${masked}`);
    } else {
      const masked = value.substring(0, 20) + '...';
      console.log(`✅ ${key}: ${masked}`);
    }
  });
  
  optional.forEach(key => {
    const value = process.env[key];
    console.log(`   ${key}: ${value ? '✅ Set' : '⚠️  Not set (optional)'}`);
  });
  
  return allGood;
};

const testDbConnection = async () => {
  console.log('\n🔗 Testing Database Connection...\n');
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Try a simple query
    const courseCount = await prisma.course.count();
    console.log(`✅ Connected to Supabase PostgreSQL`);
    console.log(`   - Courses in database: ${courseCount}`);
    
    const eventCount = await prisma.event.count();
    console.log(`   - Events in database: ${eventCount}`);
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.log(`❌ Database Connection Failed`);
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Looks like the database is unreachable. Check:');
      console.log('   1. DATABASE_URL is correct');
      console.log('   2. Supabase project is running (not paused)');
      console.log('   3. Your IP is allowed (check Supabase network restrictions)');
    }
    
    return false;
  }
};

const main = async () => {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   Student Calendar - Database Connection Test      ║');
  console.log('╚════════════════════════════════════════════════════╝');
  
  const envOk = checkEnv();
  
  if (!envOk) {
    console.log('\n⚠️  Please set the missing environment variables in .env.local');
    process.exit(1);
  }
  
  const dbOk = await testDbConnection();
  
  if (dbOk) {
    console.log('\n✅ All checks passed! Ready to deploy.\n');
    process.exit(0);
  } else {
    console.log('\n❌ Database connection test failed.\n');
    process.exit(1);
  }
};

main();
