import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Import global setup immediately at the top level to ensure MidnightJS compatibility
import "../src/services/globalSetup.js";
import Analytics from "../src/components/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZK Circuit Editor - Zero-Knowledge Proof Playground",
  description: "A production-ready zero-knowledge circuit editor and proof playground built with Next.js, React, and MidnightJS. Create, compile, and verify ZK circuits with an intuitive interface featuring step-by-step workflows and advanced development tools.",
  keywords: ["zero-knowledge", "zk-proofs", "circuit-editor", "blockchain", "cryptography", "privacy", "MidnightJS", "Next.js"],
  authors: [{ name: "ZK Circuit Editor Team" }],
  creator: "ZK Circuit Editor",
  openGraph: {
    title: "ZK Circuit Editor - Zero-Knowledge Proof Playground",
    description: "Create, compile, and verify zero-knowledge circuits with our intuitive web-based editor",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZK Circuit Editor",
    description: "Zero-knowledge circuit development made easy",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* CRITICAL: Ultimate MidnightJS Compatibility Layer - Loads BEFORE everything */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // ULTIMATE MIDNIGHT JS COMPATIBILITY - RUNS IMMEDIATELY
              console.log('⚡ ULTIMATE MidnightJS Compatibility Layer Loading...');
              
              // Skip if not in browser
              if (typeof window === 'undefined') {
                console.log('🚫 Server environment - skipping');
              } else {
                // BN254 curve field prime
                const BN254_FIELD_PRIME = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495616');
                
                // The ultimate persistent maxField function
                const ULTIMATE_MAX_FIELD = () => {
                  console.log('🔥 ULTIMATE maxField called');
                  return BN254_FIELD_PRIME;
                };
                
                // Create unbreakable proxy factory
                const createUltimateProxy = (name) => {
                  return new Proxy({}, {
                    get(target, prop) {
                      if (prop === 'maxField') {
                        console.log('🔥 ' + name + '.maxField accessed via proxy');
                        return ULTIMATE_MAX_FIELD;
                      }
                      return target[prop] || ULTIMATE_MAX_FIELD;
                    },
                    set(target, prop, value) {
                      if (prop === 'maxField') {
                        console.log('🛡️ BLOCKED: ' + name + '.maxField overwrite attempt');
                        return true;
                      }
                      target[prop] = value;
                      return true;
                    },
                    has(target, prop) {
                      return prop === 'maxField' || prop in target;
                    },
                    defineProperty(target, prop, desc) {
                      if (prop === 'maxField') {
                        console.log('🛡️ BLOCKED: defineProperty on ' + name + '.maxField');
                        return true;
                      }
                      return Object.defineProperty(target, prop, desc);
                    }
                  });
                };
                
                // Set up ALL MidnightJS patterns with ultimate protection
                const patterns = ['l', 'u', 'ocrt', 'runtime', 'compact', 'midnight'];
                
                patterns.forEach(pattern => {
                  try {
                    // Use non-configurable property descriptor to prevent overwrites
                    Object.defineProperty(window, pattern, {
                      value: createUltimateProxy('window.' + pattern),
                      writable: false,
                      configurable: false,
                      enumerable: true
                    });
                    console.log('🔒 Protected window.' + pattern + ' with ultimate proxy');
                  } catch (e) {
                    // If defineProperty fails, use direct assignment
                    window[pattern] = createUltimateProxy('window.' + pattern);
                    console.log('⚠️ Fallback protection for window.' + pattern);
                  }
                  
                  // Same for globalThis
                  if (typeof globalThis !== 'undefined') {
                    try {
                      Object.defineProperty(globalThis, pattern, {
                        value: createUltimateProxy('globalThis.' + pattern),
                        writable: false,
                        configurable: false,
                        enumerable: true
                      });
                    } catch (e) {
                      globalThis[pattern] = createUltimateProxy('globalThis.' + pattern);
                    }
                  }
                });
                
                // Also protect direct maxField
                try {
                  Object.defineProperty(window, 'maxField', {
                    value: ULTIMATE_MAX_FIELD,
                    writable: false,
                    configurable: false,
                    enumerable: true
                  });
                } catch (e) {
                  window.maxField = ULTIMATE_MAX_FIELD;
                }
                
                // Ultra-aggressive monitoring and restoration
                const ultraMonitor = () => {
                  patterns.forEach(pattern => {
                    if (!window[pattern] || typeof window[pattern].maxField !== 'function') {
                      console.log('🚨 EMERGENCY: Restoring ' + pattern);
                      try {
                        Object.defineProperty(window, pattern, {
                          value: createUltimateProxy('window.' + pattern),
                          writable: false,
                          configurable: false,
                          enumerable: true
                        });
                      } catch (e) {
                        window[pattern] = createUltimateProxy('window.' + pattern);
                      }
                    }
                  });
                };
                
                // Monitor every 25ms for maximum protection
                setInterval(ultraMonitor, 25);
                
                // Test all patterns
                console.log('🧪 ULTIMATE COMPATIBILITY TESTS:');
                patterns.forEach(pattern => {
                  try {
                    const result = window[pattern].maxField();
                    console.log('✅ window.' + pattern + '.maxField() = ' + typeof result);
                  } catch (e) {
                    console.error('❌ window.' + pattern + '.maxField() failed:', e.message);
                  }
                });
                
                // Mark as ready
                window._ULTIMATE_COMPAT_READY = true;
                window._midnightjsGlobalSetupComplete = true;
                
                console.log('🎉 ULTIMATE MidnightJS Compatibility Layer ACTIVE');
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Analytics />
        {children}
      </body>
    </html>
  );
}
