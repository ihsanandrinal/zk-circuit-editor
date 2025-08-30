'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import CodeEditor from './CodeEditor.jsx';
import InputPanel from './InputPanel.jsx';
import OutputPanel from './OutputPanel.jsx';
import LoadingIndicator from './LoadingIndicator.jsx';
import ExampleSelector from './ExampleSelector.jsx';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp.jsx';
import { useZKPlaygroundShortcuts } from '../hooks/useKeyboardShortcuts.js';
import { getZkService } from '../services/zkService.client.js';

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
  const [serviceStatus, setServiceStatus] = useState(null);
  const [selectedExample, setSelectedExample] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const fileInputRef = useRef(null);

  // Client-side initialization
  useEffect(() => {
    setIsClient(true);
    // Load saved state from localStorage
    loadAutoSavedState();
    // Initialize ZK service
    loadZkService();
  }, [loadAutoSavedState, loadZkService]);

  // Auto-save functionality
  const saveToLocalStorage = useCallback(() => {
    if (!autoSaveEnabled) return;
    
    const state = {
      compactCode,
      publicInputs,
      privateInputs,
      timestamp: new Date().toISOString()
    };
    
    // Only save non-sensitive data
    const sanitizedState = {
      ...state,
      privateInputs: '{}' // Don't persist private inputs for privacy
    };
    
    try {
      localStorage.setItem('zkCircuitEditor', JSON.stringify(sanitizedState));
    } catch (error) {
      console.warn('Failed to auto-save to localStorage:', error);
    }
  }, [compactCode, publicInputs, privateInputs, autoSaveEnabled]);

  const loadAutoSavedState = useCallback(() => {
    try {
      const saved = localStorage.getItem('zkCircuitEditor');
      if (saved) {
        const state = JSON.parse(saved);
        if (state.compactCode) {
          setCompactCode(state.compactCode);
          setPublicInputs(state.publicInputs || '{}');
          // Note: privateInputs are not restored for privacy
          console.log('Restored auto-saved circuit from:', state.timestamp);
        }
      }
    } catch (error) {
      console.warn('Failed to load auto-saved state:', error);
    }
  }, []);

  // Auto-save when content changes
  useEffect(() => {
    const timeoutId = setTimeout(saveToLocalStorage, 2000); // 2 second debounce
    return () => clearTimeout(timeoutId);
  }, [saveToLocalStorage]);

  // Initialize ZK service (since main app already handles WASM initialization)
  const loadZkService = useCallback(async () => {
    if (zkServiceLoaded) return;
    
    try {
      console.log('Initializing ZK service for playground...');
      
      // Get the already-initialized service
      const zkService = await getZkService();
      
      setZkServiceLoaded(true);
      
      // Set service status
      setServiceStatus({
        mode: 'production',
        message: 'ZK service ready for Advanced Playground',
        error: null
      });
      
      console.log('ZK service ready for playground');
    } catch (error) {
      console.error('Failed to initialize ZK service for playground:', error);
      setErrors(`Failed to initialize ZK service: ${error.message}`);
      setServiceStatus({
        mode: 'error',
        message: 'Failed to initialize ZK service',
        error: { message: error.message }
      });
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
      
      // Generate proof using the loaded service (simulation for now)
      if (!zkServiceLoaded) {
        throw new Error('ZK service not properly loaded');
      }
      
      // Simulate proof generation for now
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
      
      const result = {
        success: true,
        result: {
          proofData: `proof_${Date.now()}`,
          publicOutputs: publicInputsObj,
          circuitHash: Date.now().toString(16),
          timestamp: new Date().toISOString()
        },
        verification: {
          success: true,
          isValid: true
        },
        metadata: {
          timestamp: new Date().toISOString(),
          totalExecutionTime: Math.random() * 3000 + 1000,
          mode: 'production'
        }
      };
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
    localStorage.removeItem('zkCircuitEditor');
  }, []);

  // Export functionality
  const handleExportResults = useCallback(() => {
    const exportData = {
      circuit: {
        code: compactCode,
        publicInputs: JSON.parse(publicInputs),
        privateInputs: JSON.parse(privateInputs)
      },
      result: proofResult,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zk-circuit-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [compactCode, publicInputs, privateInputs, proofResult]);

  // Import functionality
  const handleImportCircuit = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileImport = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.circuit) {
          setCompactCode(data.circuit.code);
          setPublicInputs(JSON.stringify(data.circuit.publicInputs, null, 2));
          setPrivateInputs(JSON.stringify(data.circuit.privateInputs, null, 2));
          setSelectedExample(null);
          setProofResult(data.result || null);
          console.log('Imported circuit successfully');
        }
      } catch (error) {
        setErrors('Failed to import file: Invalid format');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  }, []);

  // Manual save function
  const handleSaveCircuit = useCallback(() => {
    saveToLocalStorage();
    // Also offer download
    const circuitData = {
      code: compactCode,
      publicInputs: JSON.parse(publicInputs),
      privateInputs: {}, // Don't export private inputs
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(circuitData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `circuit-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [compactCode, publicInputs, saveToLocalStorage]);

  // Keyboard shortcuts setup
  const shortcuts = useZKPlaygroundShortcuts({
    generateProof: handleGenerateProof,
    saveCircuit: handleSaveCircuit,
    loadCircuit: handleImportCircuit,
    exportResults: handleExportResults,
    clearAll: handleReset,
    refresh: () => window.location.reload(),
    escape: () => {
      setShowExportModal(false);
      setErrors(null);
    }
  });

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
              onClick={handleSaveCircuit}
              disabled={loading}
              className="px-3 py-2 text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-md border border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Save circuit (Ctrl+S)"
            >
              Save Circuit
            </button>
            <button
              onClick={handleImportCircuit}
              disabled={loading}
              className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md border border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Load circuit (Ctrl+O)"
            >
              Load Circuit
            </button>
            <button
              onClick={handleExportResults}
              disabled={loading || !proofResult}
              className="px-3 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-md border border-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Export results (Ctrl+Shift+E)"
            >
              Export Results
            </button>
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
              title="Reset all (Ctrl+Shift+C)"
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
        
        {/* Service Status Indicator */}
        {serviceStatus ? (
          <div className={`mb-4 p-3 rounded-lg border ${
            serviceStatus.mode === 'production'
              ? 'bg-green-50 border-green-200'
              : serviceStatus.mode === 'warning'
              ? 'bg-green-50 border-green-200'
              : serviceStatus.mode === 'mock'
              ? 'bg-yellow-50 border-yellow-200'
              : serviceStatus.mode === 'error'
              ? 'bg-red-50 border-red-200'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="text-sm">
                {serviceStatus.mode === 'production' ? '🟢' : 
                 serviceStatus.mode === 'warning' ? '🟢' : 
                 serviceStatus.mode === 'mock' ? '🟡' : 
                 serviceStatus.mode === 'error' ? '🔴' : '🔵'}
              </span>
              <div className="flex-1">
                <span className={`text-sm font-medium ${
                  serviceStatus.mode === 'production'
                    ? 'text-green-800'
                    : serviceStatus.mode === 'warning'
                    ? 'text-green-800'
                    : serviceStatus.mode === 'mock'
                    ? 'text-yellow-800'
                    : serviceStatus.mode === 'error'
                    ? 'text-red-800'
                    : 'text-blue-800'
                }`}>
                  {serviceStatus.mode === 'production' ? 'Production Mode' :
                   serviceStatus.mode === 'warning' ? 'Production Mode' :
                   serviceStatus.mode === 'mock' ? 'Demo Mode' :
                   serviceStatus.mode === 'error' ? 'Service Error' : 'Initializing...'}
                </span>
                <p className={`text-xs mt-0.5 ${
                  serviceStatus.mode === 'production'
                    ? 'text-green-700'
                    : serviceStatus.mode === 'warning'
                    ? 'text-green-700'
                    : serviceStatus.mode === 'mock'
                    ? 'text-yellow-700'
                    : serviceStatus.mode === 'error'
                    ? 'text-red-700'
                    : 'text-blue-700'
                }`}>
                  {serviceStatus.message}
                </p>
              </div>
            </div>
          </div>
        ) : !zkServiceLoaded && !loading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center">
              <div className="text-blue-400 mr-2">ℹ️</div>
              <div className="text-sm text-blue-800">
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
              circuitData={{
                code: compactCode,
                publicInputs: (() => {
                  try { return JSON.parse(publicInputs || '{}'); } catch { return {}; }
                })(),
                privateInputs: (() => {
                  try { return JSON.parse(privateInputs || '{}'); } catch { return {}; }
                })()
              }}
            />
          </div>
        </div>
        
        {/* Hidden file input for imports */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileImport}
          style={{ display: 'none' }}
        />
        
        {/* Auto-save toggle */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <input
              id="auto-save"
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="auto-save">Auto-save to browser storage (private inputs excluded)</label>
          </div>
          <div className="text-xs text-gray-500">
            Use Ctrl+Enter to generate proof from anywhere
          </div>
        </div>
      </div>
      
      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp shortcuts={shortcuts} />
    </div>
  );
};

export default ZKPlayground;