// test-validation.js
const testInputs = [
  { input: '{"a": 1}', shouldPass: true, name: 'Valid JSON' },
  { input: '{a: 1}', shouldPass: false, name: 'Invalid JSON (no quotes)' },
  { input: '{"a": "text"}', shouldPass: true, name: 'String value' },
  { input: '', shouldPass: false, name: 'Empty input' },
  { input: 'not json', shouldPass: false, name: 'Not JSON' }
];

testInputs.forEach(test => {
  try {
    JSON.parse(test.input);
    const result = test.shouldPass ? '✅ PASS' : '❌ FAIL (should have failed)';
    console.log(`${result}: ${test.name}`);
  } catch (error) {
    const result = !test.shouldPass ? '✅ PASS' : '❌ FAIL (should have passed)';
    console.log(`${result}: ${test.name}`);
  }
});