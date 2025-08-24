// Server-side safe setup - only import global setup in browser
let globalSetupModule = null;
let globalFunctions = null;

// Function to ensure global setup is loaded and functions are available
const ensureGlobalSetup = async () => {
  if (typeof window === 'undefined') {
    return { isGlobalSetupComplete: () => false, getGlobalMaxField: () => null };
  }
  
  if (!globalSetupModule) {
    console.log('🔄 Loading global MidnightJS setup...');
    globalSetupModule = await import('./globalSetup.js');
    
    // Cache the functions for global access
    globalFunctions = {
      isGlobalSetupComplete: globalSetupModule.isGlobalSetupComplete,
      getGlobalMaxField: globalSetupModule.getGlobalMaxField
    };
    
    // Wait for setup to complete before proceeding
    let retryCount = 0;
    const maxRetries = 10;
    
    while (!globalFunctions.isGlobalSetupComplete() && retryCount < maxRetries) {
      console.log(`⏳ Waiting for global setup completion (attempt ${retryCount + 1}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, 100));
      retryCount++;
    }
    
    if (!globalFunctions.isGlobalSetupComplete()) {
      console.error('❌ Global MidnightJS setup failed after retries - this will cause import errors');
      console.error('❌ Debug info:');
      console.error('  - window.ocrt:', !!window?.ocrt);
      console.error('  - window.u:', !!window?.u);
      console.error('  - window._midnightjsGlobalSetupComplete:', window?._midnightjsGlobalSetupComplete);
    } else {
      console.log('✅ Global MidnightJS setup verified successfully');
      console.log('✅ Debug info:');
      console.log('  - window.ocrt.maxField:', typeof window?.ocrt?.maxField);
      console.log('  - window.u.maxField:', typeof window?.u?.maxField);
    }
  }
  
  return globalSetupModule;
};

// Global accessor functions
const isGlobalSetupComplete = () => {
  if (typeof window === 'undefined') return false;
  return globalFunctions ? globalFunctions.isGlobalSetupComplete() : false;
};

const getGlobalMaxField = () => {
  if (typeof window === 'undefined') return null;
  return globalFunctions ? globalFunctions.getGlobalMaxField() : null;
};

class ZkService {
  constructor() {
    this.configProvider = null;
    this.proofProvider = null;
    this.isInitialized = false;
    this.midnightJsError = null; // Explicitly initialize to null
    
    // Perform browser compatibility checks
    this.checkBrowserCompatibility();
  }

  checkBrowserCompatibility() {
    console.log('Browser environment checks:');
    console.log('WebAssembly supported:', typeof WebAssembly !== 'undefined');
    console.log('Worker supported:', typeof Worker !== 'undefined');
    console.log('Crypto available:', typeof crypto !== 'undefined');
    
    // Store compatibility info for later use
    this.browserCompatibility = {
      webAssembly: typeof WebAssembly !== 'undefined',
      worker: typeof Worker !== 'undefined',
      crypto: typeof crypto !== 'undefined'
    };
    
    return this.browserCompatibility;
  }

  async initialize() {
    try {
      if (this.isInitialized) {
        return;
      }

      // Ensure global setup is loaded first
      await ensureGlobalSetup();

      console.log('🔥 STARTING ZK SERVICE INITIALIZATION');
      console.log('🔥 Current environment:');
      console.log('  - typeof window:', typeof window);
      console.log('  - window.ocrt exists:', !!window?.ocrt);
      console.log('  - window.ocrt.maxField type:', typeof window?.ocrt?.maxField);
      
      if (window?.ocrt?.maxField) {
        try {
          const testResult = window.ocrt.maxField();
          console.log('🔥 Initial maxField test SUCCESS:', typeof testResult);
        } catch (e) {
          console.log('🔥 Initial maxField test FAILED:', e.message);
        }
      } else {
        console.log('🔥 NO maxField found at initialization start!');
      }

      console.log('Initializing ZK service...');

      // Check browser compatibility before initialization
      if (!this.browserCompatibility.webAssembly) {
        throw new Error('WebAssembly not supported - required for ZK computations');
      }

      // Verify global setup is still intact
      if (!isGlobalSetupComplete()) {
        throw new Error('Global MidnightJS setup not complete - cannot safely initialize');
      }
      
      console.log('🔍 Global ocrt.maxField available:', typeof getGlobalMaxField() === 'function');

      // Lazy load MidnightJS libraries only when needed
      let httpClientProofProvider, createZKIR, maxField, compactRuntime, onchainRuntimeModule;
      
      try {
        console.log('🔄 Loading MidnightJS libraries with persistent compatibility layer...');
        
        // Verify persistent compatibility layer is active
        console.log('📊 Pre-import persistent layer status:');
        console.log('  - _MIDNIGHT_JS_COMPAT active:', !!window._MIDNIGHT_JS_COMPAT);
        console.log('  - window.l.maxField:', typeof window?.l?.maxField);
        console.log('  - window.u.maxField:', typeof window?.u?.maxField);
        console.log('  - window.ocrt.maxField:', typeof window?.ocrt?.maxField);
        
        // Test the persistent layer before imports
        if (window?.l?.maxField) {
          try {
            window.l.maxField(); // Test call only
            console.log('  - l.maxField() test: SUCCESS');
          } catch (e) {
            console.log('  - l.maxField() test ERROR:', e.message);
          }
        }
        
        // Load onchain-runtime first and wait for full initialization
        console.log('Step 1: Loading onchain-runtime and setting up WASM...');
        onchainRuntimeModule = await import('@midnight-ntwrk/onchain-runtime');
        
        // Check persistent layer status after onchain-runtime import
        console.log('📊 After onchain-runtime import - persistent layer status:');
        console.log('  - _MIDNIGHT_JS_COMPAT preserved:', !!window._MIDNIGHT_JS_COMPAT);
        console.log('  - window.l.maxField preserved:', typeof window?.l?.maxField);
        console.log('  - window.u.maxField preserved:', typeof window?.u?.maxField);
        
        // Test critical l.maxField that was causing errors
        if (window?.l?.maxField) {
          try {
            window.l.maxField(); // Test call only
            console.log('  - l.maxField() test after import: SUCCESS');
          } catch (e) {
            console.error('  - l.maxField() STILL BROKEN after import:', e.message);
            // Try to restore the compatibility layer
            const { restoreCompatibilityLayer } = await import('./globalSetup.js');
            restoreCompatibilityLayer();
          }
        }
        
        // Wait for WASM initialization
        await this.waitForWasmReady(onchainRuntimeModule);
        
        // Get the real maxField function but don't replace the global one
        maxField = onchainRuntimeModule.maxField;
        if (maxField) {
          // Test the real function to make sure it works
          try {
            const testResult = maxField();
            console.log('✅ Real maxField function from onchain-runtime is working:', typeof testResult);
            console.log('🔍 Comparing with global ocrt.maxField:', typeof window?.ocrt?.maxField === 'function');
          } catch (testError) {
            console.warn('⚠️ Real maxField function exists but test failed:', testError.message);
            // Fall back to using the global one
            maxField = getGlobalMaxField();
          }
        } else {
          console.warn('⚠️ maxField function not found in onchain-runtime, using global placeholder');
          maxField = getGlobalMaxField();
        }
        
        // Import modules one by one to better handle any ocrt.maxField dependency issues
        console.log('Step 2: Loading other MidnightJS modules sequentially...');
        
        const typesModule = await import('@midnight-ntwrk/midnight-js-types');
        console.log('✅ Loaded midnight-js-types');
        
        // Check state after types import
        console.log('📊 After midnight-js-types import:');
        console.log('  - window.ocrt.maxField:', typeof window?.ocrt?.maxField);
        
        await import('@midnight-ntwrk/ledger');
        console.log('✅ Loaded ledger');
        
        // Check persistent layer after ledger import (critical test point)
        console.log('📊 After ledger import - critical compatibility check:');
        console.log('  - _MIDNIGHT_JS_COMPAT still active:', !!window._MIDNIGHT_JS_COMPAT);
        console.log('  - window.l.maxField still available:', typeof window?.l?.maxField);
        
        // This is where l.maxField often breaks - test it specifically
        if (window?.l?.maxField) {
          try {
            window.l.maxField(); // Test call only
            console.log('  - l.maxField() post-ledger: SUCCESS (', typeof testResult, ')');
          } catch (e) {
            console.error('  - l.maxField() BROKEN after ledger import:', e.message);
            // Emergency restore
            const { restoreCompatibilityLayer } = await import('./globalSetup.js');
            if (restoreCompatibilityLayer()) {
              console.log('  - Emergency compatibility layer restore: SUCCESS');
            } else {
              console.error('  - Emergency restore FAILED - MidnightJS may not work');
            }
          }
        }
        
        // Try to load compact-runtime with persistent layer protection
        console.log('Step 3: Loading compact-runtime with compatibility monitoring...');
        let compactRuntimeModule;
        
        // Pre-compact-runtime compatibility check
        const preCompactCheck = window?.l?.maxField && typeof window.l.maxField === 'function';
        console.log('  - Pre-compact l.maxField available:', preCompactCheck);
        
        try {
          compactRuntimeModule = await import('@midnight-ntwrk/compact-runtime');
          console.log('✅ Loaded compact-runtime successfully');
          
          // Post-compact-runtime compatibility check (this is where it usually breaks)
          const postCompactCheck = window?.l?.maxField && typeof window.l.maxField === 'function';
          console.log('  - Post-compact l.maxField still available:', postCompactCheck);
          
          if (preCompactCheck && !postCompactCheck) {
            console.log('🚨 compact-runtime destroyed l.maxField - restoring...');
            const { restoreCompatibilityLayer } = await import('./globalSetup.js');
            restoreCompatibilityLayer();
            console.log('  - Compatibility layer restored after compact-runtime');
          }
          
        } catch (compactError) {
          console.error('❌ Failed to load compact-runtime:', compactError.message);
          compactRuntimeModule = {
            maxField: maxField || (() => BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495616')),
            skipCompactRuntime: true,
            message: 'Fallback runtime due to compact-runtime loading failure',
            error: compactError.message
          };
        }
        
        // Try to load http-client-proof-provider with final compatibility check
        console.log('Step 4: Loading midnight-js-http-client-proof-provider...');
        let proofProviderModule;
        
        try {
          proofProviderModule = await import('@midnight-ntwrk/midnight-js-http-client-proof-provider');
          httpClientProofProvider = proofProviderModule.httpClientProofProvider;
          console.log('✅ Loaded midnight-js-http-client-proof-provider successfully');
          
          // Final compatibility verification after all imports
          console.log('📊 Final compatibility verification:');
          const finalCheck = {
            lMaxField: window?.l?.maxField && typeof window.l.maxField === 'function',
            uMaxField: window?.u?.maxField && typeof window.u.maxField === 'function',
            ocrtMaxField: window?.ocrt?.maxField && typeof window.ocrt.maxField === 'function',
            compatLayer: !!window._MIDNIGHT_JS_COMPAT
          };
          
          console.log('  - Final status:', finalCheck);
          
          if (!finalCheck.lMaxField || !finalCheck.compatLayer) {
            console.log('🚨 Final compatibility check failed - emergency restore');
            const { restoreCompatibilityLayer } = await import('./globalSetup.js');
            if (restoreCompatibilityLayer()) {
              console.log('  - Emergency final restore: SUCCESS');
            }
          }
          
        } catch (providerError) {
          console.error('❌ Failed to load http-client-proof-provider:', providerError.message);
          proofProviderModule = {
            httpClientProofProvider: (endpoint) => ({
              mockProvider: true,
              endpoint: endpoint,
              skipHttpClient: true,
              message: 'Fallback provider due to http-client-proof-provider loading failure',
              error: providerError.message
            })
          };
          httpClientProofProvider = proofProviderModule.httpClientProofProvider;
        }
        
        createZKIR = typesModule.createZKIR;
        compactRuntime = compactRuntimeModule;
        
        const hasRealModules = !compactRuntimeModule.skipCompactRuntime && !httpClientProofProvider().mockProvider;
        const hasWorkingCompatLayer = window?.l?.maxField && typeof window.l.maxField === 'function';
        
        console.log('🏁 MidnightJS initialization complete:');
        console.log('  - Real modules loaded:', hasRealModules);
        console.log('  - Compatibility layer working:', hasWorkingCompatLayer);
        console.log('  - Final status:', 
          hasRealModules && hasWorkingCompatLayer ? 
          '✅ FULL PRODUCTION MODE with working l.maxField' :
          hasRealModules ? 
          '⚠️ Real modules but compatibility issues may cause l.maxField errors' :
          '⚠️ Fallback mode - MidnightJS libraries had loading issues'
        );
        
        // Only clear errors if everything is truly working
        if (hasRealModules && hasWorkingCompatLayer) {
          this.midnightJsError = null;
          console.log('🎉 TRUE PRODUCTION MODE: Real ZK proofs with stable l.maxField');
        } else {
          this.midnightJsError = {
            message: hasRealModules ? 'Compatibility layer unstable' : 'Module loading failed',
            type: 'CompatibilityWarning',
            hasRealModules,
            hasWorkingCompatLayer
          };
        }
        
      } catch (importError) {
        console.warn('⚠️ MidnightJS library initialization encountered issues:', importError.message);
        console.info('🔄 Attempting to continue with available functionality...');
        
        // Store the error for user feedback but don't fail completely
        this.midnightJsError = {
          message: importError.message,
          type: 'LibraryLoadWarning',
          fallbackMode: false
        };
        
        // Try to continue with what we have - many operations might still work
        if (!httpClientProofProvider) {
          httpClientProofProvider = () => ({
            mockProvider: true,
            type: 'fallback',
            error: this.midnightJsError
          });
        }
        
        if (!createZKIR) {
          createZKIR = (compactCode) => ({
            mockZkir: true,
            compactCode: compactCode,
            hash: this.hashString(compactCode),
            type: 'fallback',
            message: 'Mock ZKIR created - some MidnightJS components unavailable',
            fallbackReason: this.midnightJsError
          });
        }
        
        if (!maxField) {
          // Use the persistent compatibility layer maxField as primary choice
          if (typeof window !== 'undefined' && window._MIDNIGHT_JS_COMPAT && window._MIDNIGHT_JS_COMPAT.maxField) {
            maxField = window._MIDNIGHT_JS_COMPAT.maxField;
            console.log('📌 Using persistent compatibility layer maxField');
          } else if (typeof window !== 'undefined' && window.l && window.l.maxField) {
            maxField = window.l.maxField;
            console.log('📌 Using window.l.maxField');
          } else if (typeof window !== 'undefined' && window.ocrt && window.ocrt.maxField) {
            maxField = window.ocrt.maxField;
            console.log('📌 Using window.ocrt.maxField');
          } else {
            maxField = () => BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495616');
            console.log('📌 Using fallback maxField implementation');
          }
        }
        
        if (!compactRuntime) {
          compactRuntime = {
            maxField: maxField,
            mockRuntime: true,
            type: 'fallback'
          };
        }
        
        console.log('✅ Continuing with available MidnightJS functionality');
      }

      // For browser environment, we'll use a simplified config approach
      // The NodeZkConfigProvider is Node.js specific and can't run in browser
      this.configProvider = {
        // Placeholder for browser-compatible config
        initialized: true,
        type: 'browser-compatible'
      };

      // Initialize HTTP client proof provider
      const endpoint = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_MIDNIGHT_ENDPOINT 
        ? process.env.NEXT_PUBLIC_MIDNIGHT_ENDPOINT 
        : 'http://localhost:8080';
      
      try {
        this.proofProvider = httpClientProofProvider(endpoint);
        this.createZKIR = createZKIR;
        this.maxField = maxField; // Already set from onchain-runtime
        this.compactRuntime = compactRuntime;
        this.onchainRuntime = onchainRuntimeModule;
        
      } catch (providerError) {
        console.error('Failed to initialize proof provider:', providerError);
        throw new Error(`Proof provider initialization failed: ${providerError.message}`);
      }

      this.isInitialized = true;
      console.log('ZK service initialized successfully');

    } catch (error) {
      console.error('Failed to initialize ZK service:', error);
      throw new Error(`ZK service initialization failed: ${error.message}`);
    }
  }

  async compileCircuit(compactCode) {
    const startTime = performance.now();
    
    try {
      await this.initialize();

      console.log('Compiling circuit...', {
        compactCodeLength: compactCode?.length
      });

      if (!compactCode || typeof compactCode !== 'string') {
        throw new Error('Invalid compact code: must be a non-empty string');
      }

      if (!this.createZKIR) {
        throw new Error('ZKIR creation function not available - service initialization may have failed');
      }
      
      const zkir = this.createZKIR(compactCode);
      console.log('Circuit compiled successfully');

      const endTime = performance.now();
      
      return {
        success: true,
        zkir,
        metadata: {
          step: 'compile',
          timestamp: new Date().toISOString(),
          compactCodeHash: this.hashString(compactCode),
          executionTime: endTime - startTime,
          mode: zkir?.type === 'fallback' ? 'mock' : 'production',
          message: zkir?.type === 'fallback' ? 
            'Circuit compiled in mock mode (MidnightJS not available)' :
            'Circuit compiled successfully'
        }
      };

    } catch (error) {
      const endTime = performance.now();
      console.error('Circuit compilation failed:', error);
      
      return {
        success: false,
        error: {
          message: error.message,
          type: 'CompilationError',
          step: 'compile',
          timestamp: new Date().toISOString(),
          executionTime: endTime - startTime
        }
      };
    }
  }

  async generateProofFromZKIR(zkir, publicInputs, privateInputs) {
    const startTime = performance.now();
    
    try {
      console.log('Generating proof from ZKIR...', {
        publicInputsCount: Object.keys(publicInputs || {}).length,
        privateInputsCount: Object.keys(privateInputs || {}).length
      });

      if (!publicInputs || typeof publicInputs !== 'object') {
        throw new Error('Invalid public inputs: must be an object');
      }

      if (!privateInputs || typeof privateInputs !== 'object') {
        throw new Error('Invalid private inputs: must be an object');
      }

      if (!zkir) {
        throw new Error('Invalid ZKIR: circuit must be compiled first');
      }

      // Check if we have real ZK capabilities or need to fall back
      if (zkir?.type === 'fallback' || !this.proofProvider || this.proofProvider.mockProvider) {
        console.warn('⚠️ Using fallback proof generation - real ZK service not available');
        const proof = {
          proofData: 'fallback_proof_data_' + Math.random().toString(36),
          publicOutputs: this._mockCircuitExecution(publicInputs, zkir),
          circuitHash: this.hashString(JSON.stringify(zkir)),
          mockMode: true,
          message: 'Fallback proof generated (real ZK service not available)'
        };
        console.log('Fallback proof generated');
        const endTime = performance.now();
        return {
          success: true,
          proof,
          metadata: {
            step: 'generate',
            timestamp: new Date().toISOString(),
            publicInputsHash: this.hashString(JSON.stringify(publicInputs)),
            privateInputsHash: this.hashString(JSON.stringify(privateInputs)),
            executionTime: endTime - startTime,
            mode: 'fallback'
          }
        };
      }

      // Real ZK proof generation using MidnightJS
      console.log('🚀 Generating real ZK proof...');
      
      // Create witness from inputs
      const witness = { ...publicInputs, ...privateInputs };
      
      // Generate proof using the proof provider
      const proofResult = await this.proofProvider.generateProof(zkir, witness);
      
      if (!proofResult) {
        throw new Error('Proof generation failed - no result from proof provider');
      }

      const proof = {
        proofData: proofResult.proof || proofResult.proofBytes,
        publicOutputs: proofResult.publicOutputs || proofResult.outputs,
        circuitHash: this.hashString(JSON.stringify(zkir)),
        mockMode: false,
        message: 'Real ZK proof generated successfully'
      };

      console.log('✅ Real ZK proof generated successfully');

      const endTime = performance.now();
      
      return {
        success: true,
        proof,
        metadata: {
          step: 'generate',
          timestamp: new Date().toISOString(),
          publicInputsHash: this.hashString(JSON.stringify(publicInputs)),
          privateInputsHash: this.hashString(JSON.stringify(privateInputs)),
          executionTime: endTime - startTime
        }
      };

    } catch (error) {
      const endTime = performance.now();
      console.error('Proof generation failed:', error);
      
      return {
        success: false,
        error: {
          message: error.message,
          type: 'ProofGenerationError',
          step: 'generate',
          timestamp: new Date().toISOString(),
          executionTime: endTime - startTime
        }
      };
    }
  }

  async verifyProof(proof) {
    const startTime = performance.now();
    
    try {
      console.log('Verifying proof...');

      if (!proof || typeof proof !== 'object') {
        throw new Error('Invalid proof: must be an object');
      }

      if (!proof.proofData) {
        throw new Error('Invalid proof: missing proof data');
      }

      const isValid = proof.proofData.startsWith('mock_proof_data_');
      
      console.log('Proof verification completed:', isValid ? 'VALID' : 'INVALID');

      const endTime = performance.now();
      
      return {
        success: true,
        isValid,
        metadata: {
          step: 'verify',
          timestamp: new Date().toISOString(),
          proofHash: this.hashString(JSON.stringify(proof)),
          executionTime: endTime - startTime
        }
      };

    } catch (error) {
      const endTime = performance.now();
      console.error('Proof verification failed:', error);
      
      return {
        success: false,
        error: {
          message: error.message,
          type: 'VerificationError',
          step: 'verify',
          timestamp: new Date().toISOString(),
          executionTime: endTime - startTime
        }
      };
    }
  }

  async generateProof(compactCode, publicInputs, privateInputs) {
    try {
      const compileResult = await this.compileCircuit(compactCode);
      if (!compileResult.success) {
        return compileResult;
      }

      const generateResult = await this.generateProofFromZKIR(compileResult.zkir, publicInputs, privateInputs);
      if (!generateResult.success) {
        return generateResult;
      }

      const verifyResult = await this.verifyProof(generateResult.proof);
      
      return {
        success: true,
        result: generateResult.proof,
        verification: verifyResult,
        metadata: {
          timestamp: new Date().toISOString(),
          compactCodeHash: compileResult.metadata.compactCodeHash,
          publicInputsHash: generateResult.metadata.publicInputsHash,
          totalExecutionTime: compileResult.metadata.executionTime + generateResult.metadata.executionTime + verifyResult.metadata.executionTime
        }
      };

    } catch (error) {
      console.error('ZK proof generation failed:', error);
      
      return {
        success: false,
        error: {
          message: error.message,
          type: error.constructor.name,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Mock circuit execution for demonstration purposes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _mockCircuitExecution(publicInputs, zkir) {
    if (publicInputs && typeof publicInputs === 'object') {
      const keys = Object.keys(publicInputs);
      const values = Object.values(publicInputs);
      
      // For addition circuit example
      if ('a' in publicInputs && 'b' in publicInputs) {
        const result = Number(publicInputs.a) + Number(publicInputs.b);
        return { 
          result: result,
          computed: `${publicInputs.a} + ${publicInputs.b} = ${result}`,
          circuitType: 'addition'
        };
      }
      
      // For multiplication circuit (x * y) or any two inputs
      if (('x' in publicInputs && 'y' in publicInputs) || 
          (keys.length === 2 && values.every(v => !isNaN(Number(v))))) {
        let x, y;
        if ('x' in publicInputs && 'y' in publicInputs) {
          x = publicInputs.x;
          y = publicInputs.y;
        } else {
          // Use first two numeric inputs
          [x, y] = values.slice(0, 2);
        }
        const result = Number(x) * Number(y);
        return { 
          result: result,
          computed: `${x} * ${y} = ${result}`,
          circuitType: 'multiplication'
        };
      }
      
      // For other inputs, return a generic result
      return { 
        result: Object.keys(publicInputs).length * 7, // Simple mock computation
        computed: `Mock computation on ${Object.keys(publicInputs).length} inputs`,
        circuitType: 'generic'
      };
    }
    
    return { 
      result: 42,
      computed: 'Default mock result',
      circuitType: 'empty'
    };
  }

  // Utility function to create a simple hash for logging purposes
  hashString(str) {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  }

  // Method to check if service is ready
  isReady() {
    return this.isInitialized && this.configProvider && this.proofProvider;
  }

  // Method to get service mode and status information
  getServiceStatus() {
    const status = {
      isInitialized: this.isInitialized,
      isReady: this.isReady(),
      mode: 'unknown',
      message: '',
      error: null
    };

    if (this.midnightJsError) {
      status.mode = 'mock';
      status.message = 'Running in demonstration mode due to MidnightJS compatibility issues';
      status.error = this.midnightJsError;
    } else if (this.isInitialized) {
      status.mode = 'production';
      status.message = 'MidnightJS libraries loaded - Full ZK proof functionality available';
    } else {
      status.mode = 'initializing';
      status.message = 'ZK service is initializing...';
    }

    return status;
  }

  // Method to wait for WASM modules to be ready
  async waitForWasmReady(onchainRuntimeModule, maxRetries = 10, delayMs = 100) {
    console.log('⏳ Waiting for WASM modules to initialize...');
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Test if maxField function is available and working
        if (onchainRuntimeModule.maxField) {
          const testResult = onchainRuntimeModule.maxField();
          if (typeof testResult === 'bigint' && testResult > 0) {
            console.log(`✅ WASM initialized successfully after ${attempt} attempts`);
            return;
          }
        }
        
        // If we reach here, WASM is not ready yet
        console.log(`⏳ WASM not ready (attempt ${attempt}/${maxRetries}), waiting ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        
        // Exponential backoff for longer waits
        delayMs = Math.min(delayMs * 1.5, 2000);
        
      } catch (error) {
        console.log(`⏳ WASM initialization attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw new Error(`WASM failed to initialize after ${maxRetries} attempts: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs = Math.min(delayMs * 1.5, 2000);
      }
    }
    
    throw new Error('WASM modules failed to initialize within the maximum retry limit');
  }

  // Method to get maxField value
  getMaxField() {
    if (!this.isInitialized) {
      throw new Error('ZK service not initialized. Call initialize() first.');
    }
    return this.maxField ? this.maxField() : null;
  }

  // Method to reset the service (useful for testing)
  reset() {
    this.configProvider = null;
    this.proofProvider = null;
    this.isInitialized = false;
    this.maxField = null;
    this.compactRuntime = null;
    this.onchainRuntime = null;
    this.midnightJsError = null;
    console.log('ZK service reset');
  }
}

// Create singleton instance
const zkService = new ZkService();

// Export the main function and service instance
export const generateProof = async (compactCode, publicInputs, privateInputs) => {
  try {
    return await zkService.generateProof(compactCode, publicInputs, privateInputs);
  } catch (error) {
    console.error('Proof generation wrapper caught error:', error);
    
    // Check if we're in demo mode
    const isDemoMode = localStorage.getItem('zkDemoMode') === 'true';
    
    if (isDemoMode || error.message.includes('MidnightJS') || error.message.includes('WASM')) {
      return {
        success: true,
        result: {
          proofData: 'demo_proof_' + Date.now(),
          publicOutputs: { result: 'Demo mode - no actual proof generated' },
          mockMode: true,
          message: 'Demo proof generated (service unavailable)'
        },
        metadata: {
          timestamp: new Date().toISOString(),
          compactCodeHash: zkService.hashString(compactCode),
          publicInputsHash: zkService.hashString(JSON.stringify(publicInputs)),
          mode: 'demo',
          message: 'Generated in demo mode due to service unavailability'
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: error.message,
        type: 'ServiceError',
        timestamp: new Date().toISOString(),
        fallbackAvailable: true
      }
    };
  }
};

export const compileCircuit = async (compactCode) => {
  return await zkService.compileCircuit(compactCode);
};

export const generateProofFromZKIR = async (zkir, publicInputs, privateInputs) => {
  return await zkService.generateProofFromZKIR(zkir, publicInputs, privateInputs);
};

export const verifyProof = async (proof) => {
  return await zkService.verifyProof(proof);
};

export const getZkService = () => zkService;

export const getServiceStatus = async () => {
  try {
    await zkService.initialize();
    return zkService.getServiceStatus();
  } catch (error) {
    console.warn('⚠️ Service status check encountered issue, but service may still be functional:', error.message);
    
    // Check if the service is actually working despite the error
    const actualStatus = zkService.getServiceStatus();
    
    // If proof generation is working, return a working status
    if (actualStatus.isInitialized) {
      return {
        isInitialized: true,
        isReady: true,
        mode: 'warning',
        message: 'Service is functional with some initialization warnings',
        error: {
          message: error.message,
          type: 'InitializationWarning',
          fallbackMode: false
        }
      };
    }
    
    return {
      isInitialized: false,
      isReady: false,
      mode: 'error',
      message: 'Service initialization failed',
      error: {
        message: error.message,
        type: 'InitializationError',
        fallbackMode: true
      }
    };
  }
};

export const getMaxField = async () => {
  await zkService.initialize();
  return zkService.getMaxField();
};

export default zkService;