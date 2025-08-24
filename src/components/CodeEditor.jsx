'use client';

import React, { useState, useEffect } from 'react';

const CodeEditor = ({ value, onChange, disabled = false }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Circuit Code Editor
      </label>
      <div className="relative">
        <textarea
          data-testid="code-editor" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={isMobile ? 8 : 12}
          className={`w-full p-3 lg:p-4 border rounded-lg font-mono text-xs sm:text-sm resize-y min-h-[200px] max-h-[600px]
            ${disabled 
              ? 'bg-slate-100 cursor-not-allowed text-gray-900' 
              : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-slate-100 text-gray-900'
            }
            transition-colors duration-200 leading-relaxed`}
          placeholder="Enter your Compact circuit code..."
          style={{ fontFamily: 'Monaco, Menlo, Consolas, "Courier New", monospace' }}
        />
        {disabled && (
          <div className="absolute inset-0 bg-gray-50 bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500 mx-auto mb-2"></div>
              <span className="text-gray-500 text-sm">Editor locked during proof generation</span>
            </div>
          </div>
        )}
      </div>
      <div className="text-xs text-gray-500 flex flex-col sm:flex-row sm:justify-between">
        <span>Compact language syntax. Define circuits with public and private inputs.</span>
        <span className="mt-1 sm:mt-0">{value.length} characters</span>
      </div>
    </div>
  );
};

export default CodeEditor;