// src/services/zkService.client.js

// This variable will hold our initialized service instance
let serviceInstance = null;

// This is the function our React components will call
export async function getZkService() {
  // If the service is already initialized, return it immediately
  if (serviceInstance) {
    return serviceInstance;
  }

  // Dynamically import the libraries ONLY in the browser
  const Ledger = await import('@midnight-ntwrk/ledger');
  const OnchainRuntime = await import('@midnight-ntwrk/onchain-runtime');

  try {
    console.log("Starting final WASM initialization...");

    // Call the real initialization function we discovered in the console
    Ledger.__wbindgen_init_externref_table();
    OnchainRuntime.__wbindgen_init_externref_table();

    console.log('✅✅✅ MidnightJS WASM modules have been successfully initialized!');

    // Our "service" is the collection of loaded modules
    serviceInstance = {
      Ledger,
      OnchainRuntime,
    };

    return serviceInstance;

  } catch (error) {
    console.error("An error occurred during final WASM initialization:", error);
    throw error;
  }
}