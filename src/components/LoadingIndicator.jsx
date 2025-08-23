'use client';

import React from 'react';

const LoadingIndicator = ({ message = "Processing..." }) => {
  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50">
      <div className="bg-white border border-indigo-200 rounded-lg shadow-lg p-3 sm:p-4 flex items-center justify-center sm:justify-start space-x-3 mx-auto sm:mx-0 max-w-sm">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 flex-shrink-0"></div>
        <span className="text-gray-700 font-medium text-sm sm:text-base truncate">{message}</span>
      </div>
    </div>
  );
};

export default LoadingIndicator;