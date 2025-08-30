// src/components/ZKWorkflow.jsx
'use client';
import React, { useState } from 'react';

const ZKWorkflow = () => {
  // Step 2: Add State Variables
  const [code, setCode] = useState('// Your ZK circuit code here');
  const [privateInputs, setPrivateInputs] = useState('');
  const [publicInputs, setPublicInputs] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Step 5: Implement the Button Logic
  const handleGenerateProof = async () => {
    setIsLoading(true);
    setOutput('Generating proof, please wait...');

    try {
      // Here you will call the actual proof generation function
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      setOutput('Proof generated successfully! (This is a placeholder)');

    } catch (err) {
      setOutput('An error occurred.');
      console.error(err);
    }

    setIsLoading(false);
  };

  // Step 3: Build the JSX Structure
  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold text-center">Interactive ZK Circuit Editor</h1>

      {/* Main grid for editor and inputs */}
      <div className="grid md:grid-cols-2 gap-4">
        
        {/* Panel 1: Circuit Code */}
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Circuit Code</h2>
          {/* Step 4: Connect State to the UI */}
          <textarea 
            className="w-full h-64 font-mono bg-gray-800 text-white p-2 rounded" 
            value={code} 
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter your ZK circuit code here..."
          />
        </div>
        
        {/* Panel 2: Inputs */}
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Private Inputs (JSON)</h2>
            {/* Step 4: Connect State to the UI */}
            <textarea 
              className="w-full h-24 font-mono bg-gray-800 text-white p-2 rounded" 
              value={privateInputs} 
              onChange={(e) => setPrivateInputs(e.target.value)}
              placeholder='{"secret": "value"}'
            />
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Public Inputs (JSON)</h2>
            {/* Step 4: Connect State to the UI */}
            <textarea 
              className="w-full h-24 font-mono bg-gray-800 text-white p-2 rounded" 
              value={publicInputs} 
              onChange={(e) => setPublicInputs(e.target.value)}
              placeholder='{"public": "value"}'
            />
          </div>
        </div>
      </div>
      
      {/* Panel 3: Action Button */}
      <div className="text-center">
        {/* Step 5: Connect button to function and loading state */}
        <button
          onClick={handleGenerateProof}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800 disabled:bg-gray-500"
        >
          {isLoading ? 'Generating...' : 'Generate Proof'}
        </button>
      </div>

      {/* Panel 4: Output */}
      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Output</h2>
        <pre className="w-full h-48 bg-black text-green-400 p-2 rounded overflow-auto">
          {/* Step 4: Connect State to the UI */}
          <code>{output}</code>
        </pre>
      </div>
    </div>
  );
};

export default ZKWorkflow;