'use client';

import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { ExclamationTriangleIcon, CpuChipIcon, WifiIcon } from '@heroicons/react/24/outline';

const ZKServiceFallback = ({ error, onRetry, onReset, retryCount }) => {
  const getErrorType = (error) => {
    const errorMessage = error?.message?.toLowerCase() || '';
    
    if (errorMessage.includes('midnight') || errorMessage.includes('zk') || errorMessage.includes('compact')) {
      return 'service';
    }
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
      return 'network';
    }
    if (errorMessage.includes('wasm') || errorMessage.includes('memory')) {
      return 'wasm';
    }
    return 'unknown';
  };

  const errorType = getErrorType(error);
  
  const getErrorIcon = () => {
    switch (errorType) {
      case 'service': return <CpuChipIcon className="w-8 h-8 text-amber-500" />;
      case 'network': return <WifiIcon className="w-8 h-8 text-blue-500" />;
      case 'wasm': return <CpuChipIcon className="w-8 h-8 text-purple-500" />;
      default: return <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />;
    }
  };

  const getErrorMessage = () => {
    switch (errorType) {
      case 'service':
        return {
          title: 'ZK Service Unavailable',
          message: 'The zero-knowledge proof service is currently unavailable. This might be due to service maintenance or configuration issues.',
          suggestions: [
            'Check your internet connection',
            'Verify the MIDNIGHT_ENDPOINT configuration',
            'Try again in a few minutes',
            'Use the offline demo mode if available'
          ]
        };
      case 'network':
        return {
          title: 'Network Connection Error',
          message: 'Unable to connect to the ZK proof service. Please check your network connection.',
          suggestions: [
            'Check your internet connection',
            'Disable any VPN or proxy temporarily',
            'Try refreshing the page',
            'Contact your network administrator if the issue persists'
          ]
        };
      case 'wasm':
        return {
          title: 'WASM Loading Error',
          message: 'Failed to load WebAssembly modules required for zero-knowledge proofs.',
          suggestions: [
            'Refresh the page to reload WASM modules',
            'Clear your browser cache',
            'Try using a different browser',
            'Ensure JavaScript is enabled'
          ]
        };
      default:
        return {
          title: 'ZK Service Error',
          message: 'An unexpected error occurred with the zero-knowledge proof service.',
          suggestions: [
            'Try refreshing the page',
            'Clear browser cache and cookies',
            'Check browser console for more details',
            'Contact support if the issue persists'
          ]
        };
    }
  };

  const { title, message, suggestions } = getErrorMessage();

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
          <div className="flex items-center mb-6">
            {getErrorIcon()}
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <p className="text-gray-600 mt-1">{message}</p>
            </div>
          </div>

          {/* Suggestions */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Troubleshooting Steps:</h3>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          {/* Fallback Mode */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Demo Mode Available</h4>
            <p className="text-blue-800 text-sm">
              While the service is unavailable, you can still explore the interface and see example results. 
              Your circuit code will be validated locally.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onRetry}
              disabled={retryCount >= 3}
              className={`flex items-center justify-center px-6 py-3 rounded-md font-medium transition-colors ${
                retryCount >= 3
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500'
              }`}
            >
              Retry Connection {retryCount > 0 && `(${retryCount}/3)`}
            </button>
            
            <button
              onClick={onReset}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Reset Service
            </button>

            <button
              onClick={() => {
                // Enable demo mode
                localStorage.setItem('zkDemoMode', 'true');
                onReset();
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Use Demo Mode
            </button>
          </div>

          {/* Error Details (Development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                Developer Details
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-800 overflow-auto max-h-32 whitespace-pre-wrap">
                {error?.stack || error?.toString()}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

const ZKServiceErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={ZKServiceFallback}
      message="ZK Service encountered an error"
      clearStorageOnReset={true}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ZKServiceErrorBoundary;