#!/usr/bin/env node

/**
 * Coverage Analysis Script
 *
 * Analyzes test coverage and provides detailed insights into:
 * - Files with low coverage
 * - Uncovered lines and branches
 * - Test quality recommendations
 * - Coverage trends over time
 *
 * Usage:
 *   npm run analyze:coverage
 *   npm run analyze:coverage -- --detailed
 *   npm run analyze:coverage -- --file=src/specific/file.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COVERAGE_DIR = 'coverage';
const LCOV_INFO = path.join(COVERAGE_DIR, 'lcov.info');
const COVERAGE_FINAL = path.join(COVERAGE_DIR, 'coverage-final.json');

// Coverage thresholds
const THRESHOLDS = {
  statements: 80,
  branches: 75,
  functions: 80,
  lines: 80
};

function parseLcovInfo(content) {
  const records = [];
  let currentRecord = null;

  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('TN:')) {
      if (currentRecord) records.push(currentRecord);
      currentRecord = { testName: line.substring(3) };
    } else if (line.startsWith('SF:')) {
      currentRecord.file = line.substring(3);
    } else if (line.startsWith('DA:')) {
      const [lineNum, hits] = line.substring(3).split(',');
      if (!currentRecord.lines) currentRecord.lines = [];
      currentRecord.lines.push({ line: parseInt(lineNum), hits: parseInt(hits) });
    } else if (line.startsWith('BRDA:')) {
      const parts = line.substring(5).split(',');
      if (!currentRecord.branches) currentRecord.branches = [];
      currentRecord.branches.push({
        line: parseInt(parts[0]),
        block: parseInt(parts[1]),
        branch: parseInt(parts[2]),
        taken: parts[3] === '-' ? 0 : parseInt(parts[3])
      });
    } else if (line.startsWith('FN:')) {
      const [lineNum, name] = line.substring(3).split(',');
      if (!currentRecord.functions) currentRecord.functions = [];
      currentRecord.functions.push({ line: parseInt(lineNum), name });
    } else if (line.startsWith('FNDA:')) {
      const [hits, name] = line.substring(5).split(',');
      if (currentRecord.functions) {
        const func = currentRecord.functions.find(f => f.name === name);
        if (func) func.hits = parseInt(hits);
      }
    }
  }

  if (currentRecord) records.push(currentRecord);
  return records;
}

function calculateCoverage(records) {
  const fileCoverage = {};

  for (const record of records) {
    if (!record.file || record.file.includes('node_modules') || record.file.includes('__tests__')) {
      continue;
    }

    const file = record.file;
    if (!fileCoverage[file]) {
      fileCoverage[file] = {
        statements: { covered: 0, total: 0 },
        branches: { covered: 0, total: 0 },
        functions: { covered: 0, total: 0 },
        lines: { covered: 0, total: 0 },
        uncoveredLines: [],
        uncoveredBranches: [],
        uncoveredFunctions: []
      };
    }

    const cov = fileCoverage[file];

    // Lines coverage
    if (record.lines) {
      for (const line of record.lines) {
        cov.lines.total++;
        if (line.hits > 0) {
          cov.lines.covered++;
        } else {
          cov.uncoveredLines.push(line.line);
        }
      }
    }

    // Functions coverage
    if (record.functions) {
      for (const func of record.functions) {
        cov.functions.total++;
        if (func.hits > 0) {
          cov.functions.covered++;
        } else {
          cov.uncoveredFunctions.push(func.name);
        }
      }
    }

    // Branches coverage
    if (record.branches) {
      for (const branch of record.branches) {
        cov.branches.total++;
        if (branch.taken > 0) {
          cov.branches.covered++;
        } else {
          cov.uncoveredBranches.push(`${branch.line}:${branch.block}:${branch.branch}`);
        }
      }
    }

    // Statements = lines for simplicity
    cov.statements = cov.lines;
  }

  return fileCoverage;
}

function analyzeCoverage(fileCoverage) {
  const analysis = {
    summary: {
      totalFiles: 0,
      filesWithLowCoverage: [],
      averageCoverage: { statements: 0, branches: 0, functions: 0, lines: 0 },
      worstFiles: []
    },
    recommendations: [],
    details: {}
  };

  let totalStatements = 0, coveredStatements = 0;
  let totalBranches = 0, coveredBranches = 0;
  let totalFunctions = 0, coveredFunctions = 0;
  let totalLines = 0, coveredLines = 0;

  const files = Object.entries(fileCoverage);
  analysis.summary.totalFiles = files.length;

  for (const [file, cov] of files) {
    // Calculate percentages
    const stmtPct = cov.statements.total > 0 ? (cov.statements.covered / cov.statements.total) * 100 : 0;
    const branchPct = cov.branches.total > 0 ? (cov.branches.covered / cov.branches.total) * 100 : 0;
    const funcPct = cov.functions.total > 0 ? (cov.functions.covered / cov.functions.total) * 100 : 0;
    const linePct = cov.lines.total > 0 ? (cov.lines.covered / cov.lines.total) * 100 : 0;

    // Accumulate totals
    totalStatements += cov.statements.total;
    coveredStatements += cov.statements.covered;
    totalBranches += cov.branches.total;
    coveredBranches += cov.branches.covered;
    totalFunctions += cov.functions.total;
    coveredFunctions += cov.functions.covered;
    totalLines += cov.lines.total;
    coveredLines += cov.lines.covered;

    // Check thresholds
    const lowCoverage = [];
    if (stmtPct < THRESHOLDS.statements) lowCoverage.push('statements');
    if (branchPct < THRESHOLDS.branches) lowCoverage.push('branches');
    if (funcPct < THRESHOLDS.functions) lowCoverage.push('functions');
    if (linePct < THRESHOLDS.lines) lowCoverage.push('lines');

    if (lowCoverage.length > 0) {
      analysis.summary.filesWithLowCoverage.push({
        file,
        coverage: { statements: stmtPct, branches: branchPct, functions: funcPct, lines: linePct },
        lowCoverage
      });
    }

    analysis.details[file] = {
      coverage: { statements: stmtPct, branches: branchPct, functions: funcPct, lines: linePct },
      uncoveredLines: cov.uncoveredLines.slice(0, 10), // First 10
      uncoveredBranches: cov.uncoveredBranches.slice(0, 5), // First 5
      uncoveredFunctions: cov.uncoveredFunctions.slice(0, 5) // First 5
    };
  }

  // Calculate averages
  analysis.summary.averageCoverage = {
    statements: totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 0,
    branches: totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0,
    functions: totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0,
    lines: totalLines > 0 ? (coveredLines / totalLines) * 100 : 0
  };

  // Find worst files
  analysis.summary.worstFiles = analysis.summary.filesWithLowCoverage
    .sort((a, b) => (a.coverage.statements + a.coverage.branches + a.coverage.functions + a.coverage.lines) -
                   (b.coverage.statements + b.coverage.branches + b.coverage.functions + b.coverage.lines))
    .slice(0, 5);

  // Generate recommendations
  if (analysis.summary.averageCoverage.statements < THRESHOLDS.statements) {
    analysis.recommendations.push(`Statements coverage (${analysis.summary.averageCoverage.statements.toFixed(1)}%) is below threshold (${THRESHOLDS.statements}%)`);
  }
  if (analysis.summary.averageCoverage.branches < THRESHOLDS.branches) {
    analysis.recommendations.push(`Branches coverage (${analysis.summary.averageCoverage.branches.toFixed(1)}%) is below threshold (${THRESHOLDS.branches}%)`);
  }
  if (analysis.summary.averageCoverage.functions < THRESHOLDS.functions) {
    analysis.recommendations.push(`Functions coverage (${analysis.summary.averageCoverage.functions.toFixed(1)}%) is below threshold (${THRESHOLDS.functions}%)`);
  }

  if (analysis.summary.filesWithLowCoverage.length > 10) {
    analysis.recommendations.push(`${analysis.summary.filesWithLowCoverage.length} files have low coverage - prioritize testing these files`);
  }

  return analysis;
}

function printAnalysis(analysis, options = {}) {
  console.log('='.repeat(80));
  console.log('📊 COVERAGE ANALYSIS REPORT');
  console.log('='.repeat(80));

  console.log('\n📈 SUMMARY:');
  console.log(`   Total files analyzed: ${analysis.summary.totalFiles}`);
  console.log(`   Files with low coverage: ${analysis.summary.filesWithLowCoverage.length}`);
  console.log('\n📊 Average Coverage:');
  console.log(`   Statements: ${analysis.summary.averageCoverage.statements.toFixed(1)}%`);
  console.log(`   Branches:   ${analysis.summary.averageCoverage.branches.toFixed(1)}%`);
  console.log(`   Functions:  ${analysis.summary.averageCoverage.functions.toFixed(1)}%`);
  console.log(`   Lines:      ${analysis.summary.averageCoverage.lines.toFixed(1)}%`);

  if (analysis.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    analysis.recommendations.forEach(rec => console.log(`   • ${rec}`));
  }

  if (options.detailed && analysis.summary.worstFiles.length > 0) {
    console.log('\n🚨 WORST PERFORMING FILES:');
    analysis.summary.worstFiles.forEach((file, i) => {
      console.log(`   ${i + 1}. ${file.file}`);
      console.log(`      Statements: ${file.coverage.statements.toFixed(1)}%`);
      console.log(`      Branches:   ${file.coverage.branches.toFixed(1)}%`);
      console.log(`      Functions:  ${file.coverage.functions.toFixed(1)}%`);
      console.log(`      Lines:      ${file.coverage.lines.toFixed(1)}%`);
      console.log(`      Issues: ${file.lowCoverage.join(', ')}`);
    });
  }

  if (options.file && analysis.details[options.file]) {
    const detail = analysis.details[options.file];
    console.log(`\n📋 DETAILS FOR: ${options.file}`);
    console.log('Coverage:');
    Object.entries(detail.coverage).forEach(([type, pct]) => {
      console.log(`   ${type}: ${pct.toFixed(1)}%`);
    });

    if (detail.uncoveredLines.length > 0) {
      console.log('Uncovered lines:', detail.uncoveredLines.join(', '));
    }
    if (detail.uncoveredBranches.length > 0) {
      console.log('Uncovered branches:', detail.uncoveredBranches.join(', '));
    }
    if (detail.uncoveredFunctions.length > 0) {
      console.log('Uncovered functions:', detail.uncoveredFunctions.join(', '));
    }
  }

  console.log('\n' + '='.repeat(80));
}

// Main execution
function main() {
  console.log('🚀 Coverage analysis script started');
  const args = process.argv.slice(2);
  console.log('Arguments:', args);
  const options = {};

  args.forEach(arg => {
    if (arg === '--detailed') {
      options.detailed = true;
    } else if (arg.startsWith('--file=')) {
      options.file = arg.substring(7);
    }
  });

  try {
    console.log('🔍 Starting coverage analysis...');

    if (!fs.existsSync(LCOV_INFO)) {
      console.error('❌ Coverage data not found. Run "npm run test:coverage" first.');
      process.exit(1);
    }

    console.log('📖 Reading LCOV data...');
    const lcovContent = fs.readFileSync(LCOV_INFO, 'utf8');
    console.log(`📊 LCOV content length: ${lcovContent.length} characters`);

    console.log('🔬 Parsing LCOV records...');
    const records = parseLcovInfo(lcovContent);
    console.log(`📋 Found ${records.length} records`);

    console.log('📈 Calculating coverage...');
    const fileCoverage = calculateCoverage(records);
    console.log(`📁 Found ${Object.keys(fileCoverage).length} files with coverage`);

    console.log('📊 Analyzing coverage quality...');
    const analysis = analyzeCoverage(fileCoverage);

    console.log('📋 Printing results...');
    printAnalysis(analysis, options);

    // Exit with error if coverage is too low
    const avgStatements = analysis.summary.averageCoverage.statements;
    if (avgStatements < THRESHOLDS.statements - 10) { // Allow some tolerance
      console.error(`❌ Coverage too low: ${avgStatements.toFixed(1)}% < ${THRESHOLDS.statements}%`);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error analyzing coverage:', error.message);
    process.exit(1);
  }
}

// Run main function
main();

export { parseLcovInfo, calculateCoverage, analyzeCoverage };
