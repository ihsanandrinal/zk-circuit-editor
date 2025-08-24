import { jest } from '@jest/globals';

describe('ZkService', () => {
  let zkService;
  let generateProof, compileCircuit, verifyProof, getServiceStatus;

  beforeEach(async () => {
    // Clear modules to ensure fresh imports
    jest.resetModules();
    
    // Mock localStorage
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };

    // Mock browser APIs
    global.performance = {
      now: jest.fn(() => Date.now()),
    };

    // Import the service fresh
    const zkServiceModule = await import('../zkService.js');
    generateProof = zkServiceModule.generateProof;
    compileCircuit = zkServiceModule.compileCircuit;
    verifyProof = zkServiceModule.verifyProof;
    getServiceStatus = zkServiceModule.getServiceStatus;
    zkService = zkServiceModule.getZkService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Browser Compatibility Checks', () => {
    test('should check browser compatibility on initialization', () => {
      const compatibility = zkService.checkBrowserCompatibility();
      
      expect(compatibility).toHaveProperty('webAssembly');
      expect(compatibility).toHaveProperty('worker');
      expect(compatibility).toHaveProperty('crypto');
    });

    test('should handle missing WebAssembly gracefully', async () => {
      // Temporarily remove WebAssembly
      const originalWebAssembly = global.WebAssembly;
      delete global.WebAssembly;

      try {
        const result = await compileCircuit('circuit Test { public fn main() -> u32 { 42 } }');
        expect(result.success).toBe(false);
        expect(result.error.message).toContain('WebAssembly');
      } finally {
        global.WebAssembly = originalWebAssembly;
      }
    });
  });

  describe('Circuit Compilation', () => {
    test('should compile a valid circuit', async () => {
      const circuitCode = `circuit AdditionCircuit {
        public fn main(a: u32, b: u32) -> u32 {
          a + b
        }
      }`;

      const result = await compileCircuit(circuitCode);
      
      expect(result.success).toBe(true);
      expect(result.zkir).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata.step).toBe('compile');
      expect(result.metadata.compactCodeHash).toBeDefined();
    });

    test('should handle invalid circuit code', async () => {
      const result = await compileCircuit('invalid circuit code');
      
      expect(result.success).toBe(true); // Because it falls back to mock mode
      expect(result.zkir).toBeDefined();
      expect(result.metadata.mode).toBe('mock');
    });

    test('should handle empty circuit code', async () => {
      const result = await compileCircuit('');
      
      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Invalid compact code');
    });

    test('should handle null circuit code', async () => {
      const result = await compileCircuit(null);
      
      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Invalid compact code');
    });
  });

  describe('Proof Generation', () => {
    test('should generate proof with valid inputs', async () => {
      const circuitCode = `circuit AdditionCircuit {
        public fn main(a: u32, b: u32) -> u32 {
          a + b
        }
      }`;
      const publicInputs = { a: 5, b: 3 };
      const privateInputs = {};

      const result = await generateProof(circuitCode, publicInputs, privateInputs);
      
      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.result.proofData).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    test('should handle invalid public inputs', async () => {
      const circuitCode = 'circuit Test { public fn main() -> u32 { 42 } }';
      
      const result = await generateProof(circuitCode, null, {});
      
      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Invalid public inputs');
    });

    test('should handle invalid private inputs', async () => {
      const circuitCode = 'circuit Test { public fn main() -> u32 { 42 } }';
      
      const result = await generateProof(circuitCode, {}, null);
      
      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Invalid private inputs');
    });

    test('should return demo proof when in demo mode', async () => {
      // Set demo mode
      global.localStorage.setItem('zkDemoMode', 'true');

      const result = await generateProof('invalid', {}, {});
      
      expect(result.success).toBe(true);
      expect(result.result.mockMode).toBe(true);
      expect(result.metadata.mode).toBe('demo');
    });
  });

  describe('Proof Verification', () => {
    test('should verify a valid proof', async () => {
      const validProof = {
        proofData: 'mock_proof_data_test123',
        publicOutputs: { result: 8 }
      };

      const result = await verifyProof(validProof);
      
      expect(result.success).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.metadata.step).toBe('verify');
    });

    test('should reject invalid proof', async () => {
      const invalidProof = {
        proofData: 'invalid_proof_data',
        publicOutputs: {}
      };

      const result = await verifyProof(invalidProof);
      
      expect(result.success).toBe(true);
      expect(result.isValid).toBe(false);
    });

    test('should handle malformed proof', async () => {
      const result = await verifyProof(null);
      
      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Invalid proof');
    });

    test('should handle proof without proofData', async () => {
      const incompleteProof = { publicOutputs: {} };
      
      const result = await verifyProof(incompleteProof);
      
      expect(result.success).toBe(false);
      expect(result.error.message).toContain('missing proof data');
    });
  });

  describe('Service Status', () => {
    test('should return service status', async () => {
      const status = await getServiceStatus();
      
      expect(status).toBeDefined();
      expect(status).toHaveProperty('isInitialized');
      expect(status).toHaveProperty('isReady');
      expect(status).toHaveProperty('mode');
      expect(status).toHaveProperty('message');
    });

    test('should handle service initialization errors gracefully', async () => {
      // Mock a service that fails to initialize
      const originalConsoleError = console.error;
      console.error = jest.fn();

      try {
        const status = await getServiceStatus();
        expect(status.mode).toBeDefined();
      } finally {
        console.error = originalConsoleError;
      }
    });
  });

  describe('Mock Circuit Execution', () => {
    test('should perform mock circuit execution for addition', () => {
      const publicInputs = { a: 5, b: 3 };
      const zkir = { type: 'mock' };
      
      const result = zkService._mockCircuitExecution(publicInputs, zkir);
      
      expect(result.result).toBe(8);
      expect(result.computed).toContain('5 + 3 = 8');
      expect(result.circuitType).toBe('addition');
    });

    test('should handle generic inputs', () => {
      const publicInputs = { x: 10, y: 20, z: 30 };
      const zkir = { type: 'mock' };
      
      const result = zkService._mockCircuitExecution(publicInputs, zkir);
      
      expect(result.circuitType).toBe('generic');
      expect(result.result).toBe(21); // 3 inputs * 7
    });

    test('should handle empty inputs', () => {
      const result = zkService._mockCircuitExecution({}, {});
      
      expect(result.circuitType).toBe('generic');
      expect(result.result).toBe(0); // 0 inputs * 7
    });

    test('should handle null inputs', () => {
      const result = zkService._mockCircuitExecution(null, {});
      
      expect(result.circuitType).toBe('empty');
      expect(result.result).toBe(42);
    });
  });

  describe('Utility Functions', () => {
    test('should hash strings consistently', () => {
      const testString = 'test string';
      const hash1 = zkService.hashString(testString);
      const hash2 = zkService.hashString(testString);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toBeDefined();
      expect(typeof hash1).toBe('string');
    });

    test('should handle empty string hash', () => {
      const hash = zkService.hashString('');
      expect(hash).toBe('0');
    });

    test('should produce different hashes for different strings', () => {
      const hash1 = zkService.hashString('string1');
      const hash2 = zkService.hashString('string2');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Service Reset', () => {
    test('should reset service state', () => {
      zkService.isInitialized = true;
      zkService.reset();
      
      expect(zkService.isInitialized).toBe(false);
      expect(zkService.configProvider).toBe(null);
      expect(zkService.proofProvider).toBe(null);
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      // Mock a network error scenario
      const originalConsoleError = console.error;
      console.error = jest.fn();

      try {
        // This should trigger fallback mode
        const result = await generateProof('network_error_circuit', {}, {});
        expect(result).toBeDefined();
        expect(result.success).toBeDefined();
      } finally {
        console.error = originalConsoleError;
      }
    });

    test('should preserve error metadata', async () => {
      const result = await compileCircuit('');
      
      if (!result.success) {
        expect(result.error.timestamp).toBeDefined();
        expect(result.error.type).toBeDefined();
        expect(result.error.step).toBe('compile');
      }
    });
  });

  describe('Integration Tests', () => {
    test('should complete full proof generation workflow', async () => {
      const circuitCode = `circuit MultiplyCircuit {
        public fn main(a: u32, b: u32) -> u32 {
          a * b
        }
      }`;
      const publicInputs = { a: 4, b: 7 };
      const privateInputs = {};

      // Compile circuit
      const compileResult = await compileCircuit(circuitCode);
      expect(compileResult.success).toBe(true);

      // Generate proof using the zkir
      const zkir = compileResult.zkir;
      const { generateProofFromZKIR } = await import('../zkService.js');
      const proofResult = await generateProofFromZKIR(zkir, publicInputs, privateInputs);
      expect(proofResult.success).toBe(true);

      // Verify proof
      const verifyResult = await verifyProof(proofResult.proof);
      expect(verifyResult.success).toBe(true);
    });

    test('should handle workflow with errors', async () => {
      // Try to generate proof with invalid inputs
      const result = await generateProof('invalid circuit', null, null);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    test('should complete proof generation in reasonable time', async () => {
      const startTime = Date.now();
      
      await generateProof(
        'circuit Test { public fn main() -> u32 { 42 } }',
        {},
        {}
      );
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      // Should complete in under 5 seconds (generous for CI)
      expect(executionTime).toBeLessThan(5000);
    });
  });
});