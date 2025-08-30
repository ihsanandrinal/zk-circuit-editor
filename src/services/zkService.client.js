// src/services/zkService.client.js

let serviceInstance = null;

export async function getZkService() {
  if (serviceInstance) {
    return serviceInstance;
  }

  const Ledger = await import('@midnight-ntwrk/ledger');
  const OnchainRuntime = await import('@midnight-ntwrk/onchain-runtime');

  // --- THIS IS THE DEBUGGING CODE ---
  console.log("Inspecting @midnight-ntwrk/ledger:", Ledger);
  console.log("Inspecting @midnight-ntwrk/onchain-runtime:", OnchainRuntime);
  // ---------------------------------

  // We are temporarily stopping the code here to prevent the crash.
  // The line below is commented out.
  // await Ledger.default(); 

  // For now, we'll just throw an error to show that inspection is done.
  throw new Error("Inspection complete. Check the browser console.");
}