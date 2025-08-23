// test-zk-service.js
import { generateProof } from './src/services/zkService.js';

// Simple test circuit (adjust based on MidnightJS syntax)
const testCircuit = `
function main(public signal input a, private signal input b) {
  signal output c;
  c <== a * b;
}
`;

const testPublicInputs = { a: 3 };
const testPrivateInputs = { b: 4 };

async function testBasicProof() {
  try {
    console.log('🧪 Testing basic proof generation...');
    const result = await generateProof(testCircuit, testPublicInputs, testPrivateInputs);
    console.log('✅ Proof generated successfully');
    console.log('Result type:', typeof result);
    console.log('Result keys:', Object.keys(result));
    return true;
  } catch (error) {
    console.error('❌ Proof generation failed:', error);
    return false;
  }
}

testBasicProof();