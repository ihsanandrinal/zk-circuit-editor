'use client';

import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In production, you might want to send error reports to a service
    if (process.env.NODE_ENV === 'production') {
      // Example: reportError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
    
    // Clear localStorage if specified
    if (this.props.clearStorageOnReset) {
      localStorage.removeItem('zkCircuitEditor');
    }
  };

  render() {
    if (this.state.hasError) {
      const { fallback: CustomFallback, showDetails = false } = this.props;
      const { error, errorInfo, retryCount } = this.state;
      
      // Use custom fallback if provided
      if (CustomFallback) {
        return (
          <CustomFallback 
            error={error}
            errorInfo={errorInfo}
            onRetry={this.handleRetry}
            onReset={this.handleReset}
            retryCount={retryCount}
          />
        );
      }

      // Default fallback UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-lg w-full">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500 mr-3" />
                <h2 className="text-lg font-semibold text-red-800">
                  Something went wrong
                </h2>
              </div>
              
              <p className="text-red-700 mb-4">
                {this.props.message || 
                 'An unexpected error occurred while rendering this component. Please try refreshing or contact support if the problem persists.'}
              </p>

              {showDetails && error && (
                <details className="mb-4">
                  <summary className="cursor-pointer text-sm font-medium text-red-800 hover:text-red-900">
                    Error Details
                  </summary>
                  <div className="mt-2 p-3 bg-red-100 rounded text-xs font-mono text-red-900 overflow-auto max-h-32">
                    {error.toString()}
                    {errorInfo && errorInfo.componentStack && (
                      <pre className="mt-2 whitespace-pre-wrap">
                        {errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleRetry}
                  disabled={retryCount >= 3}
                  className={`flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors ${
                    retryCount >= 3
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500'
                  }`}
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  {retryCount >= 3 ? 'Max retries reached' : `Retry ${retryCount > 0 ? `(${retryCount}/3)` : ''}`}
                </button>
                
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-md font-medium hover:bg-red-50 focus:ring-2 focus:ring-red-500 transition-colors"
                >
                  Reset Component
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
};

// Higher-order component for easy wrapping
export const withErrorBoundary = (Component, errorBoundaryConfig = {}) => {
  return (props) => (
    <ErrorBoundary {...errorBoundaryConfig}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

export default ErrorBoundary;