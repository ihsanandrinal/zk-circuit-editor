// test-examples.js
import { circuitExamples as examples } from './src/data/examples.js';
import { generateProof } from './src/services/zkService.js';

console.log('Testing example library:');
examples.forEach((example, index) => {
  console.log(`Example ${index}: ${example.title}`);
  console.log('  Has code:', !!example.code);
  console.log('  Has public inputs:', !!example.publicInputs);
  console.log('  Has private inputs:', !!example.privateInputs);
  console.log('  Description length:', example.description?.length || 0);
});

// Run each example through proof generation
const testAllExamples = async () => {
  console.log('\n🚀 Starting proof generation tests...\n');
  
  for (let i = 0; i < examples.length; i++) {
    const example = examples[i];
    console.log(`🧪 Testing example: ${example.title}`);
    
    try {
      const result = await generateProof(
        example.code, 
        example.publicInputs, 
        example.privateInputs
      );
      
      if (result.success) {
        console.log(`✅ ${example.title} - Success`);
        console.log(`   Message: ${result.result?.message || 'No message'}`);
      } else {
        console.log(`❌ ${example.title} - Failed:`, result.error?.message || 'Unknown error');
      }
    } catch (error) {
      console.log(`❌ ${example.title} - Exception:`, error.message);
    }
    
    console.log(''); // Add spacing between tests
  }
  
  console.log('🏁 All tests completed!');
};

// Run the tests
testAllExamples().catch(error => {
  console.error('Test runner failed:', error);
});