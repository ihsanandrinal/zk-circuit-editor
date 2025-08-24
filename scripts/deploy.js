#!/usr/bin/env node
/**
 * Deployment Management Script for ZK Circuit Editor
 * Handles deployment, rollback, and status checking
 * 
 * Usage: 
 *   node scripts/deploy.js deploy [branch] 
 *   node scripts/deploy.js status
 *   node scripts/deploy.js rollback
 *   node scripts/deploy.js logs
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

class DeploymentManager {
  constructor() {
    this.projectName = 'zk-circuit-editor';
    this.configFile = path.join(process.cwd(), '.deployment-config.json');
    this.logFile = path.join(process.cwd(), 'logs', 'deployment.log');
    this.ensureLogDir();
  }

  ensureLogDir() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    console.log(logMessage);
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }

  async loadConfig() {
    try {
      if (fs.existsSync(this.configFile)) {
        return JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
      }
    } catch (error) {
      this.log(`Warning: Could not load config: ${error.message}`, 'warn');
    }
    return {};
  }

  async saveConfig(config) {
    try {
      fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
    } catch (error) {
      this.log(`Error saving config: ${error.message}`, 'error');
    }
  }

  async deploy(branch = 'master') {
    this.log(`🚀 Starting deployment from branch: ${branch}`);
    
    try {
      // Pre-deployment checks
      await this.preDeploymentChecks();
      
      // Run tests
      this.log('📋 Running tests...');
      await execAsync('npm run test');
      this.log('✅ Tests passed');
      
      // Build application
      this.log('🔨 Building application...');
      await execAsync('npm run build');
      this.log('✅ Build successful');
      
      // Bundle analysis
      this.log('📊 Analyzing bundle...');
      try {
        await execAsync('node scripts/analyze-bundle.js');
      } catch (error) {
        this.log('⚠️ Bundle analysis failed, but continuing deployment', 'warn');
      }
      
      // Deploy to Vercel
      this.log('🌍 Deploying to Vercel...');
      const deployCommand = branch === 'master' ? 'npx vercel --prod' : `npx vercel --branch=${branch}`;
      
      const { stdout } = await execAsync(deployCommand);
      const deploymentUrl = this.extractDeploymentUrl(stdout);
      
      if (deploymentUrl) {
        this.log(`✅ Deployment successful: ${deploymentUrl}`);
        
        // Save deployment info
        const config = await this.loadConfig();
        config.lastDeployment = {
          url: deploymentUrl,
          branch,
          timestamp: new Date().toISOString(),
          commit: await this.getCurrentCommit()
        };
        await this.saveConfig(config);
        
        // Run post-deployment tests
        await this.postDeploymentTests(deploymentUrl);
        
        return deploymentUrl;
      } else {
        throw new Error('Could not extract deployment URL from Vercel output');
      }
      
    } catch (error) {
      this.log(`❌ Deployment failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async preDeploymentChecks() {
    this.log('🔍 Running pre-deployment checks...');
    
    // Check if we're in a git repository
    try {
      await execAsync('git status');
    } catch (error) {
      throw new Error('Not in a git repository');
    }
    
    // Check for uncommitted changes
    const { stdout } = await execAsync('git status --porcelain');
    if (stdout.trim()) {
      this.log('⚠️ Warning: Uncommitted changes detected', 'warn');
      console.log(stdout);
      
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise((resolve) => {
        rl.question('Continue with deployment? (y/N): ', resolve);
      });
      rl.close();
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        throw new Error('Deployment cancelled by user');
      }
    }
    
    // Check Node.js version
    const nodeVersion = process.version;
    this.log(`Node.js version: ${nodeVersion}`);
    
    // Check dependencies
    if (!fs.existsSync('node_modules')) {
      this.log('Installing dependencies...');
      await execAsync('npm install');
    }
    
    this.log('✅ Pre-deployment checks passed');
  }

  async postDeploymentTests(deploymentUrl) {
    this.log('🧪 Running post-deployment tests...');
    
    try {
      // Wait a moment for deployment to be ready
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Run production tests
      const testCommand = `node scripts/test-production.js ${deploymentUrl}`;
      await execAsync(testCommand);
      this.log('✅ Post-deployment tests passed');
      
    } catch (error) {
      this.log(`⚠️ Post-deployment tests failed: ${error.message}`, 'warn');
      // Don't fail the deployment for test failures
    }
  }

  extractDeploymentUrl(stdout) {
    const lines = stdout.split('\n');
    for (const line of lines) {
      if (line.includes('https://') && (line.includes('vercel.app') || line.includes('your-domain.com'))) {
        const match = line.match(/(https:\/\/[^\s]+)/);
        return match ? match[1] : null;
      }
    }
    return null;
  }

  async getCurrentCommit() {
    try {
      const { stdout } = await execAsync('git rev-parse HEAD');
      return stdout.trim();
    } catch (error) {
      return 'unknown';
    }
  }

  async getStatus() {
    this.log('📊 Checking deployment status...');
    
    try {
      const config = await this.loadConfig();
      
      if (config.lastDeployment) {
        console.log('\n🌍 Last Deployment:');
        console.log(`  URL: ${config.lastDeployment.url}`);
        console.log(`  Branch: ${config.lastDeployment.branch}`);
        console.log(`  Time: ${new Date(config.lastDeployment.timestamp).toLocaleString()}`);
        console.log(`  Commit: ${config.lastDeployment.commit.substring(0, 8)}`);
      }
      
      // Check Vercel deployments
      try {
        const { stdout } = await execAsync('npx vercel ls');
        console.log('\n📋 Recent Vercel Deployments:');
        console.log(stdout);
      } catch (error) {
        this.log('Could not fetch Vercel deployments', 'warn');
      }
      
      // Check current git status
      const { stdout: gitStatus } = await execAsync('git status --short');
      if (gitStatus.trim()) {
        console.log('\n📝 Git Status:');
        console.log(gitStatus);
      }
      
    } catch (error) {
      this.log(`Error checking status: ${error.message}`, 'error');
    }
  }

  async rollback() {
    this.log('🔄 Starting rollback process...');
    
    try {
      const config = await this.loadConfig();
      
      if (!config.lastDeployment) {
        throw new Error('No previous deployment found to rollback to');
      }
      
      console.log(`Rolling back to commit: ${config.lastDeployment.commit}`);
      
      // Get list of Vercel deployments
      const { stdout } = await execAsync('npx vercel ls --json');
      const deployments = JSON.parse(stdout);
      
      if (deployments.length < 2) {
        throw new Error('No previous deployment found to rollback to');
      }
      
      // Find the previous deployment (second most recent)
      const previousDeployment = deployments[1];
      
      console.log(`Rolling back to: ${previousDeployment.url}`);
      
      // Promote previous deployment
      await execAsync(`npx vercel promote ${previousDeployment.url}`);
      
      this.log(`✅ Rollback successful to: ${previousDeployment.url}`);
      
    } catch (error) {
      this.log(`❌ Rollback failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async getLogs() {
    this.log('📄 Fetching deployment logs...');
    
    try {
      // Show local deployment log
      if (fs.existsSync(this.logFile)) {
        console.log('\n📋 Local Deployment Log (last 50 lines):');
        console.log('-'.repeat(60));
        const { stdout } = await execAsync(`tail -n 50 "${this.logFile}"`);
        console.log(stdout);
      }
      
      // Show Vercel logs for latest deployment
      try {
        console.log('\n🌍 Vercel Function Logs:');
        console.log('-'.repeat(60));
        await execAsync('npx vercel logs --output');
      } catch (error) {
        this.log('Could not fetch Vercel logs', 'warn');
      }
      
    } catch (error) {
      this.log(`Error fetching logs: ${error.message}`, 'error');
    }
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];
  
  const manager = new DeploymentManager();
  
  try {
    switch (command) {
      case 'deploy':
        await manager.deploy(arg);
        break;
      case 'status':
        await manager.getStatus();
        break;
      case 'rollback':
        await manager.rollback();
        break;
      case 'logs':
        await manager.getLogs();
        break;
      default:
        console.log(`
🚀 ZK Circuit Editor Deployment Manager

Usage:
  node scripts/deploy.js deploy [branch]    Deploy from branch (default: master)
  node scripts/deploy.js status            Check deployment status
  node scripts/deploy.js rollback          Rollback to previous deployment
  node scripts/deploy.js logs              View deployment logs

Examples:
  node scripts/deploy.js deploy master     Deploy from master branch
  node scripts/deploy.js deploy feature    Deploy from feature branch
  node scripts/deploy.js status            Check current status
        `);
        break;
    }
  } catch (error) {
    console.error(`\n❌ Operation failed: ${error.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default DeploymentManager;