// src/services/zkService.js

// Import the default export from each WASM-dependent module
import initLedger from '@midnight-ntwrk/ledger';
import initOnchainRuntime from '@midnight-ntwrk/onchain-runtime';

let isInitialized = false;

// Simple service object to match expected interface
const zkService = {
  isInitialized: () => isInitialized,
  initialize: null, // Will be set below
  generateProof: null // Will be set below
};

// The updated initialization function
export async function initialize() {
  if (isInitialized) {
    return;
  }

  try {
    console.log("Starting MidnightJS WASM initialization...");

    // Call the default export as a function, passing the path to the WASM file
    await initLedger('/midnight_ledger_wasm_bg.wasm');
    console.log("✅ Ledger WASM initialized successfully!");

    // Do the same for the onchain-runtime module
    await initOnchainRuntime('/midnight_onchain_runtime_wasm_bg.wasm');
    console.log("✅ OnchainRuntime WASM initialized successfully!");

    isInitialized = true;
    console.log("All ZK services initialized successfully!");

  } catch (error) {
    console.error("An error occurred during WASM initialization:", error);
    // Re-throw the error so the UI can catch it
    throw error;
  }
}

// Your existing generateProof function
export async function generateProof(circuit, publicInputs, privateInputs) {
  if (!isInitialized) {
    throw new Error("ZK Service is not initialized. Please call initialize() first.");
  }
  
  // ... your proof generation logic will go here
  console.log("Proof generation called.");
}

// Set the functions on the service object
zkService.initialize = initialize;
zkService.generateProof = generateProof;

// Export the getZkService function that other files expect
export const getZkService = () => zkService;