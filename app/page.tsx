'use client';

import React, { useState } from 'react';
import ZKPlayground from "../src/components/ZKPlayground";
import ZKWorkflow from "../src/components/ZKWorkflow";

export default function Home() {
  const [viewMode, setViewMode] = useState('workflow'); // 'playground' or 'workflow'

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
                  Original Playground
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'workflow' ? <ZKWorkflow /> : <ZKPlayground />}
    </div>
  );
}
