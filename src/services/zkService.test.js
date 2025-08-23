import { generateProof, getZkService } from './zkService.js';

// Basic Compact circuit for testing - simple addition circuit
const BASIC_COMPACT_CIRCUIT = `
// Simple addition circuit
circuit AdditionCircuit {
  public fn main(a: u32, b: u32) -> u32 {
    a + b
  }
}
`;

// Test harness class
class ZkServiceTestHarness {
  constructor() {
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🧪 Starting ZK Service Test Suite...\n');
    
    const tests = [
      this.testServiceInitialization,
      this.testBasicProofGeneration,
      this.testInvalidInputHandling,
      this.testErrorHandling
    ];

    for (const test of tests) {
      try {
        await test.call(this);
      } catch (error) {
        this.logTestResult(test.name, false, `Unexpected error: ${error.message}`);
      }
    }

    this.printSummary();
    return this.testResults;
  }

  async testServiceInitialization() {
    const testName = 'Service Initialization';
    console.log(`🔧 Testing ${testName}...`);

    try {
      const service = getZkService();
      
      // Check initial state
      const wasReady = service.isReady();
      
      // Initialize service
      await service.initialize();
      
      // Check post-initialization state
      const isReady = service.isReady();
      
      if (!wasReady && isReady) {
        this.logTestResult(testName, true, 'Service initialized successfully');
      } else {
        this.logTestResult(testName, false, `Service state unexpected - wasReady: ${wasReady}, isReady: ${isReady}`);
      }
    } catch (error) {
      this.logTestResult(testName, false, error.message);
    }
  }

  async testBasicProofGeneration() {
    const testName = 'Basic Proof Generation';
    console.log(`🔐 Testing ${testName}...`);

    try {
      const publicInputs = { a: 5, b: 3 };
      const privateInputs = {};
      
      const result = await generateProof(
        BASIC_COMPACT_CIRCUIT,
        publicInputs,
        privateInputs
      );

      if (result.success && result.proof) {
        this.logTestResult(testName, true, 'Basic proof generated successfully');
        console.log('   📋 Proof metadata:', result.metadata);
      } else {
        this.logTestResult(testName, false, `Proof generation failed: ${result.error?.message}`);
      }
    } catch (error) {
      this.logTestResult(testName, false, error.message);
    }
  }

  async testInvalidInputHandling() {
    const testName = 'Invalid Input Handling';
    console.log(`❌ Testing ${testName}...`);

    const invalidInputTests = [
      {
        name: 'Null compact code',
        compactCode: null,
        publicInputs: {},
        privateInputs: {}
      },
      {
        name: 'Empty compact code',
        compactCode: '',
        publicInputs: {},
        privateInputs: {}
      },
      {
        name: 'Invalid public inputs',
        compactCode: BASIC_COMPACT_CIRCUIT,
        publicInputs: null,
        privateInputs: {}
      },
      {
        name: 'Invalid private inputs',
        compactCode: BASIC_COMPACT_CIRCUIT,
        publicInputs: {},
        privateInputs: null
      }
    ];

    let allPassed = true;
    const results = [];

    for (const test of invalidInputTests) {
      try {
        const result = await generateProof(
          test.compactCode,
          test.publicInputs,
          test.privateInputs
        );

        if (!result.success && result.error) {
          results.push(`✓ ${test.name}: Correctly rejected`);
        } else {
          results.push(`✗ ${test.name}: Should have failed but didn't`);
          allPassed = false;
        }
      } catch (error) {
        results.push(`✓ ${test.name}: Correctly threw error - ${error.message}`);
      }
    }

    this.logTestResult(testName, allPassed, results.join(', '));
  }

  async testErrorHandling() {
    const testName = 'Error Handling';
    console.log(`⚠️  Testing ${testName}...`);

    try {
      // Test with malformed Compact circuit
      const malformedCircuit = 'this is not valid compact code';
      const result = await generateProof(
        malformedCircuit,
        { a: 1, b: 2 },
        {}
      );

      if (!result.success && result.error) {
        this.logTestResult(testName, true, 'Error properly handled for malformed circuit');
      } else {
        this.logTestResult(testName, false, 'Should have failed with malformed circuit');
      }
    } catch (error) {
      this.logTestResult(testName, true, `Exception properly caught: ${error.message}`);
    }
  }

  logTestResult(testName, passed, details) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const result = { testName, passed, details, timestamp: new Date().toISOString() };
    
    this.testResults.push(result);
    console.log(`   ${status}: ${details}\n`);
  }

  printSummary() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log('📊 Test Summary:');
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests} ✅`);
    console.log(`   Failed: ${failedTests} ${failedTests > 0 ? '❌' : ''}`);
    console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

    if (failedTests > 0) {
      console.log('❌ Failed Tests:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => console.log(`   • ${r.testName}: ${r.details}`));
    }
  }
}

// Export test harness and utility functions
export const createTestHarness = () => new ZkServiceTestHarness();

export const runQuickTest = async () => {
  console.log('🚀 Running Quick ZK Service Test...\n');
  
  try {
    const result = await generateProof(
      BASIC_COMPACT_CIRCUIT,
      { a: 10, b: 20 },
      {}
    );

    if (result.success) {
      console.log('✅ Quick test PASSED - ZK service is working!');
      console.log('📋 Proof metadata:', result.metadata);
    } else {
      console.log('❌ Quick test FAILED:', result.error?.message);
    }

    return result;
  } catch (error) {
    console.log('💥 Quick test ERROR:', error.message);
    throw error;
  }
};

// Make test harness available globally for browser console testing
if (typeof window !== 'undefined') {
  window.zkTestHarness = createTestHarness();
  window.runZkQuickTest = runQuickTest;
}

export default ZkServiceTestHarness;