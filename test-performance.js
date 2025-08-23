// test-performance.js
const performanceTest = async () => {
  const start = performance.now();
  
  try {
    const result = await generateProof(testCircuit, testPublicInputs, testPrivateInputs);
    const end = performance.now();
    const duration = end - start;
    
    console.log(`⏱️ Proof generation took ${duration.toFixed(2)}ms`);
    console.log(`Memory usage: ${JSON.stringify(performance.memory || {})}`);
    
    // Test with larger circuit for performance baseline
    if (duration > 10000) { // 10 seconds
      console.log('⚠️ Performance warning: Proof generation is slow');
    }
    
  } catch (error) {
    console.log('❌ Performance test failed:', error.message);
  }
};