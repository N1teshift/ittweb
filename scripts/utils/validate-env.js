#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Validates required environment variables before build
 * Run: node scripts/validate-env.js
 */

import fs from 'fs';
import path from 'path';

/**
 * Load environment variables from .env.local file
 * Follows Next.js env loading order: .env.local takes precedence
 */
function loadEnvFile() {
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envLocalPath)) {
    return;
  }
  
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }
    
    // Parse KEY=VALUE format (handle values with = in them)
    const equalIndex = trimmedLine.indexOf('=');
    if (equalIndex > 0) {
      const key = trimmedLine.substring(0, equalIndex).trim();
      let value = trimmedLine.substring(equalIndex + 1).trim();
      
      // Remove quotes if present (handles both single and double quotes)
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // Set the value from .env.local (Next.js behavior: .env.local takes precedence)
      // This allows validation to see the same env vars that Next.js will use
      if (key) {
        process.env[key] = value;
      }
    }
  }
}

// Load .env.local before validation
loadEnvFile();

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
  // Skip validation in CI environment (GitHub Actions, etc.)
  // CI builds don't need real environment variables for type-checking and build verification
  if (process.env.CI === 'true') {
    console.log('⚠️  Skipping environment variable validation in CI environment\n');
    console.log('💡 Note: Environment variables are still required for local development and deployments\n');
    process.exit(0);
  }

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
  
  // Optional variables are intentionally not reported to reduce noise
  // They're only needed for specific features (bundle analysis, analytics, etc.)
  
  console.log('✅ All required environment variables are set\n');
  process.exit(0);
}

// Run validation
validateEnv();

