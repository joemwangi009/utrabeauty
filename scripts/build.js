#!/usr/bin/env node

// Load environment variables from .env file
try {
  require('dotenv').config();
} catch (error) {
  console.log('⚠️  dotenv not available, using system environment variables');
}

// Log environment variables for debugging (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log('🔧 Environment variables loaded:');
  console.log('  NEXT_PUBLIC_SANITY_PROJECT_ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'NOT SET');
  console.log('  NEXT_PUBLIC_SANITY_DATASET:', process.env.NEXT_PUBLIC_SANITY_DATASET || 'NOT SET');
  console.log('  NEXT_PUBLIC_SANITY_API_VERSION:', process.env.NEXT_PUBLIC_SANITY_API_VERSION || 'NOT SET');
  console.log('  DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
  console.log('  STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET');
  console.log('');
}

// Generate Prisma client
console.log('🔧 Generating Prisma client...');
const { execSync } = require('child_process');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  process.exit(1);
}

// Run Next.js build
console.log('🔧 Starting Next.js build...');
try {
  execSync('npx next build', { stdio: 'inherit' });
  console.log('✅ Next.js build completed successfully');
} catch (error) {
  console.error('❌ Next.js build failed:', error.message);
  process.exit(1);
} 