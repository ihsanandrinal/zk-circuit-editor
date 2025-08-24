# Deployment Guide

This guide covers deploying the ZK Circuit Editor & Proof Playground to various environments, from development to production scale.

## Table of Contents

1. [Quick Deployment](#quick-deployment)
2. [Production Deployment](#production-deployment)
3. [Cloud Platforms](#cloud-platforms)
4. [Docker Deployment](#docker-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Performance Optimization](#performance-optimization)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Security Considerations](#security-considerations)
9. [Scaling Strategies](#scaling-strategies)

## Quick Deployment

### Local Development

```bash
# Clone and setup
git clone https://github.com/your-org/zk-circuit-editor.git
cd zk-circuit-editor
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Preview Build

```bash
# Build for production
npm run build

# Start production server locally
npm start

# Verify at http://localhost:3000
```

## Production Deployment

### Prerequisites

- **Node.js 18+** or Docker
- **Modern web browser** support (Chrome 57+, Firefox 52+, Safari 11+)
- **HTTPS certificate** (required for WebAssembly in production)
- **CDN** (optional but recommended)

### Build Process

```bash
# Install dependencies
npm ci --only=production

# Build application
npm run build

# Optional: Run tests
npm run test
npm run test:e2e

# Start production server
npm start
```

### Production Environment Variables

Create `.env.production`:

```bash
# Required
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional: Custom MidnightJS endpoint
NEXT_PUBLIC_MIDNIGHT_ENDPOINT=https://your-midnight-service.com

# Security
NEXT_PUBLIC_CSP_ENABLED=true

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Server Configuration

#### Next.js Server

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Static optimization
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
```

## Cloud Platforms

### Vercel (Recommended)

**Advantages**: Zero-config, automatic HTTPS, global CDN, serverless

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Configuration** (`vercel.json`):
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_MIDNIGHT_ENDPOINT": "@midnight-endpoint"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        }
      ]
    }
  ]
}
```

### Netlify

**Advantages**: Git-based deployment, form handling, edge functions

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and deploy
netlify login
netlify deploy --prod
```

**Configuration** (`netlify.toml`):
```toml
[build]
  publish = ".next"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Embedder-Policy = "require-corp"
    Cross-Origin-Opener-Policy = "same-origin"
    X-Frame-Options = "DENY"
```

### AWS

#### EC2 Deployment

```bash
# Launch EC2 instance (Ubuntu 20.04 LTS)
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Clone and setup application
git clone https://github.com/your-org/zk-circuit-editor.git
cd zk-circuit-editor
npm install
npm run build

# Start with PM2
pm2 start npm --name "zk-circuit-editor" -- start
pm2 save
pm2 startup
```

#### Application Load Balancer

```yaml
# ALB Target Group Health Check
Path: /api/health
Port: 3000
Protocol: HTTP
Healthy threshold: 2
Unhealthy threshold: 3
Timeout: 10
Interval: 30
```

#### CloudFormation Template

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Resources:
  ZKCircuitEditorInstance:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: ami-0c02fb55956c7d316  # Ubuntu 20.04 LTS
      InstanceType: t3.medium
      SecurityGroupIds:
        - !Ref ZKSecurityGroup
      UserData:
        Fn::Base64: !Sub |
          #!/bin/bash
          curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
          apt-get install -y nodejs git nginx
          npm install -g pm2
          # Application setup continues...
```

### Google Cloud Platform

#### App Engine Deployment

```yaml
# app.yaml
runtime: nodejs18

env_variables:
  NODE_ENV: production
  NEXT_PUBLIC_APP_URL: https://your-app-id.appspot.com

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.6
```

```bash
# Deploy to App Engine
gcloud app deploy
```

#### Cloud Run Deployment

```bash
# Build and deploy to Cloud Run
gcloud builds submit --tag gcr.io/PROJECT-ID/zk-circuit-editor
gcloud run deploy --image gcr.io/PROJECT-ID/zk-circuit-editor --platform managed
```

### Azure

#### App Service Deployment

```bash
# Create resource group
az group create --name zk-circuit-editor-rg --location "East US"

# Create App Service plan
az appservice plan create --name zk-circuit-editor-plan --resource-group zk-circuit-editor-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group zk-circuit-editor-rg --plan zk-circuit-editor-plan --name zk-circuit-editor --runtime "NODE|18-lts"

# Deploy code
az webapp deployment source config-zip --resource-group zk-circuit-editor-rg --name zk-circuit-editor --src build.zip
```

## Docker Deployment

### Development Dockerfile

```dockerfile
# Development image
FROM node:18-alpine as development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
```

### Production Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine as production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["npm", "start"]
```

### Multi-Stage Build with Testing

```dockerfile
# Base stage
FROM node:18-alpine as base
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Testing stage
FROM base as test
COPY . .
RUN npm run test
RUN npm run test:e2e

# Build stage
FROM base as build
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine as production
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

COPY --from=build --chown=nextjs:nodejs /app/.next ./.next
COPY --from=build --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["npm", "start"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  zk-circuit-editor:
    build:
      context: .
      target: production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_MIDNIGHT_ENDPOINT=http://midnight-service:8080
    depends_on:
      - midnight-service
    restart: unless-stopped
    
  midnight-service:
    image: midnight/service:latest
    ports:
      - "8080:8080"
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - zk-circuit-editor
    restart: unless-stopped
```

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zk-circuit-editor
  labels:
    app: zk-circuit-editor
spec:
  replicas: 3
  selector:
    matchLabels:
      app: zk-circuit-editor
  template:
    metadata:
      labels:
        app: zk-circuit-editor
    spec:
      containers:
      - name: zk-circuit-editor
        image: your-registry/zk-circuit-editor:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_MIDNIGHT_ENDPOINT
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: midnight-endpoint
        resources:
          limits:
            cpu: 500m
            memory: 512Mi
          requests:
            cpu: 250m
            memory: 256Mi
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: zk-circuit-editor-service
spec:
  selector:
    app: zk-circuit-editor
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

## Environment Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` | Production |
| `NEXT_PUBLIC_MIDNIGHT_ENDPOINT` | MidnightJS service endpoint | `http://localhost:8080` | No |
| `NEXT_PUBLIC_ANALYTICS_ID` | Analytics tracking ID | - | No |
| `NEXT_PUBLIC_CSP_ENABLED` | Enable Content Security Policy | `false` | No |

### Configuration Files

#### Production Config

```javascript
// config/production.js
module.exports = {
  app: {
    name: 'ZK Circuit Editor',
    url: process.env.NEXT_PUBLIC_APP_URL,
    version: process.env.npm_package_version,
  },
  
  midnight: {
    endpoint: process.env.NEXT_PUBLIC_MIDNIGHT_ENDPOINT || 'https://api.midnight.network',
    timeout: 30000,
    retries: 3,
  },
  
  security: {
    csp: process.env.NEXT_PUBLIC_CSP_ENABLED === 'true',
    hsts: true,
    noSniff: true,
    frameOptions: 'DENY',
  },
  
  performance: {
    compression: true,
    caching: true,
    staticOptimization: true,
  }
};
```

## Performance Optimization

### Build Optimization

```javascript
// next.config.js
const nextConfig = {
  // Compression
  compress: true,
  
  // Bundle analysis
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    
    // Bundle size optimization
    if (process.env.ANALYZE) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: '../analyze/client.html',
        })
      );
    }
    
    return config;
  },
  
  // Image optimization
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },
  
  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@heroicons/react'],
  }
};
```

### Caching Strategy

```nginx
# nginx.conf
server {
    listen 80;
    server_name your-domain.com;
    
    # Static files caching
    location /_next/static/ {
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_cache_bypass $http_cache_control;
        add_header X-Cache-Status $upstream_cache_status;
    }
    
    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### CDN Configuration

```javascript
// Configure CDN for static assets
const CDN_URL = process.env.CDN_URL;

const nextConfig = {
  assetPrefix: CDN_URL,
  
  // Image optimization with CDN
  images: {
    loader: 'custom',
    loaderFile: './cdn-loader.js',
  }
};
```

## Monitoring and Maintenance

### Health Checks

```javascript
// pages/api/health.js
export default function handler(req, res) {
  // Basic health check
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version,
  };
  
  // Additional checks
  try {
    // Check dependencies
    const dependencies = checkDependencies();
    healthCheck.dependencies = dependencies;
    
    res.status(200).json(healthCheck);
  } catch (error) {
    healthCheck.status = 'error';
    healthCheck.error = error.message;
    res.status(503).json(healthCheck);
  }
}

function checkDependencies() {
  // Implement dependency checks
  return {
    midnight: 'ok',
    database: 'ok',
    cache: 'ok',
  };
}
```

### Logging

```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### Monitoring Dashboard

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana

volumes:
  grafana-storage:
```

## Security Considerations

### HTTPS Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # CSP header
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'";
}
```

### Environment Security

```bash
# Secure environment variables
chmod 600 .env.production
chown root:root .env.production

# File permissions
find /app -type f -exec chmod 644 {} \;
find /app -type d -exec chmod 755 {} \;
chmod +x /app/start.sh
```

### Dependency Security

```bash
# Regular security audits
npm audit
npm audit fix

# Update dependencies
npm update
npm outdated
```

## Scaling Strategies

### Horizontal Scaling

```yaml
# Auto-scaling configuration
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: zk-circuit-editor-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: zk-circuit-editor
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Load Balancing

```nginx
upstream zk_circuit_editor {
    least_conn;
    server app1.example.com:3000 max_fails=3 fail_timeout=30s;
    server app2.example.com:3000 max_fails=3 fail_timeout=30s;
    server app3.example.com:3000 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://zk_circuit_editor;
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
    }
}
```

### Database Scaling (if applicable)

```javascript
// Database connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

2. **Runtime Errors**
   - Check environment variables
   - Verify WebAssembly support
   - Review application logs

3. **Performance Issues**
   - Monitor resource usage
   - Check network connectivity
   - Review caching configuration

### Debug Tools

```bash
# Application logs
docker logs -f container_name

# Performance monitoring
npm run analyze
npm run lighthouse

# Security scanning
npm audit
docker scan image_name
```

---

This deployment guide provides comprehensive coverage for deploying the ZK Circuit Editor from development to production scale. Choose the deployment strategy that best fits your requirements and infrastructure capabilities.