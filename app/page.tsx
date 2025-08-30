// app/page.tsx
'use client';

import { useZkService } from '@/src/hooks/useZkService';
import ZKWorkflow from '@/src/components/ZKWorkflow';

export default function Home() {
  // Use our custom hook to get the initialization status
  const { isInitialized, error } = useZkService();

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p className="text-red-500">
          Error loading ZK engine: {error.message}
        </p>
      </main>
    );
  }

  // Show a loading message until the WASM is ready
  if (!isInitialized) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p>Initializing ZK Engine, please wait...</p>
      </main>
    );
  }

  // Once initialized, render the actual application component
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ZKWorkflow />
    </main>
  );
}