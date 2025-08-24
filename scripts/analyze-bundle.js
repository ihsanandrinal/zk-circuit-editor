/**
 * Bundle Analysis and Optimization Script
 * Analyzes build output and provides optimization recommendations
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

class BundleAnalyzer {
  constructor() {
    this.buildDir = path.join(process.cwd(), '.next');
    this.results = {
      timestamp: new Date().toISOString(),
      bundleSizes: {},
      recommendations: [],
      performance: {}
    };
  }

  async analyze() {
    console.log('🔍 Analyzing bundle size and performance...\n');

    try {
      // Run build if needed
      await this.ensureBuild();
      
      // Analyze bundle sizes
      await this.analyzeBundleSizes();
      
      // Analyze dependencies
      await this.analyzeDependencies();
      
      // Check for optimization opportunities
      this.generateRecommendations();
      
      // Generate report
      this.generateReport();

    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      process.exit(1);
    }
  }

  async ensureBuild() {
    if (!fs.existsSync(this.buildDir)) {
      console.log('🔨 Building application...');
      await execAsync('npm run build');
    }
  }

  async analyzeBundleSizes() {
    console.log('📦 Analyzing bundle sizes...');
    
    try {
      // Analyze .next/static/chunks
      const chunksDir = path.join(this.buildDir, 'static', 'chunks');
      if (fs.existsSync(chunksDir)) {
        const chunks = fs.readdirSync(chunksDir);
        let totalSize = 0;
        const chunkSizes = {};

        chunks.forEach(chunk => {
          if (chunk.endsWith('.js')) {
            const filePath = path.join(chunksDir, chunk);
            const size = fs.statSync(filePath).size;
            totalSize += size;
            chunkSizes[chunk] = {
              size,
              sizeKB: Math.round(size / 1024),
              sizeMB: (size / (1024 * 1024)).toFixed(2)
            };
          }
        });

        this.results.bundleSizes.chunks = chunkSizes;
        this.results.bundleSizes.totalJS = totalSize;

        // Find largest chunks
        const sortedChunks = Object.entries(chunkSizes)
          .sort(([,a], [,b]) => b.size - a.size)
          .slice(0, 10);

        console.log('  Largest JavaScript chunks:');
        sortedChunks.forEach(([name, data]) => {
          console.log(`    ${name}: ${data.sizeKB} KB`);
        });
      }

      // Analyze CSS
      const cssDir = path.join(this.buildDir, 'static', 'css');
      if (fs.existsSync(cssDir)) {
        const cssFiles = fs.readdirSync(cssDir);
        let totalCSSSize = 0;

        cssFiles.forEach(file => {
          if (file.endsWith('.css')) {
            const size = fs.statSync(path.join(cssDir, file)).size;
            totalCSSSize += size;
          }
        });

        this.results.bundleSizes.totalCSS = totalCSSSize;
        console.log(`  Total CSS size: ${Math.round(totalCSSSize / 1024)} KB`);
      }

    } catch (error) {
      console.warn('⚠️  Could not analyze bundle sizes:', error.message);
    }
  }

  async analyzeDependencies() {
    console.log('\n📋 Analyzing dependencies...');
    
    try {
      // Read package.json
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Analyze dependency sizes (simplified)
      const heavyDependencies = [
        'react', 'react-dom', 'next', '@monaco-editor/react', 
        'puppeteer', 'playwright', 'jest'
      ];

      const foundHeavyDeps = heavyDependencies.filter(dep => dependencies[dep]);
      
      this.results.dependencies = {
        total: Object.keys(dependencies).length,
        heavy: foundHeavyDeps,
        production: Object.keys(packageJson.dependencies || {}).length,
        development: Object.keys(packageJson.devDependencies || {}).length
      };

      console.log(`  Total dependencies: ${this.results.dependencies.total}`);
      console.log(`  Production: ${this.results.dependencies.production}`);
      console.log(`  Development: ${this.results.dependencies.development}`);
      console.log(`  Heavy dependencies found: ${foundHeavyDeps.join(', ')}`);

    } catch (error) {
      console.warn('⚠️  Could not analyze dependencies:', error.message);
    }
  }

  generateRecommendations() {
    console.log('\n💡 Generating optimization recommendations...');
    
    const recommendations = [];

    // Bundle size recommendations
    if (this.results.bundleSizes.totalJS > 1024 * 1024) { // > 1MB
      recommendations.push({
        type: 'bundle-size',
        priority: 'high',
        title: 'Large JavaScript bundle detected',
        description: `Total JS bundle size is ${Math.round(this.results.bundleSizes.totalJS / 1024 / 1024)}MB`,
        suggestions: [
          'Enable dynamic imports for heavy components',
          'Implement code splitting for routes',
          'Use lazy loading for non-critical components',
          'Consider removing unused dependencies'
        ]
      });
    }

    // Chunk size recommendations
    if (this.results.bundleSizes.chunks) {
      const largeChunks = Object.entries(this.results.bundleSizes.chunks)
        .filter(([, data]) => data.size > 500 * 1024); // > 500KB

      if (largeChunks.length > 0) {
        recommendations.push({
          type: 'chunk-optimization',
          priority: 'medium',
          title: 'Large chunks detected',
          description: `${largeChunks.length} chunks are larger than 500KB`,
          suggestions: [
            'Split large chunks into smaller ones',
            'Move heavy libraries to separate chunks',
            'Use webpack-bundle-analyzer for detailed analysis'
          ]
        });
      }
    }

    // CSS recommendations
    if (this.results.bundleSizes.totalCSS > 100 * 1024) { // > 100KB
      recommendations.push({
        type: 'css-optimization',
        priority: 'medium',
        title: 'Large CSS bundle',
        description: `CSS bundle is ${Math.round(this.results.bundleSizes.totalCSS / 1024)}KB`,
        suggestions: [
          'Enable CSS purging for unused styles',
          'Consider CSS-in-JS solutions',
          'Split critical and non-critical CSS'
        ]
      });
    }

    // General recommendations
    recommendations.push({
      type: 'general',
      priority: 'low',
      title: 'General optimizations',
      description: 'Standard optimization practices',
      suggestions: [
        'Enable gzip/brotli compression',
        'Implement proper caching headers',
        'Use Next.js Image optimization',
        'Enable WebP images where possible',
        'Implement service worker for caching'
      ]
    });

    this.results.recommendations = recommendations;
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 BUNDLE ANALYSIS REPORT');
    console.log('='.repeat(60));

    if (this.results.bundleSizes.totalJS) {
      console.log(`Total JavaScript: ${Math.round(this.results.bundleSizes.totalJS / 1024)} KB`);
    }
    
    if (this.results.bundleSizes.totalCSS) {
      console.log(`Total CSS: ${Math.round(this.results.bundleSizes.totalCSS / 1024)} KB`);
    }

    console.log('\n🎯 OPTIMIZATION RECOMMENDATIONS');
    console.log('-'.repeat(40));

    this.results.recommendations.forEach((rec, index) => {
      const priorityEmoji = rec.priority === 'high' ? '🔴' : 
                           rec.priority === 'medium' ? '🟡' : '🟢';
      
      console.log(`\n${index + 1}. ${priorityEmoji} ${rec.title}`);
      console.log(`   ${rec.description}`);
      console.log('   Suggestions:');
      rec.suggestions.forEach(suggestion => {
        console.log(`     • ${suggestion}`);
      });
    });

    // Save report
    const reportPath = path.join(process.cwd(), 'reports', `bundle-analysis-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Create optimization configuration
function createOptimizationConfig() {
  const nextConfig = `/**
 * Next.js Configuration with Performance Optimizations
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'date-fns']
  },

  // Compression
  compress: true,

  // Bundle analyzer (enable when needed)
  // bundleAnalyzer: {
  //   enabled: process.env.ANALYZE === 'true'
  // },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },

  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=1, stale-while-revalidate' }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      }
    ];
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/
          },
          common: {
            minChunks: 2,
            chunks: 'all',
            enforce: true
          }
        }
      };
    }
    return config;
  }
};

module.exports = nextConfig;`;

  fs.writeFileSync('next.config.optimized.js', nextConfig);
  console.log('\n✅ Created optimized Next.js config: next.config.optimized.js');
}

// Run analysis
const analyzer = new BundleAnalyzer();
analyzer.analyze().then(() => {
  console.log('\n🔧 Creating optimization configuration...');
  createOptimizationConfig();
}).catch(console.error);