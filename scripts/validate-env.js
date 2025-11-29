#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Validates required environment variables before build
 * Run: node scripts/validate-env.js
 */

const requiredVars = {
  // Firebase Client (Public)
  NEXT_PUBLIC_FIREBASE_API_KEY: 'Firebase API Key',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'Firebase Auth Domain',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'Firebase Project ID',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'Firebase Storage Bucket',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'Firebase Messaging Sender ID',
  NEXT_PUBLIC_FIREBASE_APP_ID: 'Firebase App ID',
  
  // NextAuth
  NEXTAUTH_URL: 'NextAuth URL',
  NEXTAUTH_SECRET: 'NextAuth Secret',
  
  // Discord OAuth
  DISCORD_CLIENT_ID: 'Discord Client ID',
  DISCORD_CLIENT_SECRET: 'Discord Client Secret',
  
  // Firebase Admin (required for server-side operations)
  FIREBASE_SERVICE_ACCOUNT_KEY: 'Firebase Service Account Key',
};

const optionalVars = {
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: 'Firebase Measurement ID (Analytics)',
  ANALYZE: 'Bundle Analyzer Flag',
};

function validateEnv() {
  const missing = [];
  const empty = [];
  
  // Check required variables
  for (const [varName, description] of Object.entries(requiredVars)) {
    const value = process.env[varName];
    
    if (value === undefined) {
      missing.push({ varName, description });
    } else if (value.trim() === '') {
      empty.push({ varName, description });
    }
  }
  
  // Report errors
  if (missing.length > 0 || empty.length > 0) {
    console.error('\n❌ Environment Variable Validation Failed\n');
    
    if (missing.length > 0) {
      console.error('Missing required environment variables:');
      missing.forEach(({ varName, description }) => {
        console.error(`  - ${varName} (${description})`);
      });
    }
    
    if (empty.length > 0) {
      console.error('\nEmpty required environment variables:');
      empty.forEach(({ varName, description }) => {
        console.error(`  - ${varName} (${description})`);
      });
    }
    
    console.error('\n💡 To fix:');
    console.error('  1. Copy .env.example to .env.local');
    console.error('  2. Fill in all required values');
    console.error('  3. See docs/ENVIRONMENT_SETUP.md for detailed instructions\n');
    
    process.exit(1);
  }
  
  // Report optional variables status
  const missingOptional = [];
  for (const [varName, description] of Object.entries(optionalVars)) {
    if (!process.env[varName]) {
      missingOptional.push({ varName, description });
    }
  }
  
  if (missingOptional.length > 0) {
    console.warn('\n⚠️  Optional environment variables not set:');
    missingOptional.forEach(({ varName, description }) => {
      console.warn(`  - ${varName} (${description})`);
    });
    console.warn('');
  }
  
  console.log('✅ All required environment variables are set\n');
  process.exit(0);
}

// Run validation
validateEnv();

