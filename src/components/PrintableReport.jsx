'use client';

import React from 'react';

const PrintableReport = ({ circuitData, proofResult, onClose }) => {
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatJSON = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      {/* Non-print header */}
      <div className="no-print sticky top-0 bg-white border-b shadow-sm p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Print Preview</h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>

      {/* Printable content */}
      <div className="print-content max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">ZK Circuit Proof Report</h1>
          <p className="text-gray-600">Generated on {formatTimestamp(new Date().toISOString())}</p>
        </div>

        {/* Circuit Information */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Circuit Information</h2>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Circuit Code:</h3>
            <pre className="bg-gray-50 p-4 rounded border text-sm font-mono overflow-x-auto whitespace-pre-wrap">
{circuitData?.code || 'No circuit code available'}
            </pre>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Public Inputs:</h3>
              <pre className="bg-gray-50 p-3 rounded border text-sm font-mono">
{formatJSON(circuitData?.publicInputs || {})}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Private Inputs:</h3>
              <div className="bg-gray-50 p-3 rounded border text-sm">
                <em className="text-gray-600">Private inputs excluded from report for security</em>
              </div>
            </div>
          </div>
        </div>

        {/* Proof Results */}
        {proofResult && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Proof Results</h2>
            
            <div className={`p-4 rounded border-l-4 mb-6 ${
              proofResult.success ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
            }`}>
              <div className="flex items-center mb-2">
                <span className={`font-medium ${
                  proofResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  Status: {proofResult.success ? 'SUCCESS' : 'FAILED'}
                </span>
              </div>
            </div>

            {proofResult.success && proofResult.result && (
              <div className="space-y-4">
                {/* Metadata */}
                {proofResult.metadata && (
                  <div>
                    <h3 className="font-medium mb-2">Proof Metadata:</h3>
                    <div className="bg-gray-50 p-3 rounded border">
                      <div className="text-sm space-y-1">
                        <div><strong>Timestamp:</strong> {formatTimestamp(proofResult.metadata.timestamp)}</div>
                        {proofResult.metadata.compactCodeHash && (
                          <div><strong>Code Hash:</strong> <code className="text-xs">{proofResult.metadata.compactCodeHash}</code></div>
                        )}
                        {proofResult.metadata.publicInputsHash && (
                          <div><strong>Inputs Hash:</strong> <code className="text-xs">{proofResult.metadata.publicInputsHash}</code></div>
                        )}
                        {proofResult.metadata.totalExecutionTime && (
                          <div><strong>Execution Time:</strong> {proofResult.metadata.totalExecutionTime.toFixed(2)}ms</div>
                        )}
                        {proofResult.metadata.mode && (
                          <div><strong>Mode:</strong> {proofResult.metadata.mode}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Proof Data */}
                <div>
                  <h3 className="font-medium mb-2">Proof Data:</h3>
                  <pre className="bg-gray-50 p-3 rounded border text-xs font-mono overflow-x-auto whitespace-pre-wrap">
{formatJSON(proofResult.result)}
                  </pre>
                </div>

                {/* Verification Result */}
                {proofResult.verification && (
                  <div>
                    <h3 className="font-medium mb-2">Verification Result:</h3>
                    <div className={`p-3 rounded border ${
                      proofResult.verification.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <span className={`font-medium ${
                        proofResult.verification.isValid ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {proofResult.verification.isValid ? 'PROOF VALID ✓' : 'PROOF INVALID ✗'}
                      </span>
                      {proofResult.verification.metadata?.timestamp && (
                        <div className="text-sm text-gray-600 mt-1">
                          Verified at: {formatTimestamp(proofResult.verification.metadata.timestamp)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Details */}
            {!proofResult.success && proofResult.error && (
              <div>
                <h3 className="font-medium mb-2 text-red-800">Error Details:</h3>
                <div className="bg-red-50 p-3 rounded border border-red-200">
                  <div className="text-sm text-red-700">
                    <div><strong>Message:</strong> {proofResult.error.message}</div>
                    {proofResult.error.type && (
                      <div><strong>Type:</strong> {proofResult.error.type}</div>
                    )}
                    {proofResult.error.timestamp && (
                      <div><strong>Timestamp:</strong> {formatTimestamp(proofResult.error.timestamp)}</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Technical Details */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Technical Information</h2>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-medium mb-2">Browser Information:</h3>
              <div className="space-y-1">
                <div>User Agent: <code className="text-xs break-all">{navigator.userAgent}</code></div>
                <div>Platform: {navigator.platform}</div>
                <div>WebAssembly: {typeof WebAssembly !== 'undefined' ? 'Supported' : 'Not supported'}</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Report Information:</h3>
              <div className="space-y-1">
                <div>Generator: ZK Circuit Editor v1.0</div>
                <div>Report Type: Proof Verification Report</div>
                <div>Format: Printable HTML</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 border-t pt-4 mt-8">
          <p>This report was generated by the ZK Circuit Editor & Proof Playground</p>
          <p>For more information, visit the application at your browser</p>
        </div>
      </div>

      {/* Print-specific styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .print-content {
            max-width: none !important;
            padding: 0 !important;
          }
          
          pre {
            page-break-inside: avoid;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          
          .grid {
            display: block !important;
          }
          
          .grid > div {
            margin-bottom: 1rem;
            break-inside: avoid;
          }
          
          h1, h2, h3 {
            color: #000 !important;
            page-break-after: avoid;
          }
          
          .bg-gray-50,
          .bg-green-50,
          .bg-red-50,
          .bg-blue-50 {
            background: #f9f9f9 !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .border {
            border: 1px solid #ccc !important;
          }
          
          .border-l-4 {
            border-left: 4px solid #000 !important;
          }
          
          .border-green-400 {
            border-left-color: #4ade80 !important;
          }
          
          .border-red-400 {
            border-left-color: #f87171 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintableReport;