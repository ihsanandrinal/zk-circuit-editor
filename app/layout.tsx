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
        {/* CRITICAL: Smart MidnightJS Compatibility Layer */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // SMART MIDNIGHT JS COMPATIBILITY - MINIMAL BUT EFFECTIVE
              console.log('🎯 Smart MidnightJS Compatibility Loading...');
              
              if (typeof window !== 'undefined') {
                // BN254 field prime
                const BN254_PRIME = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495616');
                
                // Simple, reliable maxField function
                const maxFieldFn = () => BN254_PRIME;
                
                // Only set up what's needed - no over-engineering
                const setupPattern = (pattern) => {
                  if (!window[pattern]) {
                    window[pattern] = {};
                  }
                  
                  // Use a simple getter that's hard to overwrite
                  if (!window[pattern].maxField) {
                    try {
                      Object.defineProperty(window[pattern], 'maxField', {
                        get: () => maxFieldFn,
                        configurable: true,
                        enumerable: true
                      });
                    } catch (e) {
                      window[pattern].maxField = maxFieldFn;
                    }
                  }
                };
                
                // Set up only the patterns that are actually causing errors
                ['l', 'u', 'ocrt'].forEach(setupPattern);
                
                // Also set direct maxField as backup
                if (!window.maxField) {
                  window.maxField = maxFieldFn;
                }
                
                // Light monitoring - only when needed
                let monitorActive = true;
                const smartMonitor = () => {
                  if (!monitorActive) return;
                  
                  ['l', 'u', 'ocrt'].forEach(pattern => {
                    if (window[pattern] && typeof window[pattern].maxField !== 'function') {
                      console.log('🔧 Restoring ' + pattern + '.maxField');
                      setupPattern(pattern);
                    }
                  });
                };
                
                // Monitor less aggressively - every 100ms for first 10 seconds
                const monitorInterval = setInterval(smartMonitor, 100);
                setTimeout(() => {
                  clearInterval(monitorInterval);
                  monitorActive = false;
                  console.log('📱 Smart monitoring complete');
                }, 10000);
                
                // Simple test
                console.log('🧪 Smart compatibility test:');
                console.log('  - window.u.maxField type:', typeof window.u?.maxField);
                console.log('  - window.l.maxField type:', typeof window.l?.maxField);
                
                window._midnightjsGlobalSetupComplete = true;
                console.log('✅ Smart MidnightJS compatibility ready');
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
