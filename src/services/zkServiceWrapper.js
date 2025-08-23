'use client';

// Browser-safe wrapper for ZK service that handles dynamic imports gracefully

class ZkServiceWrapper {
  constructor() {
    this.isInitialized = false;
    this.initializationPromise = null;
    this.zkService = null;
  }

  async initialize() {
    // Prevent multiple initialization attempts
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._doInitialize();
    return this.initializationPromise;
  }

  async _doInitialize() {
    try {
      // Only run in browser environment
      if (typeof window === 'undefined') {
        throw new Error('ZK service can only be initialized in browser environment');
      }

      console.log('Initializing ZK service wrapper...');

      // Check browser compatibility
      const compatibility = this._checkBrowserCompatibility();
      if (!compatibility.webAssembly) {
        throw new Error('WebAssembly not supported - required for ZK computations');
      }

      // Mock implementation for now to test the UI without MidnightJS complexity
      this.zkService = {
        generateProof: async (compactCode, publicInputs, privateInputs) => {
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          console.log('Mock ZK proof generation:', {
            compactCode: compactCode?.substring(0, 50) + '...',
            publicInputs,
            privateInputs
          });

          // Return a mock successful result
          return {
            success: true,
            result: {
              mockProof: true,
              circuitHash: this._hashString(compactCode),
              publicOutputs: this._mockCircuitExecution(publicInputs),
              message: 'Mock ZK proof generated successfully. MidnightJS integration pending.'
            },
            metadata: {
              timestamp: new Date().toISOString(),
              compactCodeHash: this._hashString(compactCode),
              publicInputsHash: this._hashString(JSON.stringify(publicInputs)),
              browserInfo: {
                userAgent: navigator.userAgent.substring(0, 100),
                ...compatibility
              }
            }
          };
        }
      };

      this.isInitialized = true;
      console.log('ZK service wrapper initialized successfully (mock mode)');

    } catch (error) {
      console.error('Failed to initialize ZK service wrapper:', error);
      throw error;
    }
  }

  _checkBrowserCompatibility() {
    const compatibility = {
      webAssembly: typeof WebAssembly !== 'undefined',
      worker: typeof Worker !== 'undefined',
      crypto: typeof crypto !== 'undefined',
      dynamicImports: true // Dynamic imports are supported in modern browsers
    };
    
    console.log('Browser compatibility:', compatibility);
    return compatibility;
  }

  // Mock circuit execution for demonstration
  _mockCircuitExecution(publicInputs) {
    if (publicInputs && typeof publicInputs === 'object') {
      // Simple mock: if we see a and b, return their sum
      if ('a' in publicInputs && 'b' in publicInputs) {
        return { result: Number(publicInputs.a) + Number(publicInputs.b) };
      }
    }
    return { result: 42 }; // Default mock result
  }

  _hashString(str) {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  }

  async generateProof(compactCode, publicInputs, privateInputs) {
    try {
      await this.initialize();
      
      if (!this.zkService) {
        throw new Error('ZK service not properly initialized');
      }

      // Input validation
      if (!compactCode || typeof compactCode !== 'string') {
        throw new Error('Invalid compact code: must be a non-empty string');
      }

      if (!publicInputs || typeof publicInputs !== 'object') {
        throw new Error('Invalid public inputs: must be an object');
      }

      if (!privateInputs || typeof privateInputs !== 'object') {
        throw new Error('Invalid private inputs: must be an object');
      }

      return await this.zkService.generateProof(compactCode, publicInputs, privateInputs);

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
}

// Create singleton instance
const zkServiceWrapper = new ZkServiceWrapper();

// Export the main function
export const generateProof = async (compactCode, publicInputs, privateInputs) => {
  return await zkServiceWrapper.generateProof(compactCode, publicInputs, privateInputs);
};

export default zkServiceWrapper;