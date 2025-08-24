'use client';

import React from 'react';

const InputPanel = ({ 
  publicInputs, 
  privateInputs, 
  onPublicInputsChange, 
  onPrivateInputsChange, 
  onGenerateProof, 
  onClearResults,
  loading, 
  errors 
}) => {
  const validateJSON = (jsonString) => {
    try {
      JSON.parse(jsonString);
      return { isValid: true, error: null };
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  };

  const publicInputsValidation = validateJSON(publicInputs);
  const privateInputsValidation = validateJSON(privateInputs);

  return (
    <div className="space-y-4 p-3 lg:p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-base lg:text-lg font-semibold text-gray-800">Circuit Inputs</h3>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <div className={`w-2 h-2 rounded-full ${publicInputsValidation.isValid && privateInputsValidation.isValid ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span>{publicInputsValidation.isValid && privateInputsValidation.isValid ? 'Valid' : 'Invalid JSON'}</span>
        </div>
      </div>
      
      {/* Error Display */}
      {errors && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start">
            <div className="text-red-400 mr-2 text-lg">⚠️</div>
            <div className="text-sm text-red-700 break-words flex-1">{errors}</div>
          </div>
        </div>
      )}
      
      {/* Public Inputs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Public Inputs (JSON)
          </label>
          <div className={`w-2 h-2 rounded-full ${publicInputsValidation.isValid ? 'bg-green-400' : 'bg-red-400'}`}></div>
        </div>
        <textarea
          data-testid="public-inputs"
          value={publicInputs}
          onChange={(e) => onPublicInputsChange(e.target.value)}
          disabled={loading}
          rows={3}
          className={`w-full p-2 lg:p-3 border rounded-md font-mono text-xs sm:text-sm resize-y min-h-[60px]
            ${loading 
              ? 'bg-slate-100 cursor-not-allowed text-gray-900' 
              : publicInputsValidation.isValid
                ? 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-slate-100 text-gray-900'
                : 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50 text-gray-900'
            }`}
          placeholder='{"a": 5, "b": 3}'
        />
        <div className="flex justify-between items-center mt-1">
          <div className="text-xs text-gray-500">
            Values that will be public in the proof
          </div>
          {!publicInputsValidation.isValid && (
            <div className="text-xs text-red-500 truncate max-w-[200px]">
              {publicInputsValidation.error}
            </div>
          )}
        </div>
      </div>

      {/* Private Inputs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Private Inputs (JSON)
          </label>
          <div className={`w-2 h-2 rounded-full ${privateInputsValidation.isValid ? 'bg-green-400' : 'bg-red-400'}`}></div>
        </div>
        <textarea
          value={privateInputs}
          onChange={(e) => onPrivateInputsChange(e.target.value)}
          disabled={loading}
          rows={3}
          className={`w-full p-2 lg:p-3 border rounded-md font-mono text-xs sm:text-sm resize-y min-h-[60px]
            ${loading 
              ? 'bg-slate-100 cursor-not-allowed text-gray-900' 
              : privateInputsValidation.isValid
                ? 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-slate-100 text-gray-900'
                : 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50 text-gray-900'
            }`}
          placeholder='{}'
        />
        <div className="flex justify-between items-center mt-1">
          <div className="text-xs text-gray-500">
            Secret values known only to the prover
          </div>
          {!privateInputsValidation.isValid && (
            <div className="text-xs text-red-500 truncate max-w-[200px]">
              {privateInputsValidation.error}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
        <button
          data-testid="generate-proof-button"
          onClick={onGenerateProof}
          disabled={loading || !publicInputsValidation.isValid || !privateInputsValidation.isValid}
          className={`flex-1 py-3 px-4 font-medium rounded-md transition-colors duration-200 text-sm sm:text-base min-h-[44px] touch-manipulation
            ${loading || !publicInputsValidation.isValid || !privateInputsValidation.isValid
              ? 'bg-gray-400 text-gray-100 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 active:bg-indigo-800'
            }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              <span className="hidden sm:inline">Generating proof...</span>
              <span className="sm:hidden">Generating...</span>
            </span>
          ) : (
            <>
              <span className="hidden sm:inline">Generate ZK Proof</span>
              <span className="sm:hidden">Generate Proof</span>
            </>
          )}
        </button>
        
        <button
          onClick={onClearResults}
          disabled={loading}
          className={`py-3 px-4 font-medium rounded-md border transition-colors duration-200 text-sm sm:text-base sm:min-w-[100px]
            ${loading
              ? 'border-gray-300 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 bg-white'
            }`}
        >
          Clear
        </button>
      </div>

      {/* Validation Summary */}
      {(!publicInputsValidation.isValid || !privateInputsValidation.isValid) && (
        <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
          ⚠️ Fix JSON errors before generating proof
        </div>
      )}
    </div>
  );
};

export default InputPanel;