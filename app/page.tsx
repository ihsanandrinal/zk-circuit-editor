'use client';

import React, { useState } from 'react';
import ZKPlayground from "../src/components/ZKPlayground";
import ZKWorkflow from "../src/components/ZKWorkflow";
import ErrorBoundary from "../src/components/ErrorBoundary";
import ZKServiceErrorBoundary from "../src/components/ZKServiceErrorBoundary";
import { useZkService } from "../src/hooks/useZkService";

export default function Home() {
  const [viewMode, setViewMode] = useState('workflow'); // 'playground' or 'workflow'
  
  // Use our custom hook to get the initialization status
  const { isInitialized, error } = useZkService();

  // Show error state if there's an initialization error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">ZK Engine Initialization Failed</h2>
          <p className="text-gray-600 mb-4">
            {error ? String(error.message) : 'Failed to initialize the ZK proof engine.'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show loading state until the WASM is ready
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin text-blue-600 text-6xl mb-4">⚙️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Initializing ZK Engine</h2>
          <p className="text-gray-600 mb-4">
            Loading WebAssembly modules and setting up the zero-knowledge proof engine...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
          <p className="text-sm text-gray-500">This may take a few moments on first load.</p>
        </div>
      </div>
    );
  }

  // Once initialized, render the actual application with dual interface
  return (
    <div className="min-h-screen bg-gray-50">
      {/* View Mode Toggle */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-gray-900">ZK Circuit Editor</h1>
            </div>
            
            <div className="flex items-center">
              <div className="relative bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('workflow')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === 'workflow'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Step-by-Step Workflow
                </button>
                <button
                  onClick={() => setViewMode('playground')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === 'playground'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Advanced Playground
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <ErrorBoundary message="Application encountered an unexpected error">
        <ZKServiceErrorBoundary>
          {viewMode === 'workflow' ? <ZKWorkflow /> : <ZKPlayground />}
        </ZKServiceErrorBoundary>
      </ErrorBoundary>
    </div>
  );
}