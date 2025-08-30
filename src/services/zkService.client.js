// src/services/zkService.client.js

// This variable will hold our initialized service instance
let serviceInstance = null;

// This is the function our React components will call
export async function getZkService() {
  // If the service is already initialized, return it immediately
  if (serviceInstance) {
    return serviceInstance;
  }

  // Use dynamic imports to load these libraries ONLY in the browser
  const Ledger = await import('@midnight-ntwrk/ledger');
  const OnchainRuntime = await import('@midnight-ntwrk/onchain-runtime');
  // Add any other MidnightJS modules you need here

  // The 'default' property is often the main class in these modules
  // This is the step that likely initializes the WASM
  await Ledger.default();
  await OnchainRuntime.default();

  console.log('✅ MidnightJS WASM modules have been initialized.');

  // Our "service" is the collection of loaded modules
  serviceInstance = {
    Ledger,
    OnchainRuntime,
    // Add other modules here
  };

  return serviceInstance;
}