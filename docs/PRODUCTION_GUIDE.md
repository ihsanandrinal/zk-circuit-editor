# Production Deployment & Monitoring Guide

This guide covers deployment, optimization, monitoring, and maintenance of the ZK Circuit Editor in production environments.

## 🚀 Deployment Process

### Automated Deployment

The preferred deployment method is using our automated deployment script:

```bash
# Deploy from master branch (production)
npm run production:deploy

# Deploy from feature branch (preview)
node scripts/deploy.js deploy feature-branch
```

### Manual Deployment

For manual deployments:

```bash
# 1. Run pre-deployment checks
npm run test
npm run build
npm run lint

# 2. Deploy to Vercel
npx vercel --prod

# 3. Run post-deployment tests
npm run production:test https://your-deployed-url.vercel.app
```

## 📊 Monitoring & Analytics

### Health Monitoring

The application includes a health check endpoint at `/api/health` that provides:

- Service status
- Performance metrics  
- Memory usage
- ZK service availability
- Environment information

Access the health check:
```bash
curl https://your-app.vercel.app/api/health
```

### Error Tracking

The application automatically tracks:

- Client-side JavaScript errors
- Unhandled promise rejections  
- Performance metrics
- Custom ZK operation events

Errors are sent to `/api/analytics/error` and can be integrated with external services like Sentry or Bugsnag.

### Performance Monitoring

Performance metrics are automatically collected:

- Page load times
- First paint/contentful paint
- Bundle sizes
- ZK operation durations

Access performance data at `/api/analytics/performance`.

## 🔧 Production Testing

### Comprehensive Testing Script

Run the production testing suite:

```bash
# Test deployed application
npm run production:test https://your-app.vercel.app

# The script tests:
# - All viewport sizes (desktop, tablet, mobile)
# - Core UI functionality
# - ZK proof generation
# - Error handling
# - Performance metrics
# - WebAssembly support
# - Keyboard shortcuts
```

### Test Categories

1. **Responsive Design Testing**
   - Desktop (1920x1080, 1366x768)
   - Tablet (768x1024)
   - Mobile (375x667)

2. **Functionality Testing**
   - Code editor functionality
   - Input panel validation
   - Proof generation workflow
   - Example loading
   - Error boundary behavior

3. **Performance Testing**
   - Page load times
   - Bundle size analysis
   - Memory usage
   - First paint metrics

4. **ZK Service Testing**
   - MidnightJS initialization
   - WebAssembly support
   - Proof generation
   - Fallback modes

## 📈 Bundle Optimization

### Analysis Script

Analyze bundle size and get optimization recommendations:

```bash
npm run production:analyze
```

The script provides:
- JavaScript bundle sizes by chunk
- CSS bundle analysis
- Dependency analysis
- Specific optimization recommendations

### Performance Optimizations

Current optimizations include:

1. **Next.js Configuration**
   - Code splitting
   - Image optimization (WebP/AVIF)
   - CSS optimization
   - Chunk splitting for better caching

2. **Caching Headers**
   - Static assets: 1 year cache
   - API routes: 1 second cache with stale-while-revalidate
   - Images: 1 day cache

3. **Webpack Optimizations**
   - Vendor chunk separation
   - Common chunk extraction
   - Dynamic imports for heavy components

## 🛠️ Deployment Management

### Status Checking

Check current deployment status:

```bash
npm run production:status
```

### Rollback

Rollback to previous deployment:

```bash
npm run production:rollback
```

### Logs

View deployment and application logs:

```bash
npm run production:logs
```

## 🔒 Security & Privacy

### Security Headers

The application includes comprehensive security headers:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Cross-Origin-Embedder-Policy: credentialless`
- `Cross-Origin-Opener-Policy: cross-origin`

### Privacy Protection

- Private inputs are never logged or persisted
- Error messages are sanitized in production
- Auto-save only saves circuit code and public inputs
- Users can disable auto-save functionality

## 🚨 Troubleshooting

### Common Issues

1. **ZK Service Not Loading**
   - Check WebAssembly support in browser
   - Verify CORS headers for MidnightJS endpoint
   - Check network connectivity
   - Application falls back to demo mode if service unavailable

2. **Slow Load Times**
   - Run bundle analysis: `npm run production:analyze`
   - Check CDN cache hit rates
   - Verify image optimization is working
   - Consider enabling service worker caching

3. **Build Failures**
   - Verify Node.js version (>=18.0.0)
   - Clear Next.js cache: `rm -rf .next`
   - Reinstall dependencies: `npm ci`
   - Check for TypeScript errors: `npm run lint`

4. **Memory Issues**
   - Monitor `/api/health` endpoint for memory usage
   - Increase Node.js memory limit in `vercel.json`
   - Check for memory leaks in ZK operations

### Performance Troubleshooting

1. **Large Bundle Sizes**
   ```bash
   # Analyze bundle composition
   npm run production:analyze
   
   # Enable webpack bundle analyzer
   ANALYZE=true npm run build
   ```

2. **Slow API Responses**
   - Check function duration limits in `vercel.json`
   - Monitor cold start times
   - Consider implementing API response caching

3. **Client-Side Errors**
   - Check browser console for detailed errors
   - Review error analytics at `/api/analytics/error`
   - Verify WebAssembly support

## 📋 Maintenance Checklist

### Weekly

- [ ] Review error analytics
- [ ] Check performance metrics
- [ ] Monitor health check endpoint
- [ ] Review deployment logs

### Monthly

- [ ] Run comprehensive production tests
- [ ] Analyze bundle size trends
- [ ] Update dependencies (security patches)
- [ ] Review and update caching strategies

### Quarterly

- [ ] Performance optimization review
- [ ] Security audit
- [ ] Dependency updates (major versions)
- [ ] Load testing with realistic traffic

## 🔗 Useful Commands

```bash
# Quick deployment check
npm run deploy:check

# Local production build test
npm run deploy:local-test

# Analyze current deployment
npm run production:analyze

# Full production test suite
npm run production:test

# Check deployment status
npm run production:status

# View recent logs
npm run production:logs

# Emergency rollback
npm run production:rollback
```

## 📞 Support

For deployment issues or questions:

1. Check this guide first
2. Review logs with `npm run production:logs`
3. Run diagnostics with `npm run production:test`
4. Check health endpoint at `/health`

## 🎯 Performance Targets

- **Page Load Time**: < 3 seconds
- **First Contentful Paint**: < 2 seconds
- **Bundle Size**: JavaScript < 1MB, CSS < 100KB
- **Health Check**: < 500ms response time
- **Error Rate**: < 1% of requests
- **Uptime**: > 99.9%

These targets are monitored automatically and reported in the health check endpoint and production test results.