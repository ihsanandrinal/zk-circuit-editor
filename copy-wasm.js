// copy-wasm.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wasmFiles = [
  'node_modules/@midnight-ntwrk/ledger/midnight_ledger_wasm_bg.wasm',
  'node_modules/@midnight-ntwrk/onchain-runtime/midnight_onchain_runtime_wasm_bg.wasm'
];

const destDir = path.join(__dirname, 'public');

// Create the public directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy each WASM file to the public directory
wasmFiles.forEach(file => {
  const sourcePath = path.join(__dirname, file);
  const destPath = path.join(destDir, path.basename(file));
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${path.basename(file)} to public directory.`);
  } else {
    console.error(`Error: WASM file not found at ${sourcePath}`);
  }
});