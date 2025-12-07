#!/usr/bin/env node

/**
 * Deploy Migrations Script
 * This script should be run after deployment to apply pending Prisma migrations
 * It's designed to work in the Vercel environment where DATABASE_URL is set
 * 
 * Usage: node scripts/deploy-migrations.js
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function runMigrations() {
  console.log('🚀 Running Prisma migrations...\n');
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }
  
  try {
    console.log('📋 Running: prisma migrate deploy\n');
    const { stdout, stderr } = await execPromise('npx prisma migrate deploy');
    
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);
    
    console.log('\n✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('⚠️ Migration error:', error.message);
    // Don't fail on migration errors - schema might already be in sync
    if (error.message.includes('No pending migrations')) {
      console.log('✅ No pending migrations (schema already in sync)');
      process.exit(0);
    }
    process.exit(1);
  }
}

runMigrations();
