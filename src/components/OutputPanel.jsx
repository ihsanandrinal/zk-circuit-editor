'use client';

import React, { useState } from 'react';
import { ClipboardDocumentIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const OutputPanel = ({ proofResult, loading, errors }) => {
  const [activeTab, setActiveTab] = useState('result');
  const [copiedStates, setCopiedStates] = useState({});

  const copyToClipboard = async (content, key) => {
    try {
      await navigator.clipboard.writeText(typeof content === 'string' ? content : JSON.stringify(content, null, 2));
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const CopyButton = ({ content, copyKey, size = 'sm' }) => (
    <button
      onClick={() => copyToClipboard(content, copyKey)}
      className={`inline-flex items-center ${size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} 
        bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 
        transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500`}
      title="Copy to clipboard"
    >
      {copiedStates[copyKey] ? (
        <CheckIcon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} text-green-600`} />
      ) : (
        <ClipboardDocumentIcon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />
      )}
      <span className="ml-1">{copiedStates[copyKey] ? 'Copied!' : 'Copy'}</span>
    </button>
  );

  const getErrorSuggestion = (errorMessage) => {
    if (!errorMessage) return null;
    
    const message = errorMessage.toLowerCase();
    
    if (message.includes('json')) {
      return 'Check your input formatting. Ensure all JSON is valid with proper quotes and brackets.';
    }
    if (message.includes('circuit') || message.includes('compact')) {
      return 'Verify your circuit syntax. Check for missing semicolons, proper function declarations, and correct Compact language syntax.';
    }
    if (message.includes('type')) {
      return 'Check variable types in your circuit. Ensure u32, i32, bool, and other types match your inputs.';
    }
    if (message.includes('initialization') || message.includes('service')) {
      return 'ZK service initialization failed. Try refreshing the page or check your network connection.';
    }
    if (message.includes('timeout')) {
      return 'The proof generation timed out. Try reducing circuit complexity or check your network connection.';
    }
    
    return 'Review your circuit code and input values. Ensure they follow proper Compact syntax and types.';
  };

  const renderSuccessResult = (result) => (
    <div className="space-y-4">
      {/* Metadata Section */}
      {result.metadata && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium text-green-800">Proof Metadata</h5>
            <CopyButton content={result.metadata} copyKey="metadata" />
          </div>
          <div className="bg-white p-3 rounded border text-sm">
            <div className="grid grid-cols-1 gap-2">
              <div><strong>Timestamp:</strong> {result.metadata.timestamp}</div>
              <div><strong>Code Hash:</strong> <code className="text-xs bg-gray-100 px-1 rounded">{result.metadata.compactCodeHash}</code></div>
              <div><strong>Inputs Hash:</strong> <code className="text-xs bg-gray-100 px-1 rounded">{result.metadata.publicInputsHash}</code></div>
            </div>
          </div>
        </div>
      )}

      {/* Proof Result */}
      {result.result && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium text-green-800">Proof Data</h5>
            <CopyButton content={result.result} copyKey="proof-data" />
          </div>
          <pre className="bg-white p-3 rounded border text-xs overflow-auto max-h-48 whitespace-pre-wrap">
            {JSON.stringify(result.result, null, 2)}
          </pre>
        </div>
      )}

      {/* Service Message */}
      {result.result?.message && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="text-sm text-blue-800">{result.result.message}</div>
        </div>
      )}

      {/* Quick Copy Full Result */}
      <div className="pt-2 border-t border-green-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-green-700">Copy complete proof result</span>
          <CopyButton content={result} copyKey="full-result" size="md" />
        </div>
      </div>
    </div>
  );

  const renderErrorResult = (result) => {
    const suggestion = getErrorSuggestion(result.error?.message);
    
    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <strong className="text-red-800">Error Message:</strong>
            <CopyButton content={result.error?.message || 'Unknown error occurred'} copyKey="error-message" />
          </div>
          <p className="text-sm text-red-700 p-2 bg-white rounded border">
            {result.error?.message || 'Unknown error occurred'}
          </p>
        </div>
        
        {suggestion && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h6 className="font-medium text-amber-800 mb-1">Suggestion:</h6>
                <p className="text-sm text-amber-700">{suggestion}</p>
              </div>
            </div>
          </div>
        )}
        
        {result.error?.type && (
          <div>
            <strong className="text-red-800">Error Type:</strong>
            <p className="text-sm text-red-700 mt-1">{result.error.type}</p>
          </div>
        )}
        
        {result.error?.timestamp && (
          <div>
            <strong className="text-red-800">Timestamp:</strong>
            <p className="text-sm text-red-700 mt-1">{result.error.timestamp}</p>
          </div>
        )}

        {/* Copy Full Error */}
        <div className="pt-2 border-t border-red-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-700">Copy complete error details</span>
            <CopyButton content={result} copyKey="full-error" size="md" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Proof Results</h3>
        
        {/* Tab Navigation */}
        {proofResult && (
          <div className="flex rounded-md border border-gray-200">
            <button
              onClick={() => setActiveTab('result')}
              className={`px-3 py-1 text-sm rounded-l-md transition-colors ${
                activeTab === 'result' 
                  ? 'bg-indigo-100 text-indigo-700 border-indigo-200' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Result
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-3 py-1 text-sm rounded-r-md border-l transition-colors ${
                activeTab === 'raw' 
                  ? 'bg-indigo-100 text-indigo-700 border-indigo-200' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Raw JSON
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-800">Processing proof generation...</span>
          </div>
        </div>
      )}

      {/* Results Display */}
      {proofResult && !loading && (
        <div className={`p-4 rounded-lg border ${
          proofResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          {/* Status Header */}
          <div className="flex items-center mb-4">
            <div className={`w-4 h-4 rounded-full mr-3 ${
              proofResult.success ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <h4 className={`font-medium ${
              proofResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {proofResult.success ? 'Proof Generated Successfully' : 'Proof Generation Failed'}
            </h4>
          </div>

          {/* Content Tabs */}
          <div className="min-h-[200px]">
            {activeTab === 'result' ? (
              proofResult.success 
                ? renderSuccessResult(proofResult)
                : renderErrorResult(proofResult)
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-800">Complete Response Object</h5>
                  <CopyButton content={proofResult} copyKey="raw-json" size="md" />
                </div>
                <pre className="bg-white p-3 rounded border text-xs overflow-auto max-h-96 whitespace-pre-wrap">
                  {JSON.stringify(proofResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!proofResult && !loading && (
        <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">
            No proof generated yet. Enter your circuit code and inputs, then click "Generate ZK Proof".
          </p>
        </div>
      )}
    </div>
  );
};

export default OutputPanel;