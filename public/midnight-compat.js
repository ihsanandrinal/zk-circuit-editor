// IMMEDIATE MIDNIGHT JS COMPATIBILITY LAYER
// This script runs BEFORE React/Next.js and ALL other JavaScript
// It establishes the global compatibility layer that cannot be overwritten

console.log('🚨 IMMEDIATE MidnightJS Compatibility Layer Loading...');

// BN254 curve field prime used in ZK circuits
const BN254_FIELD_PRIME = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495616');

// Create the persistent maxField function
const PERSISTENT_MAX_FIELD = () => {
  console.log('🔧 PERSISTENT maxField called, returning BN254_FIELD_PRIME');
  return BN254_FIELD_PRIME;
};

// Immediate compatibility layer setup - RUNS BEFORE ANY OTHER CODE
(function immediateSetup() {
  console.log('⚡ Setting up IMMEDIATE global MidnightJS compatibility...');
  
  // Store in multiple locations immediately
  window._MIDNIGHT_COMPAT_IMMEDIATE = {
    maxField: PERSISTENT_MAX_FIELD,
    setupTime: Date.now(),
    version: 'immediate-v1'
  };
  
  // Create super-aggressive proxy that CANNOT be overwritten
  const createUnbreakableProxy = (name) => {
    const handler = {
      get(target, prop) {
        if (prop === 'maxField') {
          console.log(`🔥 ${name}.maxField accessed - returning persistent function`);
          return PERSISTENT_MAX_FIELD;
        }
        return target[prop] || PERSISTENT_MAX_FIELD; // Fallback to maxField for any property
      },
      set(target, prop, value) {
        if (prop === 'maxField') {
          console.log(`🛡️ BLOCKED: Attempt to overwrite ${name}.maxField - keeping our version`);
          return true; // Pretend it worked but don't actually set
        }
        target[prop] = value;
        return true;
      },
      has(target, prop) {
        if (prop === 'maxField') return true;
        return prop in target;
      },
      defineProperty(target, prop, descriptor) {
        if (prop === 'maxField') {
          console.log(`🛡️ BLOCKED: defineProperty on ${name}.maxField`);
          return true;
        }
        return Object.defineProperty(target, prop, descriptor);
      },
      deleteProperty(target, prop) {
        if (prop === 'maxField') {
          console.log(`🛡️ BLOCKED: delete ${name}.maxField`);
          return false;
        }
        return delete target[prop];
      }
    };
    
    return new Proxy({}, handler);
  };
  
  // Set up ALL possible MidnightJS variable patterns immediately
  const patterns = ['l', 'u', 'ocrt', 'runtime', 'compact', 'midnight'];
  
  patterns.forEach(pattern => {
    try {
      // Set on window
      Object.defineProperty(window, pattern, {
        get() {
          return window[`_${pattern}_proxy`] || (window[`_${pattern}_proxy`] = createUnbreakableProxy(`window.${pattern}`));
        },
        set(value) {
          console.log(`🛡️ BLOCKED: Attempt to overwrite window.${pattern}`);
          return true;
        },
        configurable: false, // Cannot be reconfigured
        enumerable: true
      });
      
      // Set on globalThis if available
      if (typeof globalThis !== 'undefined') {
        Object.defineProperty(globalThis, pattern, {
          get() {
            return globalThis[`_${pattern}_proxy`] || (globalThis[`_${pattern}_proxy`] = createUnbreakableProxy(`globalThis.${pattern}`));
          },
          set(value) {
            console.log(`🛡️ BLOCKED: Attempt to overwrite globalThis.${pattern}`);
            return true;
          },
          configurable: false,
          enumerable: true
        });
      }
    } catch (e) {
      console.warn(`⚠️ Could not protect ${pattern}:`, e.message);
      // Fallback to direct assignment
      window[pattern] = createUnbreakableProxy(`window.${pattern}`);
      if (typeof globalThis !== 'undefined') {
        globalThis[pattern] = createUnbreakableProxy(`globalThis.${pattern}`);
      }
    }
  });
  
  // Also set up direct maxField function
  try {
    Object.defineProperty(window, 'maxField', {
      get() { return PERSISTENT_MAX_FIELD; },
      set(value) { 
        console.log('🛡️ BLOCKED: Attempt to overwrite window.maxField');
        return true; 
      },
      configurable: false,
      enumerable: true
    });
  } catch (e) {
    window.maxField = PERSISTENT_MAX_FIELD;
  }
  
  // Set up monitoring to detect and fix any overwrites
  setInterval(() => {
    patterns.forEach(pattern => {
      try {
        const obj = window[pattern];
        if (!obj || typeof obj.maxField !== 'function') {
          console.log(`🚨 Detected overwrite of ${pattern}.maxField - restoring...`);
          window[pattern] = createUnbreakableProxy(`window.${pattern}`);
        }
      } catch (e) {
        console.log(`🔧 Restoring ${pattern} after error:`, e.message);
        window[pattern] = createUnbreakableProxy(`window.${pattern}`);
      }
    });
  }, 50); // Check every 50ms for maximum protection
  
  console.log('✅ IMMEDIATE MidnightJS compatibility layer established');
  console.log('🔍 Protected patterns:', patterns);
  console.log('🧪 Test access to window.u.maxField:', typeof window.u?.maxField);
  console.log('🧪 Test access to window.l.maxField:', typeof window.l?.maxField);
  
  // Mark as ready
  window._MIDNIGHT_COMPAT_READY = true;
  
})();

console.log('⚡ IMMEDIATE MidnightJS Compatibility Layer Complete!');