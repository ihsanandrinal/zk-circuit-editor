// src/hooks/useZkService.ts
import { useState, useEffect } from 'react';
import { getZkService } from '../services/zkService.client.js';

// We now use TypeScript generics to define the state's type
export function useZkService() {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null); // This is the key change

  useEffect(() => {
    getZkService()
      .then(() => setIsInitialized(true))
      .catch((e: unknown) => { // Catching errors safely
        console.error("Hook failed to initialize ZK service:", e);
        if (e instanceof Error) {
          setError(e);
        } else {
          setError(new Error('An unknown error occurred during initialization.'));
        }
      });
  }, []);

  return { isInitialized, error };
}