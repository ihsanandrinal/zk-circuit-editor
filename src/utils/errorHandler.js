export const ERROR_TYPES = {
  COMPILATION: 'CompilationError',
  PROOF_GENERATION: 'ProofGenerationError', 
  VERIFICATION: 'VerificationError',
  INPUT_VALIDATION: 'InputError',
  NETWORK: 'NetworkError',
  TIMEOUT: 'TimeoutError',
  UNKNOWN: 'UnknownError'
};

export const ERROR_CATEGORIES = {
  [ERROR_TYPES.COMPILATION]: {
    title: 'Circuit Compilation Error',
    color: 'red',
    icon: '⚠️'
  },
  [ERROR_TYPES.PROOF_GENERATION]: {
    title: 'Proof Generation Error', 
    color: 'orange',
    icon: '🔧'
  },
  [ERROR_TYPES.VERIFICATION]: {
    title: 'Proof Verification Error',
    color: 'purple', 
    icon: '🔍'
  },
  [ERROR_TYPES.INPUT_VALIDATION]: {
    title: 'Input Validation Error',
    color: 'yellow',
    icon: '📝'
  },
  [ERROR_TYPES.NETWORK]: {
    title: 'Network Connection Error',
    color: 'blue',
    icon: '🌐'
  },
  [ERROR_TYPES.TIMEOUT]: {
    title: 'Operation Timeout',
    color: 'gray',
    icon: '⏱️'
  },
  [ERROR_TYPES.UNKNOWN]: {
    title: 'Unknown Error',
    color: 'gray',
    icon: '❓'
  }
};

export const getErrorSuggestions = (errorType, errorMessage) => {
  const suggestions = [];
  
  switch (errorType) {
    case ERROR_TYPES.COMPILATION:
      suggestions.push(
        'Check your Compact syntax for typos or missing semicolons',
        'Ensure all functions have proper return types',
        'Verify that all variables are properly declared',
        'Make sure circuit structure follows Compact language rules'
      );
      
      if (errorMessage.includes('syntax')) {
        suggestions.unshift('Syntax error detected - review code for missing brackets, semicolons, or keywords');
      }
      if (errorMessage.includes('type')) {
        suggestions.unshift('Type error detected - check variable types and function signatures');
      }
      break;
      
    case ERROR_TYPES.PROOF_GENERATION:
      suggestions.push(
        'Verify that all public and private inputs match circuit requirements',
        'Check if input values are within valid ranges for your circuit',
        'Ensure the circuit was compiled successfully before generating proof',
        'Try with simpler input values to isolate the issue'
      );
      
      if (errorMessage.includes('input')) {
        suggestions.unshift('Input mismatch - verify input names and types match circuit parameters');
      }
      break;
      
    case ERROR_TYPES.VERIFICATION:
      suggestions.push(
        'Check if the proof was generated correctly',
        'Verify that the same circuit and inputs were used',
        'Ensure no data corruption occurred during proof transfer'
      );
      break;
      
    case ERROR_TYPES.INPUT_VALIDATION:
      suggestions.push(
        'Ensure JSON input is properly formatted',
        'Check for missing quotes around string values',
        'Verify all required input parameters are provided',
        'Remove any trailing commas in JSON objects'
      );
      
      if (errorMessage.includes('JSON')) {
        suggestions.unshift('JSON parsing error - check for proper brackets, quotes, and comma usage');
      }
      break;
      
    case ERROR_TYPES.NETWORK:
      suggestions.push(
        'Check your internet connection',
        'Verify the ZK service endpoint is accessible',
        'Try again in a few moments - the service might be temporarily unavailable',
        'Check if firewall or proxy settings are blocking the connection'
      );
      break;
      
    case ERROR_TYPES.TIMEOUT:
      suggestions.push(
        'Try with a simpler circuit to reduce computation time',
        'Check your internet connection stability',
        'The operation might succeed if you try again',
        'Consider breaking complex circuits into smaller parts'
      );
      break;
      
    default:
      suggestions.push(
        'Try refreshing the page and attempting the operation again',
        'Check the browser console for additional error details',
        'Verify all inputs are correct and try with simpler values',
        'If the problem persists, the service might be experiencing issues'
      );
  }
  
  return suggestions;
};

export const categorizeError = (error) => {
  let errorType = ERROR_TYPES.UNKNOWN;
  let errorMessage = error?.message || 'An unknown error occurred';
  
  if (error?.type) {
    errorType = error.type;
  } else {
    // Try to categorize based on error message content
    const message = errorMessage.toLowerCase();
    
    if (message.includes('compile') || message.includes('syntax') || message.includes('parse')) {
      errorType = ERROR_TYPES.COMPILATION;
    } else if (message.includes('json') || message.includes('invalid') && message.includes('input')) {
      errorType = ERROR_TYPES.INPUT_VALIDATION;
    } else if (message.includes('proof') && message.includes('generat')) {
      errorType = ERROR_TYPES.PROOF_GENERATION;
    } else if (message.includes('verif') || message.includes('valid')) {
      errorType = ERROR_TYPES.VERIFICATION;
    } else if (message.includes('network') || message.includes('connection') || message.includes('fetch')) {
      errorType = ERROR_TYPES.NETWORK;
    } else if (message.includes('timeout') || message.includes('time')) {
      errorType = ERROR_TYPES.TIMEOUT;
    }
  }
  
  return {
    type: errorType,
    message: errorMessage,
    category: ERROR_CATEGORIES[errorType] || ERROR_CATEGORIES[ERROR_TYPES.UNKNOWN],
    suggestions: getErrorSuggestions(errorType, errorMessage),
    timestamp: new Date().toISOString()
  };
};

export const formatPerformanceMetrics = (executionTime) => {
  const metrics = {
    executionTime,
    formatted: '',
    category: ''
  };
  
  if (executionTime < 100) {
    metrics.formatted = `${Math.round(executionTime)}ms`;
    metrics.category = 'very-fast';
  } else if (executionTime < 1000) {
    metrics.formatted = `${Math.round(executionTime)}ms`;
    metrics.category = 'fast';
  } else if (executionTime < 5000) {
    metrics.formatted = `${(executionTime / 1000).toFixed(2)}s`;
    metrics.category = 'normal';
  } else if (executionTime < 30000) {
    metrics.formatted = `${(executionTime / 1000).toFixed(1)}s`;
    metrics.category = 'slow';
  } else {
    metrics.formatted = `${(executionTime / 1000).toFixed(1)}s`;
    metrics.category = 'very-slow';
  }
  
  return metrics;
};

export const getPerformanceIndicator = (category) => {
  switch (category) {
    case 'very-fast':
      return { color: 'green', indicator: '🚀' };
    case 'fast': 
      return { color: 'green', indicator: '⚡' };
    case 'normal':
      return { color: 'yellow', indicator: '⏱️' };
    case 'slow':
      return { color: 'orange', indicator: '🐌' };
    case 'very-slow':
      return { color: 'red', indicator: '🐢' };
    default:
      return { color: 'gray', indicator: '⏱️' };
  }
};