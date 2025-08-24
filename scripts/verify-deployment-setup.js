#!/usr/bin/env node

/**
 * Verification script for Vercel deployment setup
 * Checks all requirements for successful ZK Circuit Editor deployment
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(command, name) {
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ ${name} is installed: ${result.trim()}`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${name} is not installed or not working`, 'red');
    return false;
  }
}

function checkFile(filePath, name) {
  if (existsSync(filePath)) {
    log(`✅ ${name} exists`, 'green');
    return true;
  } else {
    log(`❌ ${name} is missing`, 'red');
    return false;
  }
}

function checkPackageJson() {
  const packagePath = join(process.cwd(), 'package.json');
  if (!existsSync(packagePath)) {
    log('❌ package.json not found', 'red');
    return false;
  }

  try {
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    const requiredScripts = ['build', 'start', 'vercel-build'];
    const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
    
    if (missingScripts.length > 0) {
      log(`❌ Missing required scripts: ${missingScripts.join(', ')}`, 'red');
      return false;
    }
    
    log('✅ package.json has all required scripts', 'green');
    return true;
  } catch (error) {
    log('❌ Error reading package.json', 'red');
    return false;
  }
}

function checkVercelConfig() {
  const vercelPath = join(process.cwd(), 'vercel.json');
  if (!existsSync(vercelPath)) {
    log('❌ vercel.json not found', 'red');
    return false;
  }

  try {
    const vercelConfig = JSON.parse(readFileSync(vercelPath, 'utf8'));
    const requiredFields = ['buildCommand', 'framework'];
    const missingFields = requiredFields.filter(field => !vercelConfig[field]);
    
    if (missingFields.length > 0) {
      log(`❌ Missing required vercel.json fields: ${missingFields.join(', ')}`, 'red');
      return false;
    }
    
    log('✅ vercel.json is properly configured', 'green');
    return true;
  } catch (error) {
    log('❌ Error reading vercel.json', 'red');
    return false;
  }
}

function checkVercelAuth() {
  try {
    const result = execSync('vercel whoami', { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ Authenticated with Vercel as: ${result.trim()}`, 'green');
    return true;
  } catch (error) {
    log('❌ Not authenticated with Vercel. Run: vercel login', 'red');
    return false;
  }
}

function checkBuildProcess() {
  try {
    log('🔄 Testing build process...', 'yellow');
    execSync('npm run build', { encoding: 'utf8', stdio: 'pipe' });
    log('✅ Build process successful', 'green');
    return true;
  } catch (error) {
    log('❌ Build process failed. Check your code and dependencies', 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('🚀 ZK Circuit Editor - Vercel Deployment Verification', 'bold');
  log('=' .repeat(60), 'blue');
  
  const checks = [
    { name: 'Node.js', fn: () => checkCommand('node --version', 'Node.js') },
    { name: 'npm', fn: () => checkCommand('npm --version', 'npm') },
    { name: 'Vercel CLI', fn: () => checkCommand('vercel --version', 'Vercel CLI') },
    { name: 'Vercel Authentication', fn: checkVercelAuth },
    { name: 'package.json', fn: checkPackageJson },
    { name: 'vercel.json', fn: checkVercelConfig },
    { name: 'Environment Example', fn: () => checkFile('.env.example', '.env.example') },
    { name: 'Environment Production', fn: () => checkFile('.env.production', '.env.production') },
  ];

  let passed = 0;
  let total = checks.length;

  for (const check of checks) {
    if (check.fn()) {
      passed++;
    }
  }

  log('\n' + '=' .repeat(60), 'blue');
  
  if (passed === total) {
    log('🎉 All checks passed! Your project is ready for Vercel deployment.', 'green');
    log('\nNext steps:', 'bold');
    log('1. Run: vercel --prod', 'blue');
    log('2. Configure environment variables in Vercel dashboard if needed', 'blue');
    log('3. Your ZK Circuit Editor will be live!', 'blue');
  } else {
    log(`⚠️  ${passed}/${total} checks passed. Please fix the issues above before deploying.`, 'yellow');
    
    if (!checkCommand('vercel --version', 'Vercel CLI')) {
      log('\nTo install Vercel CLI:', 'bold');
      log('npm install -g vercel', 'blue');
    }
    
    if (!checkVercelAuth()) {
      log('\nTo authenticate with Vercel:', 'bold');
      log('vercel login', 'blue');
    }
  }
  
  log('\n📚 For more help, visit: https://vercel.com/docs', 'blue');
}

main();