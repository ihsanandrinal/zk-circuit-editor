// Global setup for MidnightJS compatibility
// This module MUST be imported before any MidnightJS modules to prevent ocrt.maxField errors

// Set up global ocrt object immediately when this module is loaded
if (typeof window !== 'undefined') {
  console.log('🌍 Setting up global MidnightJS compatibility layer...');
  
  // BN254 curve field prime used in ZK circuits
  const BN254_FIELD_PRIME = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495616');
  
  // Create the maxField function
  const maxFieldFunction = () => {
    console.log('🔧 maxField called, returning BN254_FIELD_PRIME');
    return BN254_FIELD_PRIME;
  };
  
  // Set up the global ocrt object with a getter/setter that always works
  if (!window.ocrt) {
    window.ocrt = {};
  }
  
  // Use Object.defineProperty to create a more robust maxField
  try {
    Object.defineProperty(window.ocrt, 'maxField', {
      get() {
        console.log('🔧 ocrt.maxField getter called');
        return maxFieldFunction;
      },
      set(_value) { // eslint-disable-line @typescript-eslint/no-unused-vars
        console.log('🔧 Attempt to set ocrt.maxField, ignoring and keeping our function');
        // Ignore attempts to overwrite - keep our function
      },
      configurable: true,
      enumerable: true
    });
    console.log('✅ Global ocrt.maxField initialized with getter/setter protection');
  } catch (_e) { // eslint-disable-line @typescript-eslint/no-unused-vars
    // Fallback to simple assignment
    window.ocrt.maxField = maxFieldFunction;
    console.log('✅ Global ocrt.maxField initialized (fallback method)');
  }
  
  // Add other commonly needed ocrt functions as placeholders
  if (!window.ocrt.addField) {
    window.ocrt.addField = (a, b) => (BigInt(a) + BigInt(b)) % BN254_FIELD_PRIME;
  }
  
  if (!window.ocrt.mulField) {
    window.ocrt.mulField = (a, b) => (BigInt(a) * BigInt(b)) % BN254_FIELD_PRIME;
  }
  
  if (!window.ocrt.subField) {
    window.ocrt.subField = (a, b) => (BigInt(a) - BigInt(b) + BN254_FIELD_PRIME) % BN254_FIELD_PRIME;
  }
  
  // Add divField for completeness
  if (!window.ocrt.divField) {
    window.ocrt.divField = (a, b) => {
      // Modular division: a / b mod p = a * b^(-1) mod p
      const modInverse = (a, m) => {
        // Extended Euclidean Algorithm for modular inverse
        const extgcd = (a, b) => {
          if (a === 0n) return [b, 0n, 1n];
          const [g, y1, x1] = extgcd(b % a, a);
          const y = x1 - (b / a) * y1;
          const x = y1;
          return [g, x, y];
        };
        
        const [g, x] = extgcd(a % m, m);
        if (g !== 1n) throw new Error('Modular inverse does not exist');
        return (x % m + m) % m;
      };
      
      const bInverse = modInverse(BigInt(b), BN254_FIELD_PRIME);
      return (BigInt(a) * bInverse) % BN254_FIELD_PRIME;
    };
  }
  
  // Add powField for exponentiation
  if (!window.ocrt.powField) {
    window.ocrt.powField = (base, exp) => {
      // Fast exponentiation modulo field prime
      let result = 1n;
      base = BigInt(base) % BN254_FIELD_PRIME;
      exp = BigInt(exp);
      
      while (exp > 0n) {
        if (exp % 2n === 1n) {
          result = (result * base) % BN254_FIELD_PRIME;
        }
        exp = exp / 2n;
        base = (base * base) % BN254_FIELD_PRIME;
      }
      
      return result;
    };
  }
  
  // Set up maxField in ALL possible locations where compact-runtime might look
  if (!window.u) window.u = {};
  window.u.maxField = maxFieldFunction;
  window.maxField = maxFieldFunction;
  
  // Also try setting it as a global variable
  if (typeof globalThis !== 'undefined') {
    globalThis.maxField = maxFieldFunction;
    if (!globalThis.ocrt) globalThis.ocrt = {};
    globalThis.ocrt.maxField = maxFieldFunction;
  }
  
  // Set up in self (for web workers)
  if (typeof self !== 'undefined' && self !== window) {
    if (!self.ocrt) self.ocrt = {};
    self.ocrt.maxField = maxFieldFunction;
    self.maxField = maxFieldFunction;
  }
  
  console.log('✅ Global MidnightJS compatibility layer ready with field arithmetic');
  console.log('🔍 maxField locations set up:');
  console.log('  - window.ocrt.maxField:', typeof window.ocrt.maxField);
  console.log('  - window.u.maxField:', typeof window.u.maxField);
  console.log('  - window.maxField:', typeof window.maxField);
  console.log('  - globalThis.ocrt.maxField:', typeof globalThis?.ocrt?.maxField);
  
  // Mark that we've set up the global environment
  window._midnightjsGlobalSetupComplete = true;
} else {
  console.log('🚫 Non-browser environment detected, skipping global setup');
}

export const isGlobalSetupComplete = () => {
  return typeof window !== 'undefined' && window._midnightjsGlobalSetupComplete === true;
};

export const getGlobalMaxField = () => {
  if (typeof window !== 'undefined' && window.ocrt && window.ocrt.maxField) {
    return window.ocrt.maxField;
  }
  return null;
};