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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // CRITICAL: Set up global MidnightJS compatibility immediately before any other scripts load
              // This must run synchronously before any React components or imports execute
              console.log('🚀 Setting up comprehensive MidnightJS compatibility from layout...');
              
              // Ensure this only runs in browser environment
              if (typeof window !== 'undefined') {
                console.log('✅ Browser environment detected, setting up globals...');
              } else {
                console.log('🚫 Server environment detected, skipping browser setup');
                return;
              }
              
              // BN254 curve field prime used in ZK circuits
              const BN254_FIELD_PRIME = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495616');
              
              // Create the maxField function with logging
              const maxFieldFunction = () => {
                console.log('🔧 maxField called from layout setup, returning BN254_FIELD_PRIME');
                return BN254_FIELD_PRIME;
              };
              
              // Set up the global ocrt object with getter/setter protection
              window.ocrt = window.ocrt || {};
              
              // Use Object.defineProperty to create a robust maxField that can't be overwritten
              try {
                Object.defineProperty(window.ocrt, 'maxField', {
                  get() {
                    console.log('🔧 ocrt.maxField getter called from layout setup');
                    return maxFieldFunction;
                  },
                  set(value) {
                    console.log('🔧 Layout setup: Attempt to set ocrt.maxField ignored, keeping our function');
                  },
                  configurable: true,
                  enumerable: true
                });
                console.log('✅ Layout: ocrt.maxField initialized with getter/setter protection');
              } catch (e) {
                window.ocrt.maxField = maxFieldFunction;
                console.log('✅ Layout: ocrt.maxField initialized (fallback method)');
              }
              
              // Set up maxField in ALL possible locations where compact-runtime might look
              if (!window.u) window.u = {};
              window.u.maxField = maxFieldFunction;
              window.maxField = maxFieldFunction;
              
              // Also set up in globalThis
              if (typeof globalThis !== 'undefined') {
                globalThis.maxField = maxFieldFunction;
                if (!globalThis.ocrt) globalThis.ocrt = {};
                globalThis.ocrt.maxField = maxFieldFunction;
              }
              
              // Add other commonly needed ocrt functions
              window.ocrt.addField = (a, b) => (BigInt(a) + BigInt(b)) % BN254_FIELD_PRIME;
              window.ocrt.mulField = (a, b) => (BigInt(a) * BigInt(b)) % BN254_FIELD_PRIME;
              window.ocrt.subField = (a, b) => (BigInt(a) - BigInt(b) + BN254_FIELD_PRIME) % BN254_FIELD_PRIME;
              window.ocrt.divField = (a, b) => {
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
              };
              window.ocrt.powField = (base, exp) => {
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
              
              console.log('✅ Layout: Comprehensive MidnightJS compatibility layer ready');
              console.log('🔍 Layout verification:');
              console.log('  - window.ocrt.maxField:', typeof window.ocrt.maxField);
              console.log('  - window.u.maxField:', typeof window.u.maxField);
              console.log('  - window.maxField:', typeof window.maxField);
              console.log('  - globalThis.ocrt.maxField:', typeof globalThis?.ocrt?.maxField);
              
              // Test the function to make sure it works
              try {
                const testResult = window.ocrt.maxField();
                console.log('✅ Layout: maxField test successful, result type:', typeof testResult);
              } catch (e) {
                console.error('❌ Layout: maxField test failed:', e.message);
              }
              
              window._midnightjsGlobalSetupComplete = true;
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
