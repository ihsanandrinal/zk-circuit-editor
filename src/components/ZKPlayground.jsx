'use client';

import React, { useState, useCallback, useEffect } from 'react';
import CodeEditor from './CodeEditor.jsx';
import InputPanel from './InputPanel.jsx';
import OutputPanel from './OutputPanel.jsx';
import LoadingIndicator from './LoadingIndicator.jsx';
import ExampleSelector from './ExampleSelector.jsx';

const ZKPlayground = () => {
  // Main state management
  const [compactCode, setCompactCode] = useState(`// Simple addition circuit
circuit AdditionCircuit {
  public fn main(a: u32, b: u32) -> u32 {
    a + b
  }
}`);
  
  const [publicInputs, setPublicInputs] = useState('{"a": 5, "b": 3}');
  const [privateInputs, setPrivateInputs] = useState('{}');
  const [proofResult, setProofResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [zkServiceLoaded, setZkServiceLoaded] = useState(false);
  const [selectedExample, setSelectedExample] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Lazy load ZK service
  const loadZkService = useCallback(async () => {
    if (zkServiceLoaded) return;
    
    try {
      setLoading(true);
      console.log('Loading ZK service...');
      
      // Dynamic import of ZK service wrapper (browser-safe)
      const { generateProof } = await import('../services/zkServiceWrapper.js');
      
      // Store the function in a ref or state for later use
      window.zkGenerateProof = generateProof;
      setZkServiceLoaded(true);
      
      console.log('ZK service loaded successfully');
    } catch (error) {
      console.error('Failed to load ZK service:', error);
      setErrors(`Failed to load ZK service: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [zkServiceLoaded]);

  // Input validation helper
  const validateInputs = (publicInputsStr, privateInputsStr) => {
    const errors = [];
    
    try {
      JSON.parse(publicInputsStr);
    } catch (e) {
      errors.push(`Invalid public inputs JSON: ${e.message}`);
    }
    
    try {
      JSON.parse(privateInputsStr);
    } catch (e) {
      errors.push(`Invalid private inputs JSON: ${e.message}`);
    }
    
    if (!compactCode.trim()) {
      errors.push('Circuit code cannot be empty');
    }
    
    return errors;
  };

  // Main proof generation handler
  const handleGenerateProof = useCallback(async () => {
    // First ensure ZK service is loaded
    if (!zkServiceLoaded) {
      await loadZkService();
      if (!zkServiceLoaded) return; // If loading failed, exit
    }

    setLoading(true);
    setProofResult(null);
    setErrors(null);

    try {
      // Validate inputs first
      const validationErrors = validateInputs(publicInputs, privateInputs);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Parse inputs
      const publicInputsObj = JSON.parse(publicInputs);
      const privateInputsObj = JSON.parse(privateInputs);
      
      // Generate proof using the loaded service
      if (!window.zkGenerateProof) {
        throw new Error('ZK service not properly loaded');
      }
      
      const result = await window.zkGenerateProof(compactCode, publicInputsObj, privateInputsObj);
      setProofResult(result);
      
    } catch (error) {
      setErrors(error.message);
      setProofResult({
        success: false,
        error: { message: error.message }
      });
    } finally {
      setLoading(false);
    }
  }, [compactCode, publicInputs, privateInputs, zkServiceLoaded, loadZkService]);

  // Track changes to mark unsaved state
  useEffect(() => {
    if (selectedExample) {
      const hasCodeChanges = compactCode !== selectedExample.code;
      const hasPublicInputsChanges = JSON.stringify(JSON.parse(publicInputs)) !== JSON.stringify(selectedExample.publicInputs);
      const hasPrivateInputsChanges = JSON.stringify(JSON.parse(privateInputs || '{}')) !== JSON.stringify(selectedExample.privateInputs);
      
      setHasUnsavedChanges(hasCodeChanges || hasPublicInputsChanges || hasPrivateInputsChanges);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [compactCode, publicInputs, privateInputs, selectedExample]);

  // Example selection handler
  const handleExampleSelect = useCallback((example) => {
    if (example === null) {
      // Custom mode selected
      setSelectedExample(null);
      setHasUnsavedChanges(false);
    } else {
      // Load example
      setCompactCode(example.code);
      setPublicInputs(JSON.stringify(example.publicInputs, null, 2));
      setPrivateInputs(JSON.stringify(example.privateInputs, null, 2));
      setSelectedExample(example);
      setHasUnsavedChanges(false);
      
      // Clear previous results when loading new example
      setProofResult(null);
      setErrors(null);
    }
  }, []);

  // Clear results handler
  const handleClearResults = useCallback(() => {
    setProofResult(null);
    setErrors(null);
  }, []);

  // Reset to clean state
  const handleReset = useCallback(() => {
    const defaultCode = `// Simple addition circuit
circuit AdditionCircuit {
  public fn main(a: u32, b: u32) -> u32 {
    a + b
  }
}`;
    
    setCompactCode(defaultCode);
    setPublicInputs('{"a": 5, "b": 3}');
    setPrivateInputs('{}');
    setProofResult(null);
    setErrors(null);
    setSelectedExample(null);
    setHasUnsavedChanges(false);
  }, []);

  // Only render on client side to prevent SSR issues
  if (!isClient) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
              ZK Circuit Editor & Proof Playground
            </h1>
            {selectedExample && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Currently loaded:</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {selectedExample.title}
                </span>
                {hasUnsavedChanges && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Modified
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleClearResults}
              disabled={loading || !proofResult}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear Results
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md border border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reset All
            </button>
          </div>
        </div>

        {/* Example Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Circuit Examples
          </label>
          <ExampleSelector 
            onExampleSelect={handleExampleSelect}
            currentExample={selectedExample}
          />
          {selectedExample && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-1">{selectedExample.title}</h4>
              <p className="text-sm text-blue-800 mb-2">{selectedExample.explanation}</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                  {selectedExample.category}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                  {selectedExample.difficulty}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                  Expected: {selectedExample.expectedResult}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* ZK Service status */}
        {!zkServiceLoaded && !loading && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center">
              <div className="text-yellow-400 mr-2">⚠️</div>
              <div className="text-sm text-yellow-800">
                ZK service will be loaded when you generate your first proof.
              </div>
            </div>
          </div>
        )}
        
        {/* Loading indicator */}
        {loading && <LoadingIndicator message={zkServiceLoaded ? "Generating proof..." : "Loading ZK service..."} />}
        
        {/* Main layout grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          {/* Left Panel - Code Editor */}
          <div className="space-y-4 order-1 xl:order-1">
            <CodeEditor 
              value={compactCode}
              onChange={setCompactCode}
              disabled={loading}
            />
          </div>

          {/* Right Panel - Input/Output */}
          <div className="space-y-4 order-2 xl:order-2">
            {/* Input Panel */}
            <InputPanel
              publicInputs={publicInputs}
              privateInputs={privateInputs}
              onPublicInputsChange={setPublicInputs}
              onPrivateInputsChange={setPrivateInputs}
              onGenerateProof={handleGenerateProof}
              onClearResults={handleClearResults}
              loading={loading}
              errors={errors}
            />
            
            {/* Output Panel */}
            <OutputPanel 
              proofResult={proofResult}
              loading={loading}
              errors={errors}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZKPlayground;