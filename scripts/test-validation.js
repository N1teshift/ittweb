#!/usr/bin/env node

/**
 * Comprehensive Test Validation Script
 *
 * Runs multiple validation methods to ensure tests actually test what they claim:
 * - Code coverage analysis
 * - Test quality linting
 * - Mutation testing (optional, slower)
 * - Test categorization validation
 *
 * Usage:
 *   npm run test:validate          # Full validation (slow)
 *   npm run test:validate:quick    # Quick validation (no mutation testing)
 *   npm run test:validate:ci       # CI mode with strict checks
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALIDATION_STEPS = {
  coverage: {
    name: 'Code Coverage Analysis',
    command: 'npm run test:coverage',
    required: true,
    ciOnly: false
  },
  coverageAnalysis: {
    name: 'Coverage Quality Analysis',
    command: 'npm run analyze:coverage',
    required: true,
    ciOnly: false
  },
  testLint: {
    name: 'Test Quality Linting',
    command: 'npm run lint:test',
    required: true,
    ciOnly: false
  },
  mutation: {
    name: 'Mutation Testing',
    command: 'npm run test:mutation:ci',
    required: false, // Optional due to slowness
    ciOnly: false
  },
  e2e: {
    name: 'End-to-End Tests',
    command: 'npm run test:e2e',
    required: false, // Can be slow in CI
    ciOnly: true
  }
};

function runCommand(command, options = {}) {
  const { silent = false, ignoreErrors = false } = options;

  try {
    if (!silent) {
      console.log(`🔄 Running: ${command}`);
    }

    const result = execSync(command, {
      stdio: silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
      timeout: options.timeout || 300000 // 5 minutes default
    });

    if (!silent) {
      console.log(`✅ ${command} completed successfully`);
    }

    return { success: true, output: result };
  } catch (error) {
    if (!ignoreErrors) {
      console.error(`❌ ${command} failed:`, error.message);
      return { success: false, error: error.message };
    }
    return { success: false, error: error.message, ignored: true };
  }
}

function validateCoverageThresholds() {
  const coverageSummaryPath = path.join('coverage', 'coverage-summary.json');

  if (!fs.existsSync(coverageSummaryPath)) {
    console.log('⚠️  Coverage summary not found, skipping threshold validation');
    return true;
  }

  try {
    const coverage = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
    const total = coverage.total;

    const thresholds = {
      statements: 50,
      branches: 50,
      functions: 50,
      lines: 50
    };

    let passed = true;
    console.log('\n📊 Coverage Threshold Validation:');

    for (const [metric, threshold] of Object.entries(thresholds)) {
      const actual = total[metric].pct;
      const status = actual >= threshold ? '✅' : '❌';

      console.log(`   ${status} ${metric}: ${actual}% (threshold: ${threshold}%)`);

      if (actual < threshold) {
        passed = false;
      }
    }

    return passed;
  } catch (error) {
    console.error('❌ Error validating coverage thresholds:', error.message);
    return false;
  }
}

function validateTestFiles() {
  console.log('\n🔍 Test File Validation:');

  // Check for test files
  const testFiles = execSync('find . -name "*.test.*" -o -name "*.spec.*" -o -name "__tests__" -type f', { encoding: 'utf8' })
    .split('\n')
    .filter(line => line.trim() && !line.includes('node_modules'));

  if (testFiles.length === 0) {
    console.log('❌ No test files found');
    return false;
  }

  console.log(`✅ Found ${testFiles.length} test files`);

  // Check for test categorization
  const categorizedTests = testFiles.filter(file =>
    fs.readFileSync(file, 'utf8').includes('describe(') ||
    fs.readFileSync(file, 'utf8').includes('it(') ||
    fs.readFileSync(file, 'utf8').includes('test(')
  );

  console.log(`✅ ${categorizedTests.length} test files have proper test structure`);

  return true;
}

function generateReport(results, options = {}) {
  const { ci = false } = options;

  console.log('\n' + '='.repeat(80));
  console.log('📋 TEST VALIDATION REPORT');
  console.log('='.repeat(80));

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => r.success === false && !r.ignored).length;
  const skipped = results.filter(r => r.ignored).length;

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);

  console.log('\n📋 Detailed Results:');
  results.forEach(result => {
    const icon = result.success ? '✅' : (result.ignored ? '⏭️' : '❌');
    console.log(`   ${icon} ${result.name}`);
    if (!result.success && !result.ignored && result.error) {
      console.log(`      Error: ${result.error}`);
    }
  });

  if (ci && failed > 0) {
    console.log('\n❌ CI Validation failed - check the errors above');
    process.exit(1);
  } else if (failed > 0) {
    console.log('\n⚠️  Some validations failed - review the errors above');
    return false;
  } else {
    console.log('\n🎉 All validations passed!');
    return true;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const options = {
    ci: args.includes('--ci'),
    quick: args.includes('--quick'),
    mutation: args.includes('--mutation')
  };

  console.log('🧪 Starting Test Validation...');
  console.log(`Mode: ${options.ci ? 'CI' : options.quick ? 'Quick' : 'Full'}`);

  const results = [];
  const stepsToRun = { ...VALIDATION_STEPS };

  // Adjust steps based on options
  if (options.quick) {
    delete stepsToRun.mutation;
    delete stepsToRun.e2e;
  }

  if (!options.mutation) {
    delete stepsToRun.mutation;
  }

  if (!options.ci) {
    delete stepsToRun.e2e;
  }

  // Run validation steps
  for (const [key, step] of Object.entries(stepsToRun)) {
    if (options.ci && !step.ciOnly && !step.required) {
      // Skip optional steps in CI unless explicitly requested
      continue;
    }

    const result = runCommand(step.command, {
      ignoreErrors: !step.required,
      timeout: key === 'mutation' ? 600000 : 120000 // 10 min for mutation, 2 min for others
    });

    results.push({
      name: step.name,
      success: result.success,
      ignored: result.ignored,
      error: result.error
    });
  }

  // Additional validations
  results.push({
    name: 'Coverage Thresholds',
    success: validateCoverageThresholds()
  });

  results.push({
    name: 'Test File Structure',
    success: validateTestFiles()
  });

  // Generate final report
  return generateReport(results, options);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Test validation failed:', error);
    process.exit(1);
  });
}

export { main, runCommand, validateCoverageThresholds, validateTestFiles };
