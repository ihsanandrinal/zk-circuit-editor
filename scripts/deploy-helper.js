#!/usr/bin/env node

/**
 * Deployment Helper Script for ZK Circuit Editor
 * Handles common deployment scenarios and error troubleshooting
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

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

function executeCommand(command, description) {
  try {
    log(`🔄 ${description}...`, 'yellow');
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ ${description} completed`, 'green');
    return result;
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    log(`Error: ${error.message}`, 'red');
    throw error;
  }
}

function checkBundleSize() {
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    log('📊 Bundle size analysis:', 'blue');
    executeCommand('npm run analyze', 'Analyzing bundle size');
  } catch (error) {
    log('⚠️  Bundle analysis skipped (cross-env not available)', 'yellow');
  }
}

function deploymentHealthCheck() {
  log('🏥 Running pre-deployment health check...', 'blue');
  
  try {
    // Run verification script
    executeCommand('npm run verify-deployment', 'Running deployment verification');
    
    // Run tests
    executeCommand('npm run test', 'Running unit tests');
    
    // Run linting
    executeCommand('npm run lint', 'Running code linting');
    
    // Test build process
    executeCommand('npm run build', 'Testing build process');
    
    log('✅ All health checks passed!', 'green');
    return true;
  } catch (error) {
    log('❌ Health check failed. Please fix issues before deploying.', 'red');
    return false;
  }
}

function handleCommonErrors(error) {
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('build failed') || errorMessage.includes('compilation failed')) {
    log('\n🔧 Build Error Troubleshooting:', 'yellow');
    log('1. Check for TypeScript errors: npm run build', 'blue');
    log('2. Verify all imports are correct', 'blue');
    log('3. Check for missing dependencies: npm install', 'blue');
    log('4. Clear Next.js cache: rm -rf .next', 'blue');
  }
  
  if (errorMessage.includes('function timeout') || errorMessage.includes('lambda timeout')) {
    log('\n⏱️  Timeout Error Solutions:', 'yellow');
    log('1. Optimize WebAssembly loading in zkService.js', 'blue');
    log('2. Consider using Vercel Pro for longer timeouts', 'blue');
    log('3. Implement lazy loading for heavy components', 'blue');
  }
  
  if (errorMessage.includes('memory') || errorMessage.includes('heap')) {
    log('\n💾 Memory Error Solutions:', 'yellow');
    log('1. Reduce bundle size with code splitting', 'blue');
    log('2. Optimize imports to reduce memory usage', 'blue');
    log('3. Consider Vercel Pro for increased memory limits', 'blue');
  }
  
  if (errorMessage.includes('wasm') || errorMessage.includes('webassembly')) {
    log('\n🔧 WebAssembly Error Solutions:', 'yellow');
    log('1. Check CORS headers in vercel.json', 'blue');
    log('2. Verify WASM files are in public directory', 'blue');
    log('3. Ensure proper MIME types for .wasm files', 'blue');
    log('4. Check Cross-Origin-Embedder-Policy headers', 'blue');
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  log('🚀 ZK Circuit Editor - Deployment Helper', 'bold');
  log('=' .repeat(50), 'blue');
  
  try {
    switch (command) {
      case 'check':
        if (deploymentHealthCheck()) {
          log('\n🎉 Ready for deployment! Run: npm run deploy', 'green');
        }
        break;
        
      case 'prod':
        log('🏭 Starting production deployment...', 'blue');
        if (deploymentHealthCheck()) {
          executeCommand('vercel --prod', 'Deploying to production');
          log('\n🎉 Production deployment completed!', 'green');
          executeCommand('vercel --prod --logs', 'Fetching deployment logs');
        }
        break;
        
      case 'preview':
        log('👁️  Starting preview deployment...', 'blue');
        executeCommand('vercel', 'Creating preview deployment');
        log('\n✅ Preview deployment completed!', 'green');
        break;
        
      case 'local-test':
        log('🏠 Testing local production build...', 'blue');
        executeCommand('npm run build', 'Building for production');
        log('Starting local server on http://localhost:3000', 'blue');
        executeCommand('npm run start', 'Starting production server');
        break;
        
      case 'logs':
        log('📋 Fetching deployment logs...', 'blue');
        executeCommand('vercel logs', 'Getting recent logs');
        break;
        
      case 'status':
        log('📊 Checking deployment status...', 'blue');
        executeCommand('vercel ls', 'Listing deployments');
        break;
        
      default:
        log('Usage: node scripts/deploy-helper.js [command]', 'yellow');
        log('Commands:', 'blue');
        log('  check      - Run pre-deployment health checks', 'blue');
        log('  prod       - Deploy to production with checks', 'blue');
        log('  preview    - Create preview deployment', 'blue');
        log('  local-test - Test production build locally', 'blue');
        log('  logs       - View deployment logs', 'blue');
        log('  status     - Check deployment status', 'blue');
        break;
    }
  } catch (error) {
    log('\n💥 Deployment failed!', 'red');
    handleCommonErrors(error);
    process.exit(1);
  }
}

main();