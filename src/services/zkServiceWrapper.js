'use client';

// Import global setup FIRST to ensure MidnightJS compatibility
import './globalSetup.js';

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

      // Use the real ZK service instead of mock
      const { getZkService } = await import('./zkService.js');
      this.zkService = getZkService();
      
      // Initialize the real service
      await this.zkService.initialize();

      this.isInitialized = true;
      console.log('ZK service wrapper initialized successfully with real ZK service');

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

  // Utility methods removed - using real service now

  // Method to get service status
  getServiceStatus() {
    if (this.zkService && this.isInitialized) {
      return this.zkService.getServiceStatus();
    }
    
    return {
      isInitialized: this.isInitialized,
      isReady: this.isInitialized,
      mode: 'initializing',
      message: 'ZK service wrapper is initializing...',
      error: null
    };
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

      // Use the real service's generateProof method  
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

// Export the main function and status
export const generateProof = async (compactCode, publicInputs, privateInputs) => {
  return await zkServiceWrapper.generateProof(compactCode, publicInputs, privateInputs);
};

export const getServiceStatus = async () => {
  await zkServiceWrapper.initialize();
  return zkServiceWrapper.getServiceStatus();
};

export default zkServiceWrapper;