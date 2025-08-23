'use client';

import React, { useState, useEffect } from 'react';
import { generateProof } from '../services/zkService.js';
import { runQuickTest, createTestHarness } from '../services/zkService.test.js';

const ZkProofDemo = () => {
  const [compactCode, setCompactCode] = useState(`// Simple addition circuit
circuit AdditionCircuit {
  public fn main(a: u32, b: u32) -> u32 {
    a + b
  }
}`);
  
  const [publicInputs, setPublicInputs] = useState('{"a": 5, "b": 3}');
  const [privateInputs, setPrivateInputs] = useState('{}');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState(null);

  useEffect(() => {
    console.log('State updated:', {
      hasCode: !!compactCode,
      hasPublicInputs: !!publicInputs,
      hasPrivateInputs: !!privateInputs,
      isLoading,
      hasError: !!result?.error,
      hasResult: !!result
    });
  }, [compactCode, publicInputs, privateInputs, isLoading, result]);

  const handleGenerateProof = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const publicInputsObj = JSON.parse(publicInputs);
      const privateInputsObj = JSON.parse(privateInputs);
      
      const proofResult = await generateProof(compactCode, publicInputsObj, privateInputsObj);
      setResult(proofResult);
    } catch (error) {
      setResult({
        success: false,
        error: { message: `Input parsing error: ${error.message}` }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunTests = async () => {
    setIsLoading(true);
    try {
      const harness = createTestHarness();
      const results = await harness.runAllTests();
      setTestResults(results);
    } catch (error) {
      console.error('Test execution failed:', error);
      setTestResults([{ testName: 'Test Suite', passed: false, details: error.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTest = async () => {
    setIsLoading(true);
    try {
      const quickResult = await runQuickTest();
      setResult(quickResult);
    } catch (error) {
      setResult({
        success: false,
        error: { message: `Quick test failed: ${error.message}` }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const debugProofGeneration = async () => {
    console.log('🧪 Starting proof generation test');
    console.log('Inputs:', { compactCode, publicInputs, privateInputs });
    
    setIsLoading(true);
    console.log('Loading state set to true');
    
    try {
      const publicInputsObj = JSON.parse(publicInputs);
      const privateInputsObj = JSON.parse(privateInputs);
      const result = await generateProof(compactCode, publicInputsObj, privateInputsObj);
      console.log('✅ Proof generated:', result);
      setResult(result);
    } catch (error) {
      console.log('❌ Error caught:', error);
      setResult({
        success: false,
        error: { message: error.message }
      });
    } finally {
      setIsLoading(false);
      console.log('Loading state set to false');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">ZK Proof Playground</h1>
        
        {/* Test Controls */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="space-x-4">
            <button
              onClick={handleQuickTest}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Quick Test
            </button>
            <button
              data-testid="generate-proof"
              onClick={handleRunTests}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              Run Full Test Suite
            </button>
            <button
              onClick={debugProofGeneration}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              Debug Proof Generation
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compact Circuit Code
              </label>
              <textarea
                data-testid="code-editor"
                value={compactCode}
                onChange={(e) => setCompactCode(e.target.value)}
                rows={8}
                className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm"
                placeholder="Enter your Compact circuit code..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Public Inputs (JSON)
              </label>
              <textarea
                data-testid="public-inputs"
                value={publicInputs}
                onChange={(e) => setPublicInputs(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm"
                placeholder='{"a": 5, "b": 3}'
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Private Inputs (JSON)
              </label>
              <textarea
                value={privateInputs}
                onChange={(e) => setPrivateInputs(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm"
                placeholder='{}'
              />
            </div>

            <button
              onClick={handleGenerateProof}
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Generating Proof...' : 'Generate ZK Proof'}
            </button>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Results</h3>
            
            {isLoading && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-blue-800">Processing...</span>
                </div>
              </div>
            )}

            {result && (
              <div className={`p-4 rounded-md border ${
                result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <h4 className={`font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.success ? '✅ Proof Generated Successfully' : '❌ Proof Generation Failed'}
                </h4>
                
                {result.success ? (
                  <div className="mt-3 space-y-2">
                    <div>
                      <strong>Metadata:</strong>
                      <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto">
                        {JSON.stringify(result.metadata, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <strong>Proof Object:</strong>
                      <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                        {JSON.stringify(result.proof, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <strong>Error:</strong>
                    <p className="text-sm text-red-700 mt-1">{result.error?.message}</p>
                  </div>
                )}
              </div>
            )}

            {testResults && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                <h4 className="font-medium text-gray-800 mb-3">Test Results</h4>
                <div className="space-y-2">
                  {testResults.map((test, index) => (
                    <div key={index} className={`text-sm p-2 rounded ${
                      test.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      <strong>{test.passed ? '✅' : '❌'} {test.testName}</strong>
                      <p className="text-xs mt-1">{test.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZkProofDemo;