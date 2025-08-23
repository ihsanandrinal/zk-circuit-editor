// test-error-handling.js
const errorTestCases = [
  {
    name: 'Invalid Compact syntax',
    code: 'invalid compact code here',
    publicInputs: '{"a": 1}',
    privateInputs: '{"b": 2}',
    expectedErrorType: 'CompilationError'
  },
  {
    name: 'Malformed JSON inputs',
    code: 'valid compact code',
    publicInputs: '{invalid json}',
    privateInputs: '{"b": 2}',
    expectedErrorType: 'ValidationError'
  },
  {
    name: 'Missing required inputs',
    code: 'valid compact code',
    publicInputs: '{}',
    privateInputs: '{}',
    expectedErrorType: 'InputError'
  }
];

const testErrorHandling = async () => {
  for (const testCase of errorTestCases) {
    try {
      await generateProof(testCase.code, testCase.publicInputs, testCase.privateInputs);
      console.log(`❌ ${testCase.name} - Should have failed but didn't`);
    } catch (error) {
      const isExpectedError = error.constructor.name === testCase.expectedErrorType ||
                             error.message.includes(testCase.expectedErrorType);
      console.log(`${isExpectedError ? '✅' : '❌'} ${testCase.name} - ${error.message}`);
    }
  }
};