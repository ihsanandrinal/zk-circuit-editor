# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a production-ready ZK Circuit Editor and proof playground built with Next.js 15, React 19, TypeScript, and Tailwind CSS. The project integrates MidnightJS for zero-knowledge proof generation and circuit compilation, featuring comprehensive error handling, testing, and user experience enhancements. It provides both step-by-step workflow and advanced playground interfaces for ZK proof development.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack (http://localhost:3000)
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Testing Suite
- `npm run test` - Run unit tests with Jest
- `npm run test:watch` - Run tests in watch mode for development
- `npm run test:coverage` - Generate comprehensive test coverage report
- `npm run test:e2e` - Run end-to-end tests with Playwright

## Architecture

### Core Technologies
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19 with modern hooks
- **Styling**: Tailwind CSS with shadcn/ui component system
- **Component Library**: shadcn/ui with "new-york" style and Heroicons
- **TypeScript**: Strict mode enabled with path aliases (`@/*` maps to root)
- **Testing**: Jest + React Testing Library + Playwright
- **Fonts**: Geist Sans and Geist Mono from next/font/google

### Production Features
- **Error Boundaries**: Comprehensive error handling with graceful degradation
- **Keyboard Shortcuts**: Full shortcut system for power users
- **Auto-save**: Privacy-conscious automatic saving to localStorage
- **Export/Import**: Complete circuit and result export/import functionality
- **Print Reports**: Professional print-friendly proof verification reports
- **Responsive Design**: Mobile-first design that works across all devices

## Key Configuration

- **Component aliases**: Components at `@/components`, utilities at `@/lib/utils`
- **shadcn/ui**: Configured with neutral base color and CSS variables
- **TypeScript**: Strict configuration with ES2017 target
- **ESLint**: Next.js recommended configuration
- **Jest**: Configured for React components and service testing
- **Playwright**: Configured for cross-browser E2E testing

## ZK Proof Integration

### Core Services
- **ZK Service**: `src/services/zkService.js` - Core service with fallback modes
- **Service Wrapper**: `src/services/zkServiceWrapper.js` - Browser-safe wrapper
- **Global Setup**: `src/services/globalSetup.js` - MidnightJS initialization
- **Error Boundaries**: `src/components/ZKServiceErrorBoundary.jsx` - Specialized ZK error handling

### Testing Infrastructure
- **Unit Tests**: `src/services/__tests__/zkService.test.js` - Service function testing
- **Integration Tests**: `src/components/__tests__/ZKPlayground.test.jsx` - Component testing
- **E2E Tests**: `e2e/zk-playground.spec.js` - Full workflow testing
- **Coverage**: >90% coverage target for critical paths

### Environment Configuration
- **Development**: `.env.local` - Configure MIDNIGHT_ENDPOINT for network connection
- **Production**: Environment variables for service endpoints and security settings
- **Demo Mode**: Fallback mode when MidnightJS services are unavailable

## Project Structure

### Application Structure
```
├── app/                     # Next.js App Router
│   ├── globals.css         # Global styles and Tailwind imports
│   ├── layout.tsx          # Root layout with fonts and metadata
│   └── page.tsx            # Home page with dual interface modes
├── src/
│   ├── components/         # React components
│   │   ├── ZKPlayground.jsx        # Advanced playground interface
│   │   ├── ZKWorkflow.jsx          # Step-by-step workflow interface
│   │   ├── CodeEditor.jsx          # Circuit code editor
│   │   ├── InputPanel.jsx          # Input configuration panel
│   │   ├── OutputPanel.jsx         # Result display panel
│   │   ├── ErrorBoundary.jsx       # General error boundary
│   │   ├── ZKServiceErrorBoundary.jsx # ZK-specific error handling
│   │   ├── KeyboardShortcutsHelp.jsx # Shortcut help modal
│   │   ├── PrintableReport.jsx     # Print-friendly reports
│   │   ├── ExampleSelector.jsx     # Circuit example library
│   │   ├── LoadingIndicator.jsx    # Loading states
│   │   └── __tests__/              # Component tests
│   ├── services/           # Business logic and ZK integration
│   │   ├── zkService.js            # Core ZK service with graceful degradation
│   │   ├── zkServiceWrapper.js     # Browser-compatible wrapper
│   │   ├── globalSetup.js          # MidnightJS global setup
│   │   └── __tests__/              # Service unit tests
│   └── hooks/              # Custom React hooks
│       └── useKeyboardShortcuts.js # Keyboard shortcut management
├── e2e/                    # End-to-end tests
│   └── zk-playground.spec.js       # Playwright E2E tests
├── docs/                   # Comprehensive documentation
│   ├── API.md              # API documentation with TypeScript interfaces
│   ├── USER_GUIDE.md       # Complete user guide with examples
│   └── DEPLOYMENT.md       # Production deployment guide
├── public/                 # Static assets
├── jest.config.js          # Jest testing configuration
├── jest.setup.js           # Jest setup and mocks
├── playwright.config.js    # Playwright E2E configuration
└── components.json         # shadcn/ui configuration
```

### Key Entry Points
- **Main Application**: `app/page.tsx` - Displays dual interface with mode switching
- **Step-by-Step Mode**: `src/components/ZKWorkflow.jsx` - Beginner-friendly guided workflow
- **Playground Mode**: `src/components/ZKPlayground.jsx` - Advanced development environment
- **ZK Service**: `src/services/zkService.js` - Core proof generation logic

## User Experience Features

### Keyboard Shortcuts
- `Ctrl+Enter` - Generate ZK Proof (global)
- `Ctrl+S` - Save Circuit (with download)
- `Ctrl+O` - Load Circuit (file import)
- `Ctrl+Shift+E` - Export Results
- `Ctrl+Shift+C` - Clear All
- `Escape` - Cancel/Close modals
- `F5` - Refresh application

### Auto-save & Privacy
- **Automatic Saving**: Circuit code and public inputs saved to localStorage
- **Privacy Protection**: Private inputs are never persisted
- **User Control**: Toggle auto-save functionality
- **Clear Options**: Easy data clearing for privacy

### Export & Import
- **Circuit Export**: Save circuit code and public inputs (private inputs excluded)
- **Result Export**: Complete proof results with metadata
- **Print Reports**: Professional PDF-ready proof verification reports
- **File Import**: Load previously saved circuits

## Error Handling & Reliability

### Error Boundaries
- **General Error Boundary**: Catches all React component errors with retry mechanisms
- **ZK Service Error Boundary**: Specialized handling for MidnightJS failures
- **Graceful Degradation**: Automatic fallback to demo mode when services fail
- **User-Friendly Messages**: Context-aware error messages with troubleshooting steps

### Service Reliability
- **Fallback Modes**: Production → Mock → Demo mode progression
- **Browser Compatibility**: Automatic WebAssembly and feature detection
- **Network Resilience**: Retry logic and timeout handling
- **Status Monitoring**: Real-time service status display

## Testing Strategy

### Unit Testing (Jest + React Testing Library)
- **Service Testing**: zkService functions, error handling, mock execution
- **Component Testing**: React component behavior and user interactions
- **Hook Testing**: Custom React hooks functionality
- **Coverage Target**: >90% for critical paths

### Integration Testing
- **Workflow Testing**: Complete proof generation workflows
- **UI Integration**: Component interaction testing
- **Error Scenarios**: Graceful degradation testing
- **Browser APIs**: localStorage, clipboard, file operations

### End-to-End Testing (Playwright)
- **Cross-Browser**: Chrome, Firefox, Safari, Mobile
- **User Journeys**: Complete application workflows
- **Responsive Testing**: Multiple viewport sizes
- **Keyboard Shortcuts**: Shortcut functionality verification

## Performance & Security

### Performance Optimizations
- **Code Splitting**: Lazy loading of ZK services
- **Caching**: Intelligent caching of compilation results
- **Debouncing**: Auto-save debouncing to prevent excessive writes
- **Bundle Analysis**: Webpack bundle analyzer integration

### Security Features
- **Input Validation**: Comprehensive JSON and circuit code validation
- **Privacy Protection**: Private inputs never logged or persisted
- **Error Sanitization**: Production error message sanitization
- **CSP Headers**: Content Security Policy configuration

## Documentation

### User Documentation
- **README.md**: Comprehensive project overview with quick start
- **USER_GUIDE.md**: Step-by-step user guide with examples and tutorials
- **API.md**: Complete API documentation with TypeScript interfaces

### Developer Documentation
- **DEPLOYMENT.md**: Production deployment guide for all platforms
- **Inline Documentation**: JSDoc comments for all major functions
- **Test Documentation**: Testing strategy and examples

## Development Workflow

### Getting Started
1. Clone repository and install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Run tests: `npm run test`
4. Build for production: `npm run build`

### Code Standards
- **ESLint**: Next.js recommended configuration with custom rules
- **TypeScript**: Strict mode for type safety
- **Testing**: Minimum 90% coverage for new features
- **Documentation**: Update docs for any public API changes

### Contribution Guidelines
- **Feature Development**: Create feature branch, implement with tests
- **Testing**: Ensure all tests pass and maintain coverage
- **Documentation**: Update relevant documentation
- **Error Handling**: Implement proper error boundaries and fallbacks

## Production Deployment

### Environment Variables
- `NODE_ENV` - Environment mode (development/production)
- `NEXT_PUBLIC_MIDNIGHT_ENDPOINT` - MidnightJS service endpoint
- `NEXT_PUBLIC_APP_URL` - Application URL for production

### Deployment Platforms
- **Vercel**: Zero-config deployment (recommended)
- **Netlify**: Git-based deployment
- **Docker**: Container deployment with multi-stage builds
- **AWS/GCP/Azure**: Cloud platform deployment guides

### Monitoring
- **Health Checks**: `/api/health` endpoint for service monitoring
- **Error Tracking**: Comprehensive error logging and reporting
- **Performance Monitoring**: Bundle size analysis and performance metrics

## Important Notes for Claude Code

1. **Always run tests**: Use `npm run test` and `npm run test:e2e` before making changes
2. **Maintain error boundaries**: Ensure proper error handling for all new features
3. **Preserve privacy**: Never log or persist private inputs
4. **Update documentation**: Keep docs synchronized with code changes
5. **Follow testing patterns**: Maintain >90% test coverage for critical paths
6. **Respect keyboard shortcuts**: Don't break existing shortcut functionality
7. **Test graceful degradation**: Ensure features work in demo mode