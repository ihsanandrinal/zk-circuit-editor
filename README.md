# ZK Circuit Editor & Proof Playground

A modern, browser-based zero-knowledge proof circuit editor and proof playground built with Next.js 15, React 19, and MidnightJS. This application provides an intuitive interface for writing, compiling, and generating zero-knowledge proofs using the Compact language.

![ZK Circuit Editor](https://via.placeholder.com/800x400/4f46e5/ffffff?text=ZK+Circuit+Editor)

## ✨ Features

### 🎯 Core Functionality
- **Circuit Editor**: Syntax-highlighted code editor for Compact language circuits
- **Dual Interface**: Step-by-step workflow and advanced playground modes
- **Real-time Validation**: Live JSON validation for circuit inputs
- **Proof Generation**: Complete ZK proof workflow (compile → generate → verify)
- **Service Status**: Real-time display of ZK service availability and mode

### 🛡️ Production-Ready Features
- **Error Boundaries**: Comprehensive error handling with graceful degradation
- **Keyboard Shortcuts**: Power-user shortcuts (Ctrl+Enter for proof generation)
- **Auto-save**: Automatic circuit preservation with privacy considerations
- **Export/Import**: Full circuit and result export/import functionality
- **Print Reports**: Professional, print-friendly proof verification reports
- **Responsive Design**: Mobile-first design that works on all devices

### 🧪 Quality Assurance
- **Unit Tests**: Comprehensive test coverage for service functions
- **Integration Tests**: End-to-end workflow testing with React Testing Library
- **E2E Tests**: Browser automation tests with Playwright
- **Type Safety**: TypeScript integration for better code reliability

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Modern browser with WebAssembly support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/zk-circuit-editor.git
   cd zk-circuit-editor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment** (optional)
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your MidnightJS endpoint if needed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📚 Usage Guide

### Step-by-Step Workflow Mode

Perfect for beginners or learning ZK concepts:

1. **Write Circuit**: Enter your Compact language circuit code
2. **Set Inputs**: Configure public and private inputs as JSON
3. **Compile**: Click "Compile Circuit" to validate and compile
4. **Generate**: Click "Generate Proof" to create ZK proof
5. **Verify**: Click "Verify Proof" to validate the proof

### Advanced Playground Mode

Full-featured environment for experienced users:

- **Real-time editing** with syntax validation
- **Example circuits** to get started quickly
- **Batch operations** for complete workflows
- **Export functionality** for sharing results

### Example Circuit

```compact
circuit AdditionCircuit {
  public fn main(a: u32, b: u32) -> u32 {
    a + b
  }
}
```

**Public Inputs:**
```json
{"a": 5, "b": 3}
```

**Expected Result:** `8`

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Ctrl+Enter` | Generate ZK Proof | Global |
| `Ctrl+S` | Save Circuit | Global |
| `Ctrl+O` | Load Circuit | Global |
| `Ctrl+Shift+E` | Export Results | When available |
| `Ctrl+Shift+C` | Clear All | Global |
| `Escape` | Cancel/Close | Modal dialogs |
| `F5` | Refresh | Global |

## 🏗️ Architecture

### Project Structure

```
zk-circuit-editor/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles and Tailwind
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page with mode switching
├── src/
│   ├── components/        # React components
│   │   ├── CodeEditor.jsx         # Circuit code editor
│   │   ├── InputPanel.jsx         # Input configuration
│   │   ├── OutputPanel.jsx        # Result display
│   │   ├── ZKPlayground.jsx       # Advanced playground
│   │   ├── ZKWorkflow.jsx         # Step-by-step mode
│   │   ├── ErrorBoundary.jsx      # Error handling
│   │   ├── PrintableReport.jsx    # Print formatting
│   │   └── __tests__/             # Component tests
│   ├── services/          # Business logic
│   │   ├── zkService.js           # Core ZK service
│   │   ├── zkServiceWrapper.js    # Browser wrapper
│   │   ├── globalSetup.js         # MidnightJS setup
│   │   └── __tests__/             # Service tests
│   └── hooks/             # Custom React hooks
│       └── useKeyboardShortcuts.js
├── e2e/                   # End-to-end tests
├── jest.config.js         # Unit test configuration
├── playwright.config.js   # E2E test configuration
└── tailwind.config.js     # Styling configuration
```

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19 with Hooks
- **Styling**: Tailwind CSS with shadcn/ui components
- **ZK Library**: MidnightJS with Compact language support
- **Testing**: Jest + React Testing Library + Playwright
- **Type Checking**: TypeScript with strict mode
- **Icons**: Heroicons

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run test:e2e     # Run end-to-end tests
```

### Environment Variables

Create `.env.local` for development:

```bash
# Optional: Custom MidnightJS endpoint
REACT_APP_MIDNIGHT_ENDPOINT=http://localhost:8080

# Development flags
NODE_ENV=development
NEXT_PUBLIC_DEV_MODE=true
```

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

- **Service Tests**: zkService functions, error handling, mock execution
- **Component Tests**: React component behavior, user interactions
- **Hook Tests**: Custom React hooks functionality

### Integration Tests

```bash
npm run test -- --testPathPattern=integration
```

- **Workflow Tests**: Complete proof generation workflows
- **UI Integration**: Component interaction testing
- **Error Scenarios**: Graceful degradation testing

### End-to-End Tests

```bash
npm run test:e2e
```

- **Browser Testing**: Chrome, Firefox, Safari, Mobile
- **User Journeys**: Complete application workflows
- **Responsive Testing**: Multiple viewport sizes

### Coverage Reports

```bash
npm run test:coverage
```

Target coverage: **>90%** for critical paths

## 📖 API Documentation

### ZkService API

#### Core Methods

##### `generateProof(compactCode, publicInputs, privateInputs)`

Generates a complete ZK proof including compilation, proof generation, and verification.

**Parameters:**
- `compactCode` (string): Circuit code in Compact language
- `publicInputs` (object): Public input values as JSON object
- `privateInputs` (object): Private input values as JSON object

**Returns:** Promise\<ProofResult\>

```javascript
const result = await generateProof(
  'circuit Test { public fn main(a: u32) -> u32 { a * 2 } }',
  { a: 5 },
  {}
);

console.log(result.success); // true
console.log(result.result.proofData); // Proof data
```

##### `compileCircuit(compactCode)`

Compiles Compact language code into ZKIR (Zero-Knowledge Intermediate Representation).

**Parameters:**
- `compactCode` (string): Circuit code to compile

**Returns:** Promise\<CompileResult\>

##### `verifyProof(proof)`

Verifies a generated proof for validity.

**Parameters:**
- `proof` (object): Proof object to verify

**Returns:** Promise\<VerifyResult\>

##### `getServiceStatus()`

Returns current service status and configuration.

**Returns:** Promise\<ServiceStatus\>

```javascript
const status = await getServiceStatus();
console.log(status.mode); // 'production' | 'mock' | 'error'
```

## 🚢 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t zk-circuit-editor .
docker run -p 3000:3000 zk-circuit-editor
```

### Environment Setup

#### Production Environment Variables

```bash
NODE_ENV=production
NEXT_PUBLIC_MIDNIGHT_ENDPOINT=https://your-midnight-endpoint.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🔒 Security Considerations

### Privacy Features

1. **Private Input Protection**
   - Private inputs are never logged or persisted
   - Auto-save excludes private inputs
   - Export functions provide privacy options

2. **Local Storage Safety**
   - Only non-sensitive data is cached
   - Clear storage options available
   - No authentication tokens stored

3. **Error Handling**
   - Sanitized error messages in production
   - No sensitive data in error logs
   - Graceful degradation for security failures

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `npm install`
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open pull request

### Code Standards

- **ESLint**: Follow Next.js recommended configuration
- **Prettier**: Use for consistent code formatting
- **TypeScript**: Type all new code where applicable
- **Testing**: Maintain >90% coverage for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & FAQ

### Common Issues

#### "WebAssembly not supported"
**Solution**: Use a modern browser (Chrome 57+, Firefox 52+, Safari 11+)

#### "Service initialization failed"
**Solution**: Check network connection and MidnightJS endpoint configuration

#### "Proof generation timeout"
**Solution**: Reduce circuit complexity or check network stability

### Getting Help

1. **Documentation**: Check this README and inline code documentation
2. **Issues**: Open GitHub issue with minimal reproduction case
3. **Discussions**: Use GitHub Discussions for questions and ideas

---

**Made with ❤️ for the Zero-Knowledge community**

*Contributing to the future of privacy-preserving computation*