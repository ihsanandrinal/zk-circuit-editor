// src/hooks/useZkService.js
import { useState, useEffect } from 'react';

// This hook will manage the entire initialization process
export function useZkService() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This function will only run once on the client-side
    async function initialize() {
      try {
        setIsLoading(true);
        console.log('🔄 Starting ZK service initialization...');
        
        // Dynamically import the service ONLY on the client side
        const zkService = await import('../services/zkService');
        
        // Get the service instance and initialize it
        const serviceInstance = zkService.getZkService();
        await serviceInstance.initialize();
        
        console.log('✅ ZK service initialization complete');
        
        // Set state to true once initialization is complete
        setIsInitialized(true);
        setError(null);
      } catch (e) {
        console.error("❌ Failed to initialize ZK service:", e);
        setError(e);
        setIsInitialized(false);
      } finally {
        setIsLoading(false);
      }
    }

    // Prevents this from running during server-side rendering
    if (typeof window !== 'undefined') {
      initialize();
    } else {
      // During SSR, just set loading to false
      setIsLoading(false);
    }
  }, []); // Empty array ensures this runs only once

  return { 
    isInitialized, 
    error, 
    isLoading,
    // Helper to check if we're ready to use ZK functions
    isReady: isInitialized && !error && !isLoading
  };
}