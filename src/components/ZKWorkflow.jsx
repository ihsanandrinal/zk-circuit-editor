// src/components/ZKWorkflow.jsx
'use client';
import React from 'react';

// This is now a simple component that receives functions as props.
// It does NOT handle initialization itself.
const ZKWorkflow = () => {
  const handleGenerateProof = async () => {
    // We will get the generateProof function from our service later
    console.log("Generate Proof button clicked!");
    // Example: const { generateProof } = await getZkService();
    // await generateProof(...);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">ZK Workflow</h1>
      <button
        onClick={handleGenerateProof}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      >
        Generate Proof
      </button>
    </div>
  );
};

export default ZKWorkflow;