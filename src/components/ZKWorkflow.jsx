'use client';

// Import global setup FIRST to ensure MidnightJS compatibility
import '../services/globalSetup.js';

import React, { useState, useEffect } from 'react';
import { compileCircuit, generateProofFromZKIR, verifyProof, getServiceStatus } from '../services/zkService.js';
import { categorizeError, formatPerformanceMetrics, getPerformanceIndicator } from '../utils/errorHandler.js';

const ZKWorkflow = () => {
  const [compactCode, setCompactCode] = useState(`// Simple addition circuit
circuit AdditionCircuit {
  public fn main(a: u32, b: u32) -> u32 {
    a + b
  }
}`);
  
  const [publicInputs, setPublicInputs] = useState('{"a": 5, "b": 3}');
  const [privateInputs, setPrivateInputs] = useState('{}');
  
  const [workflowState, setWorkflowState] = useState({
    currentStep: 0,
    steps: [
      { id: 'compile', name: 'Compile Circuit', status: 'pending', result: null, error: null },
      { id: 'generate', name: 'Generate Proof', status: 'pending', result: null, error: null },
      { id: 'verify', name: 'Verify Proof', status: 'pending', result: null, error: null }
    ],
    zkir: null,
    proof: null,
    isProcessing: false
  });

  const [serviceStatus, setServiceStatus] = useState(null);

  // Load service status on component mount
  useEffect(() => {
    const loadServiceStatus = async () => {
      try {
        const status = await getServiceStatus();
        setServiceStatus(status);
      } catch (error) {
        console.error('Failed to get service status:', error);
        setServiceStatus({
          mode: 'error',
          message: 'Failed to initialize ZK service',
          error: { message: error.message }
        });
      }
    };

    loadServiceStatus();
  }, []);

  const updateStepStatus = (stepIndex, status, result = null, error = null) => {
    const categorizedError = error ? categorizeError(error) : null;
    
    setWorkflowState(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex 
          ? { ...step, status, result, error: categorizedError }
          : step
      )
    }));
  };

  const handleCompileCircuit = async () => {
    if (workflowState.isProcessing) return;

    setWorkflowState(prev => ({ ...prev, isProcessing: true, currentStep: 0 }));
    updateStepStatus(0, 'processing');

    try {
      const publicInputsObj = JSON.parse(publicInputs);
      const privateInputsObj = JSON.parse(privateInputs);
      
      const compileResult = await compileCircuit(compactCode);
      
      if (compileResult.success) {
        updateStepStatus(0, 'completed', compileResult);
        setWorkflowState(prev => ({ 
          ...prev, 
          zkir: compileResult.zkir,
          currentStep: 1
        }));
      } else {
        updateStepStatus(0, 'error', null, compileResult.error);
      }
    } catch (error) {
      updateStepStatus(0, 'error', null, { 
        message: `Input parsing error: ${error.message}`,
        type: 'InputError'
      });
    } finally {
      setWorkflowState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleGenerateProof = async () => {
    if (workflowState.isProcessing || !workflowState.zkir) return;

    setWorkflowState(prev => ({ ...prev, isProcessing: true, currentStep: 1 }));
    updateStepStatus(1, 'processing');

    try {
      const publicInputsObj = JSON.parse(publicInputs);
      const privateInputsObj = JSON.parse(privateInputs);
      
      const generateResult = await generateProofFromZKIR(workflowState.zkir, publicInputsObj, privateInputsObj);
      
      if (generateResult.success) {
        updateStepStatus(1, 'completed', generateResult);
        setWorkflowState(prev => ({ 
          ...prev, 
          proof: generateResult.proof,
          currentStep: 2
        }));
      } else {
        updateStepStatus(1, 'error', null, generateResult.error);
      }
    } catch (error) {
      updateStepStatus(1, 'error', null, { 
        message: `Proof generation error: ${error.message}`,
        type: 'GenerationError'
      });
    } finally {
      setWorkflowState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleVerifyProof = async () => {
    if (workflowState.isProcessing || !workflowState.proof) return;

    setWorkflowState(prev => ({ ...prev, isProcessing: true, currentStep: 2 }));
    updateStepStatus(2, 'processing');

    try {
      const verifyResult = await verifyProof(workflowState.proof);
      
      if (verifyResult.success) {
        updateStepStatus(2, 'completed', verifyResult);
        setWorkflowState(prev => ({ ...prev, currentStep: 3 }));
      } else {
        updateStepStatus(2, 'error', null, verifyResult.error);
      }
    } catch (error) {
      updateStepStatus(2, 'error', null, { 
        message: `Verification error: ${error.message}`,
        type: 'VerificationError'
      });
    } finally {
      setWorkflowState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const resetWorkflow = () => {
    setWorkflowState({
      currentStep: 0,
      steps: [
        { id: 'compile', name: 'Compile Circuit', status: 'pending', result: null, error: null },
        { id: 'generate', name: 'Generate Proof', status: 'pending', result: null, error: null },
        { id: 'verify', name: 'Verify Proof', status: 'pending', result: null, error: null }
      ],
      zkir: null,
      proof: null,
      isProcessing: false
    });
  };

  const jumpToStep = (stepIndex) => {
    if (workflowState.isProcessing) return;
    
    const step = workflowState.steps[stepIndex];
    if (step.status === 'completed' || step.status === 'error') {
      setWorkflowState(prev => ({ ...prev, currentStep: stepIndex }));
    }
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'processing':
        return '⏳';
      case 'error':
        return '❌';
      default:
        return '⚪';
    }
  };

  const getStepButtonText = (stepIndex) => {
    const step = workflowState.steps[stepIndex];
    if (step.status === 'processing') {
      return 'Processing...';
    }
    return step.name;
  };

  const canExecuteStep = (stepIndex) => {
    if (workflowState.isProcessing) return false;
    
    switch (stepIndex) {
      case 0:
        return true;
      case 1:
        return workflowState.steps[0].status === 'completed' && workflowState.zkir;
      case 2:
        return workflowState.steps[1].status === 'completed' && workflowState.proof;
      default:
        return false;
    }
  };

  const formatExecutionTime = (ms) => {
    const metrics = formatPerformanceMetrics(ms);
    const indicator = getPerformanceIndicator(metrics.category);
    
    return {
      formatted: metrics.formatted,
      indicator: indicator.indicator,
      color: indicator.color,
      category: metrics.category
    };
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">ZK Proof Workflow</h1>
          <button
            onClick={resetWorkflow}
            disabled={workflowState.isProcessing}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Reset Workflow
          </button>
        </div>

        {/* Service Status Indicator */}
        {serviceStatus && (
          <div className={`mb-6 p-4 rounded-lg border ${
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
            <div className="flex items-center space-x-3">
              <span className="text-lg">
                {serviceStatus.mode === 'production' ? '🟢' : 
                 serviceStatus.mode === 'warning' ? '🟢' : 
                 serviceStatus.mode === 'mock' ? '🟡' : 
                 serviceStatus.mode === 'error' ? '🔴' : '🔵'}
              </span>
              <div>
                <h3 className={`text-sm font-semibold ${
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
                </h3>
                <p className={`text-xs ${
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
                  {serviceStatus.mode === 'mock' 
                    ? 'Demo mode active - proofs are simulated for testing purposes'
                    : serviceStatus.message}
                </p>
                {serviceStatus.mode === 'mock' && serviceStatus.error && (
                  <details className="mt-2">
                    <summary className="text-xs text-yellow-600 cursor-pointer hover:text-yellow-800">
                      View technical details
                    </summary>
                    <div className="mt-1 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                      <strong>Error:</strong> {serviceStatus.error.message}
                      <br />
                      <strong>Type:</strong> {serviceStatus.error.type}
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {workflowState.steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => jumpToStep(index)}
                disabled={step.status === 'pending' || workflowState.isProcessing}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  index === workflowState.currentStep
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : step.status === 'completed'
                    ? 'bg-green-100 border border-green-300 hover:bg-green-200'
                    : step.status === 'error'
                    ? 'bg-red-100 border border-red-300 hover:bg-red-200'
                    : 'bg-gray-100 border border-gray-300'
                } ${step.status === 'pending' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className="text-lg">{getStepIcon(step.status)}</span>
                <span className={`font-medium ${
                  index === workflowState.currentStep
                    ? 'text-blue-800'
                    : step.status === 'completed'
                    ? 'text-green-800'
                    : step.status === 'error'
                    ? 'text-red-800'
                    : 'text-gray-700'
                }`}>{step.name}</span>
              </button>
            ))}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(workflowState.currentStep / workflowState.steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compact Circuit Code
              </label>
              <textarea
                value={compactCode}
                onChange={(e) => setCompactCode(e.target.value)}
                rows={8}
                className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm bg-slate-100 text-gray-900"
                placeholder="Enter your Compact circuit code..."
                disabled={workflowState.isProcessing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Public Inputs (JSON)
              </label>
              <textarea
                value={publicInputs}
                onChange={(e) => setPublicInputs(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm bg-slate-100 text-gray-900"
                placeholder='{"a": 5, "b": 3}'
                disabled={workflowState.isProcessing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Private Inputs (JSON)
              </label>
              <textarea
                value={privateInputs}
                onChange={(e) => setPrivateInputs(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm bg-slate-100 text-gray-900"
                placeholder='{}'
                disabled={workflowState.isProcessing}
              />
            </div>

            {/* Step Action Buttons */}
            <div className="space-y-3">
              <button
                data-testid="compile-circuit-button"
                onClick={handleCompileCircuit}
                disabled={!canExecuteStep(0)}
                className="w-full py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:text-gray-300 min-h-[44px] touch-manipulation active:bg-indigo-800"
              >
                {getStepButtonText(0)}
              </button>
              
              <button
                data-testid="generate-proof-workflow-button"
                onClick={handleGenerateProof}
                disabled={!canExecuteStep(1)}
                className="w-full py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:text-gray-300 min-h-[44px] touch-manipulation active:bg-green-800"
              >
                {getStepButtonText(1)}
              </button>
              
              <button
                data-testid="verify-proof-button"
                onClick={handleVerifyProof}
                disabled={!canExecuteStep(2)}
                className="w-full py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:text-gray-300 min-h-[44px] touch-manipulation active:bg-purple-800"
              >
                {getStepButtonText(2)}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Step Results</h3>
            
            {workflowState.steps.map((step, index) => (
              <div key={step.id} className="space-y-2">
                <div className={`p-4 rounded-md border ${
                  step.status === 'completed'
                    ? 'bg-green-50 border-green-200'
                    : step.status === 'error'
                    ? 'bg-red-50 border-red-200'
                    : step.status === 'processing'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-medium ${
                      step.status === 'completed'
                        ? 'text-green-800'
                        : step.status === 'error'
                        ? 'text-red-800'
                        : step.status === 'processing'
                        ? 'text-blue-800'
                        : 'text-gray-600'
                    }`}>
                      {getStepIcon(step.status)} {step.name}
                    </h4>
                    
                    {step.result?.metadata?.executionTime && (
                      (() => {
                        const timeInfo = formatExecutionTime(step.result.metadata.executionTime);
                        return (
                          <span className={`text-xs bg-white px-2 py-1 rounded border ${
                            timeInfo.color === 'green' ? 'text-green-600 border-green-200' :
                            timeInfo.color === 'yellow' ? 'text-yellow-600 border-yellow-200' :
                            timeInfo.color === 'orange' ? 'text-orange-600 border-orange-200' :
                            timeInfo.color === 'red' ? 'text-red-600 border-red-200' :
                            'text-gray-600 border-gray-200'
                          }`}>
                            {timeInfo.indicator} {timeInfo.formatted}
                          </span>
                        );
                      })()
                    )}
                  </div>
                  
                  {step.status === 'processing' && (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <span data-testid="workflow-processing-indicator" className="text-blue-800 text-sm">Processing...</span>
                    </div>
                  )}
                  
                  {step.result && step.status === 'completed' && (
                    <div className="mt-3 space-y-2">
                      {step.id === 'compile' && (
                        <div>
                          <strong className="text-sm">Circuit Hash:</strong>
                          <p className="text-xs text-gray-600 mt-1 font-mono">
                            {step.result.metadata?.compactCodeHash}
                          </p>
                        </div>
                      )}
                      
                      {step.id === 'generate' && (
                        <div>
                          <strong className="text-sm">Proof Generated:</strong>
                          <pre className="mt-1 text-xs bg-slate-100 text-gray-900 p-2 rounded border overflow-auto max-h-32">
                            {JSON.stringify(step.result.proof, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {step.id === 'verify' && (
                        <div>
                          <strong className="text-sm">Verification Result:</strong>
                          <p className={`text-sm mt-1 font-medium ${
                            step.result.isValid ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {step.result.isValid ? 'VALID ✅' : 'INVALID ❌'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {step.error && step.status === 'error' && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{step.error.category?.icon}</span>
                          <strong className="text-sm text-red-900 font-semibold">{step.error.category?.title}</strong>
                        </div>
                        <p className="text-sm text-red-900 font-medium">{step.error.message}</p>
                        {step.error.type && (
                          <p className="text-xs text-red-800 mt-1 font-medium">Type: {step.error.type}</p>
                        )}
                      </div>
                      
                      {step.error.suggestions && step.error.suggestions.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                          <h5 className="text-sm font-medium text-yellow-800 mb-2">💡 Suggestions:</h5>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            {step.error.suggestions.slice(0, 3).map((suggestion, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-yellow-500 mr-2 mt-0.5">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                          {step.error.suggestions.length > 3 && (
                            <p className="text-xs text-yellow-600 mt-2">
                              +{step.error.suggestions.length - 3} more suggestions available
                            </p>
                          )}
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            if (step.id === 'compile') handleCompileCircuit();
                            else if (step.id === 'generate') handleGenerateProof();
                            else if (step.id === 'verify') handleVerifyProof();
                          }}
                          disabled={workflowState.isProcessing}
                          className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded border border-red-300 disabled:opacity-50"
                        >
                          🔄 Retry
                        </button>
                        <button
                          onClick={() => updateStepStatus(workflowState.steps.findIndex(s => s.id === step.id), 'pending', null, null)}
                          disabled={workflowState.isProcessing}
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 disabled:opacity-50"
                        >
                          ↺ Reset Step
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZKWorkflow;