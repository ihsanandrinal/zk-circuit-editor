// DEFINITIVE MidnightJS Compatibility Layer
// This creates an unoverwritable global state that persists through all library imports

console.log('🌍 Initializing DEFINITIVE MidnightJS compatibility layer...');

// CRITICAL: Set up persistence mechanism BEFORE any library imports
if (typeof window !== 'undefined') {
  console.log('✅ Browser environment detected - setting up persistent compatibility layer');
  
  // BN254 curve field prime used in ZK circuits
  const BN254_FIELD_PRIME = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495616');
  
  // Create the persistent maxField function that cannot be overwritten
  const PERSISTENT_MAX_FIELD = () => {
    console.log('🔧 PERSISTENT maxField called, returning BN254_FIELD_PRIME');
    return BN254_FIELD_PRIME;
  };
  
  // Store the function in a way that survives library overwrites
  window._MIDNIGHT_JS_COMPAT = {
    maxField: PERSISTENT_MAX_FIELD,
    initialized: true,
    timestamp: Date.now()
  };
  
  // Create unoverwritable proxy objects that always return our function
  const createPersistentProxy = (targetName) => {
    const handler = {
      get(target, prop) {
        if (prop === 'maxField') {
          return window._MIDNIGHT_JS_COMPAT.maxField;
        }
        return target[prop];
      },
      set(target, prop, value) {
        if (prop === 'maxField') {
          console.log(`🛡️ Blocked attempt to overwrite ${targetName}.maxField - keeping persistent version`);
          return true; // Pretend we set it, but don't actually change it
        }
        target[prop] = value;
        return true;
      },
      has(target, prop) {
        if (prop === 'maxField') return true;
        return prop in target;
      }
    };
    
    return new Proxy({}, handler);
  };
  
  // Set up persistent proxies for all MidnightJS variable patterns
  window.l = createPersistentProxy('window.l');
  window.u = createPersistentProxy('window.u');
  window.ocrt = createPersistentProxy('window.ocrt');
  window.runtime = createPersistentProxy('window.runtime');
  
  // Also set up on globalThis
  if (typeof globalThis !== 'undefined') {
    globalThis.l = createPersistentProxy('globalThis.l');
    globalThis.u = createPersistentProxy('globalThis.u');
    globalThis.ocrt = createPersistentProxy('globalThis.ocrt');
    globalThis.runtime = createPersistentProxy('globalThis.runtime');
  }
  
  // Add field arithmetic functions to the persistent compatibility layer
  const fieldArithmetic = {
    addField: (a, b) => (BigInt(a) + BigInt(b)) % BN254_FIELD_PRIME,
    mulField: (a, b) => (BigInt(a) * BigInt(b)) % BN254_FIELD_PRIME,
    subField: (a, b) => (BigInt(a) - BigInt(b) + BN254_FIELD_PRIME) % BN254_FIELD_PRIME,
    divField: (a, b) => {
      const modInverse = (a, m) => {
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
    },
    powField: (base, exp) => {
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
    }
  };
  
  // Store arithmetic functions in persistent layer
  Object.assign(window._MIDNIGHT_JS_COMPAT, fieldArithmetic);
  
  // Update proxy handler to include arithmetic functions
  const createEnhancedProxy = (targetName) => {
    const handler = {
      get(target, prop) {
        if (prop === 'maxField') return window._MIDNIGHT_JS_COMPAT.maxField;
        if (prop in window._MIDNIGHT_JS_COMPAT) return window._MIDNIGHT_JS_COMPAT[prop];
        return target[prop];
      },
      set(target, prop, value) {
        if (prop === 'maxField' || prop in window._MIDNIGHT_JS_COMPAT) {
          console.log(`🛡️ Blocked attempt to overwrite ${targetName}.${prop} - keeping persistent version`);
          return true;
        }
        target[prop] = value;
        return true;
      },
      has(target, prop) {
        if (prop === 'maxField' || prop in window._MIDNIGHT_JS_COMPAT) return true;
        return prop in target;
      }
    };
    return new Proxy({}, handler);
  };
  
  // Update all proxies with enhanced handler
  window.l = createEnhancedProxy('window.l');
  window.u = createEnhancedProxy('window.u');
  window.ocrt = createEnhancedProxy('window.ocrt');
  window.runtime = createEnhancedProxy('window.runtime');
  
  if (typeof globalThis !== 'undefined') {
    globalThis.l = createEnhancedProxy('globalThis.l');
    globalThis.u = createEnhancedProxy('globalThis.u');
    globalThis.ocrt = createEnhancedProxy('globalThis.ocrt');
    globalThis.runtime = createEnhancedProxy('globalThis.runtime');
  }
  // Set up monitoring for library overwrites
  const monitorGlobalChanges = () => {
    const originalProxy = window.l;
    
    // Use MutationObserver for DOM changes and polling for object changes
    setInterval(() => {
      // Check if any MidnightJS library has replaced our proxies
      if (window.l !== originalProxy || !window.l.maxField) {
        console.log('🚨 MidnightJS library overwrote global state - restoring persistent layer');
        restorePersistentLayer();
      }
    }, 100); // Check every 100ms
  };
  
  const restorePersistentLayer = () => {
    if (!window._MIDNIGHT_JS_COMPAT) {
      console.error('❌ Persistent compatibility layer was destroyed!');
      return;
    }
    
    // Restore all proxies
    window.l = createEnhancedProxy('window.l');
    window.u = createEnhancedProxy('window.u');
    window.ocrt = createEnhancedProxy('window.ocrt');
    window.runtime = createEnhancedProxy('window.runtime');
    
    if (typeof globalThis !== 'undefined') {
      globalThis.l = createEnhancedProxy('globalThis.l');
      globalThis.u = createEnhancedProxy('globalThis.u');
      globalThis.ocrt = createEnhancedProxy('globalThis.ocrt');
      globalThis.runtime = createEnhancedProxy('globalThis.runtime');
    }
    
    console.log('✅ Persistent compatibility layer restored');
  };
  
  // Start monitoring
  monitorGlobalChanges();
  
  console.log('✅ DEFINITIVE MidnightJS compatibility layer ready with persistent monitoring');
  console.log('🔍 Persistent proxy locations verified:');
  console.log('  - window.l.maxField:', typeof window.l?.maxField);
  console.log('  - window.u.maxField:', typeof window.u?.maxField);
  console.log('  - window.ocrt.maxField:', typeof window.ocrt?.maxField);
  console.log('  - window.runtime.maxField:', typeof window.runtime?.maxField);
  console.log('  - globalThis.l.maxField:', typeof globalThis?.l?.maxField);
  console.log('  - globalThis.u.maxField:', typeof globalThis?.u?.maxField);
  
  // Test the persistent layer
  const testPersistentLayer = () => {
    const testLocations = [
      { name: 'window.l.maxField', fn: window.l?.maxField },
      { name: 'window.u.maxField', fn: window.u?.maxField },
      { name: 'window.ocrt.maxField', fn: window.ocrt?.maxField },
      { name: 'globalThis.l.maxField', fn: globalThis?.l?.maxField }
    ];
    
    testLocations.forEach(location => {
      if (location.fn) {
        try {
          const result = location.fn();
          console.log(`🧪 Testing ${location.name}(): SUCCESS (${typeof result})`);
        } catch (e) {
          console.error(`❌ ${location.name} test failed:`, e.message);
        }
      } else {
        console.warn(`⚠️ ${location.name} not found`);
      }
    });
    
    // Test overwrite protection
    console.log('🛡️ Testing overwrite protection...');
    const originalFn = window.l.maxField;
    window.l.maxField = 'OVERWRITE_ATTEMPT';
    if (window.l.maxField === originalFn) {
      console.log('✅ Overwrite protection working - maxField preserved');
    } else {
      console.error('❌ Overwrite protection failed - maxField was overwritten');
    }
  };
  
  testPersistentLayer();
  
  // Mark the persistent layer as ready
  window._MIDNIGHT_JS_COMPAT.setupComplete = true;
  window._midnightjsGlobalSetupComplete = true;
  
  console.log('🚀 PERSISTENT COMPATIBILITY LAYER ACTIVE - Immune to library overwrites');
} else {
  console.log('🚫 Node.js environment detected - skipping browser-specific global setup');
}

export const isGlobalSetupComplete = () => {
  return typeof window !== 'undefined' && 
         window._MIDNIGHT_JS_COMPAT && 
         window._MIDNIGHT_JS_COMPAT.setupComplete === true;
};

export const getGlobalMaxField = () => {
  if (typeof window !== 'undefined' && window._MIDNIGHT_JS_COMPAT) {
    return window._MIDNIGHT_JS_COMPAT.maxField;
  }
  // Fallback to any available location
  if (typeof window !== 'undefined' && window.l && window.l.maxField) {
    return window.l.maxField;
  }
  return null;
};

// Export the persistent compatibility layer for advanced usage
export const getMidnightJSCompat = () => {
  return typeof window !== 'undefined' ? window._MIDNIGHT_JS_COMPAT : null;
};

// Function to force restoration if needed
export const restoreCompatibilityLayer = () => {
  if (typeof window !== 'undefined' && window._MIDNIGHT_JS_COMPAT) {
    const BN254_FIELD_PRIME = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495616');
    const PERSISTENT_MAX_FIELD = () => BN254_FIELD_PRIME;
    
    const createEnhancedProxy = (targetName) => {
      const handler = {
        get(target, prop) {
          if (prop === 'maxField') return PERSISTENT_MAX_FIELD;
          if (prop in window._MIDNIGHT_JS_COMPAT) return window._MIDNIGHT_JS_COMPAT[prop];
          return target[prop];
        },
        set(target, prop, value) {
          if (prop === 'maxField' || prop in window._MIDNIGHT_JS_COMPAT) {
            console.log(`🛡️ Blocked overwrite of ${targetName}.${prop}`);
            return true;
          }
          target[prop] = value;
          return true;
        },
        has(target, prop) {
          if (prop === 'maxField' || prop in window._MIDNIGHT_JS_COMPAT) return true;
          return prop in target;
        }
      };
      return new Proxy({}, handler);
    };
    
    window.l = createEnhancedProxy('window.l');
    window.u = createEnhancedProxy('window.u');
    window.ocrt = createEnhancedProxy('window.ocrt');
    window.runtime = createEnhancedProxy('window.runtime');
    
    console.log('🔧 Compatibility layer restored manually');
    return true;
  }
  return false;
}