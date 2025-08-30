// src/hooks/useZkService.js
import { useState, useEffect } from 'react';
import { getZkService } from '../services/zkService.client.js';

export function useZkService() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getZkService()
      .then(() => setIsInitialized(true))
      .catch(e => {
        console.error("Hook failed to initialize ZK service:", e);
        setError(e);
      });
  }, []);

  return { isInitialized, error };
}