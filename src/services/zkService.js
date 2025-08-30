// src/services/zkService.js

// Import the specific modules that require WASM initialization
import * as Ledger from '@midnight-ntwrk/ledger';
import * as OnchainRuntime from '@midnight-ntwrk/onchain-runtime';

// You will likely need these for the proof generation logic later
// import * as ProofProvider from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
// import * as NodeZkConfigProvider from '@midnight-ntwrk/midnight-js-node-zk-config-provider';


let isInitialized = false;

// The updated initialization function
export async function initialize() {
  if (isInitialized) {
    return;
  }

  try {
    console.log("Starting MidnightJS WASM initialization...");

    // Explicitly initialize the 'ledger' module with its WASM file path
    await Ledger.initWasm('/midnight_ledger_wasm_bg.wasm');
    console.log("✅ Ledger WASM initialized successfully!");

    // Explicitly initialize the 'onchain-runtime' module with its WASM file path
    await OnchainRuntime.initWasm('/midnight_onchain_runtime_wasm_bg.wasm');
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