#!/usr/bin/env node

/**
 * Security Check Script
 * Run before pushing to GitHub to ensure no secrets are exposed
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔒 Running Security Checks...\n');

let hasErrors = false;

// 1. Check if .env is in .gitignore
console.log('1️⃣ Checking .gitignore...');
const gitignore = fs.readFileSync('.gitignore', 'utf8');
const requiredIgnores = ['.env', '*.pem', '*.key', 'contract-info.json'];

requiredIgnores.forEach(pattern => {
  if (gitignore.includes(pattern)) {
    console.log(`   ✅ ${pattern} is ignored`);
  } else {
    console.log(`   ❌ ${pattern} is NOT in .gitignore!`);
    hasErrors = true;
  }
});

// 2. Check if .env exists and is not tracked
console.log('\n2️⃣ Checking .env file...');
if (fs.existsSync('.env')) {
  try {
    const tracked = execSync('git ls-files .env', { encoding: 'utf8' }).trim();
    if (tracked) {
      console.log('   ❌ .env is tracked by git! Remove it with: git rm --cached .env');
      hasErrors = true;
    } else {
      console.log('   ✅ .env exists but is not tracked');
    }
  } catch (e) {
    console.log('   ✅ .env is not tracked by git');
  }
} else {
  console.log('   ⚠️  .env file not found (create from .env.example)');
}

// 3. Check staged files
console.log('\n3️⃣ Checking staged files...');
try {
  const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim();
  if (staged) {
    const files = staged.split('\n');
    const dangerousFiles = files.filter(f => 
      f.includes('.env') || 
      f.includes('.pem') || 
      f.includes('.key') ||
      f.includes('contract-info.json')
    );
    
    if (dangerousFiles.length > 0) {
      console.log('   ❌ Dangerous files staged:');
      dangerousFiles.forEach(f => console.log(`      - ${f}`));
      hasErrors = true;
    } else {
      console.log('   ✅ No dangerous files staged');
    }
  } else {
    console.log('   ℹ️  No files staged');
  }
} catch (e) {
  console.log('   ℹ️  No git repository or no staged files');
}

// 4. Search for hardcoded secrets in source files
console.log('\n4️⃣ Searching for hardcoded secrets...');

const searchPatterns = [
  { name: 'Private Keys', pattern: /PRIVATE_KEY\s*=\s*["']0x[a-fA-F0-9]{64}["']/ },
  { name: 'API Keys (sk-)', pattern: /["']sk-[a-zA-Z0-9-]{20,}["']/ },
  { name: 'Hedera Account IDs', pattern: /["']0\.0\.\d{5,}["']/ },
];

const srcFiles = [
  'src/**/*.ts',
  'src/**/*.tsx',
  'src/**/*.js',
];

let foundSecrets = false;

srcFiles.forEach(pattern => {
  try {
    const files = execSync(`git ls-files "${pattern}"`, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    
    files.forEach(file => {
      if (!fs.existsSync(file)) return;
      
      const content = fs.readFileSync(file, 'utf8');
      
      searchPatterns.forEach(({ name, pattern }) => {
        if (pattern.test(content)) {
          console.log(`   ❌ ${name} found in ${file}`);
          foundSecrets = true;
          hasErrors = true;
        }
      });
    });
  } catch (e) {
    // Pattern not found or no files
  }
});

if (!foundSecrets) {
  console.log('   ✅ No hardcoded secrets found in source files');
}

// 5. Check .env.example
console.log('\n5️⃣ Checking .env.example...');
if (fs.existsSync('.env.example')) {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  
  // Check for real values (should only have placeholders)
  const hasRealPrivateKey = /PRIVATE_KEY=0x[a-fA-F0-9]{64}/.test(envExample);
  const hasRealApiKey = /OPENAI_API_KEY=sk-[a-zA-Z0-9-]{20,}/.test(envExample);
  
  if (hasRealPrivateKey || hasRealApiKey) {
    console.log('   ❌ .env.example contains real secrets!');
    hasErrors = true;
  } else {
    console.log('   ✅ .env.example looks safe (only placeholders)');
  }
} else {
  console.log('   ⚠️  .env.example not found');
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ SECURITY ISSUES FOUND!');
  console.log('='.repeat(50));
  console.log('\n⚠️  DO NOT PUSH TO GITHUB until issues are fixed!\n');
  process.exit(1);
} else {
  console.log('✅ ALL SECURITY CHECKS PASSED!');
  console.log('='.repeat(50));
  console.log('\n🚀 Safe to push to GitHub!\n');
  process.exit(0);
}
