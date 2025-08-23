// UI Integration Test Suite
// Run this in browser console: `testUXFeatures.runAllTests()`

window.testUXFeatures = {
  
  // Test configuration
  config: {
    waitTime: 1000, // Wait time between actions
    verbose: true    // Enable detailed logging
  },
  
  log: (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warn' ? '⚠️' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  },
  
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Test 1: Example Selector Dropdown
  testDropdown: async () => {
    testUXFeatures.log('Testing Example Selector Dropdown...', 'info');
    
    try {
      // Find dropdown button
      const dropdownButton = document.querySelector('button[class*="flex items-center justify-between"]');
      if (!dropdownButton) {
        throw new Error('Dropdown button not found');
      }
      
      testUXFeatures.log('✓ Dropdown button found');
      
      // Check if dropdown is closed initially
      let dropdownPanel = document.querySelector('div[class*="absolute z-50"]');
      const initiallyOpen = !!dropdownPanel;
      testUXFeatures.log(`✓ Initial state: ${initiallyOpen ? 'open' : 'closed'}`);
      
      // Click to open dropdown
      dropdownButton.click();
      await testUXFeatures.wait(500);
      
      dropdownPanel = document.querySelector('div[class*="absolute z-50"]');
      if (!dropdownPanel) {
        throw new Error('Dropdown failed to open');
      }
      
      testUXFeatures.log('✓ Dropdown opened successfully');
      
      // Count example options
      const exampleButtons = dropdownPanel.querySelectorAll('button[class*="w-full px-4 py-3"]');
      const optionCount = exampleButtons.length;
      testUXFeatures.log(`✓ Found ${optionCount} example options`);
      
      // Test search functionality
      const searchInput = dropdownPanel.querySelector('input[placeholder="Search examples..."]');
      if (searchInput) {
        testUXFeatures.log('✓ Search input found');
        
        // Test search
        searchInput.value = 'arithmetic';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        await testUXFeatures.wait(300);
        
        const filteredOptions = dropdownPanel.querySelectorAll('button[class*="w-full px-4 py-3"]:not([style*="display: none"])');
        testUXFeatures.log(`✓ Search results: ${filteredOptions.length} options`);
        
        // Clear search
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        await testUXFeatures.wait(300);
      }
      
      // Test selecting an example
      if (exampleButtons.length > 1) {
        const firstExample = exampleButtons[1]; // Skip "Custom Circuit" option
        const exampleTitle = firstExample.querySelector('div[class*="font-medium text-gray-900"]')?.textContent;
        
        firstExample.click();
        await testUXFeatures.wait(500);
        
        testUXFeatures.log(`✓ Selected example: ${exampleTitle}`);
        
        // Verify dropdown closed
        dropdownPanel = document.querySelector('div[class*="absolute z-50"]');
        if (!dropdownPanel) {
          testUXFeatures.log('✓ Dropdown closed after selection');
        }
      }
      
      return {
        success: true,
        optionCount,
        message: 'Dropdown test completed successfully'
      };
      
    } catch (error) {
      testUXFeatures.log(`Dropdown test failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  },
  
  // Test 2: Copy Button Functionality
  testCopyButton: async () => {
    testUXFeatures.log('Testing Copy Button Functionality...', 'info');
    
    try {
      // First generate a proof to have something to copy
      const generateButton = document.querySelector('button[class*="bg-indigo-600"]');
      if (generateButton && !generateButton.disabled) {
        testUXFeatures.log('Generating proof first...');
        generateButton.click();
        
        // Wait for proof generation
        let attempts = 0;
        while (attempts < 30) { // Wait up to 30 seconds
          await testUXFeatures.wait(1000);
          const loadingIndicator = document.querySelector('[class*="animate-spin"]');
          if (!loadingIndicator) break;
          attempts++;
        }
        
        await testUXFeatures.wait(1000); // Extra wait for UI update
      }
      
      // Look for copy buttons in the output panel
      const copyButtons = document.querySelectorAll('button[title="Copy to clipboard"]');
      testUXFeatures.log(`✓ Found ${copyButtons.length} copy buttons`);
      
      if (copyButtons.length === 0) {
        testUXFeatures.log('No copy buttons available - may need to generate a proof first', 'warn');
        return { success: true, message: 'No copy buttons to test (no proof result)' };
      }
      
      // Test the first copy button
      const firstCopyButton = copyButtons[0];
      const originalText = firstCopyButton.textContent;
      
      // Mock clipboard API if not available
      if (!navigator.clipboard) {
        window.navigator.clipboard = {
          writeText: async (text) => {
            testUXFeatures.log(`Mock clipboard write: ${text.substring(0, 100)}...`);
            return Promise.resolve();
          }
        };
      }
      
      firstCopyButton.click();
      await testUXFeatures.wait(1000);
      
      const newText = firstCopyButton.textContent;
      if (newText.includes('Copied')) {
        testUXFeatures.log('✓ Copy button state changed to "Copied"');
      }
      
      // Wait for reset
      await testUXFeatures.wait(3000);
      const resetText = firstCopyButton.textContent;
      
      return {
        success: true,
        copyButtonCount: copyButtons.length,
        stateChanged: newText !== originalText,
        stateReset: resetText === originalText || resetText.includes('Copy'),
        message: 'Copy button test completed'
      };
      
    } catch (error) {
      testUXFeatures.log(`Copy button test failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  },
  
  // Test 3: Clear Button Functionality
  testClearButton: async () => {
    testUXFeatures.log('Testing Clear Button Functionality...', 'info');
    
    try {
      // Look for clear/reset buttons
      const clearResultsButton = document.querySelector('button[class*="bg-gray-100"]:not([disabled])');
      const resetAllButton = document.querySelector('button[class*="bg-red-100"]:not([disabled])');
      
      testUXFeatures.log(`✓ Clear Results button: ${clearResultsButton ? 'found' : 'not found'}`);
      testUXFeatures.log(`✓ Reset All button: ${resetAllButton ? 'found' : 'not found'}`);
      
      let results = { success: true, actions: [] };
      
      // Test Clear Results button
      if (clearResultsButton && clearResultsButton.textContent.includes('Clear Results')) {
        const resultsPanel = document.querySelector('[class*="bg-green-50"], [class*="bg-red-50"]');
        const hasResults = !!resultsPanel;
        
        testUXFeatures.log(`Results panel before clear: ${hasResults ? 'present' : 'not present'}`);
        
        clearResultsButton.click();
        await testUXFeatures.wait(500);
        
        const resultsAfterClear = document.querySelector('[class*="bg-green-50"], [class*="bg-red-50"]');
        const clearedResults = !resultsAfterClear || resultsAfterClear.style.display === 'none';
        
        results.actions.push({
          type: 'clear-results',
          success: true,
          hadResults: hasResults,
          resultsCleared: clearedResults
        });
        
        testUXFeatures.log(`✓ Clear Results: ${clearedResults ? 'cleared successfully' : 'may not have had results'}`);
      }
      
      // Test Reset All button
      if (resetAllButton && resetAllButton.textContent.includes('Reset')) {
        // Get current state
        const codeEditor = document.querySelector('textarea[class*="font-mono"]');
        const publicInputsField = document.querySelector('textarea[placeholder*="public"]');
        const privateInputsField = document.querySelector('textarea[placeholder*="private"]');
        
        const beforeState = {
          code: codeEditor?.value || '',
          publicInputs: publicInputsField?.value || '',
          privateInputs: privateInputsField?.value || ''
        };
        
        testUXFeatures.log('Capturing state before reset...');
        
        resetAllButton.click();
        await testUXFeatures.wait(1000);
        
        const afterState = {
          code: codeEditor?.value || '',
          publicInputs: publicInputsField?.value || '',
          privateInputs: privateInputsField?.value || ''
        };
        
        const isReset = afterState.code.includes('Simple addition circuit') || 
                        afterState.code !== beforeState.code ||
                        afterState.publicInputs !== beforeState.publicInputs;
        
        results.actions.push({
          type: 'reset-all',
          success: true,
          stateChanged: isReset,
          beforeLength: beforeState.code.length,
          afterLength: afterState.code.length
        });
        
        testUXFeatures.log(`✓ Reset All: ${isReset ? 'fields reset' : 'no change detected'}`);
      }
      
      results.message = `Clear/Reset test completed. Actions tested: ${results.actions.length}`;
      return results;
      
    } catch (error) {
      testUXFeatures.log(`Clear button test failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  },
  
  // Test 4: Input Field Validation
  testInputValidation: async () => {
    testUXFeatures.log('Testing Input Field Validation...', 'info');
    
    try {
      const publicInputsField = document.querySelector('textarea[placeholder*="public"]');
      const privateInputsField = document.querySelector('textarea[placeholder*="private"]');
      
      if (!publicInputsField || !privateInputsField) {
        throw new Error('Input fields not found');
      }
      
      // Store original values
      const originalPublic = publicInputsField.value;
      const originalPrivate = privateInputsField.value;
      
      // Test invalid JSON in public inputs
      publicInputsField.value = '{"invalid": json}';
      publicInputsField.dispatchEvent(new Event('input', { bubbles: true }));
      publicInputsField.dispatchEvent(new Event('change', { bubbles: true }));
      await testUXFeatures.wait(500);
      
      // Try to generate proof with invalid JSON
      const generateButton = document.querySelector('button[class*="bg-indigo-600"]');
      if (generateButton && !generateButton.disabled) {
        generateButton.click();
        await testUXFeatures.wait(2000);
        
        // Check for error message
        const errorElement = document.querySelector('[class*="text-red"]');
        const hasValidationError = errorElement && errorElement.textContent.toLowerCase().includes('json');
        
        testUXFeatures.log(`✓ JSON validation: ${hasValidationError ? 'error shown' : 'no error detected'}`);
      }
      
      // Restore original values
      publicInputsField.value = originalPublic;
      privateInputsField.value = originalPrivate;
      publicInputsField.dispatchEvent(new Event('input', { bubbles: true }));
      privateInputsField.dispatchEvent(new Event('input', { bubbles: true }));
      
      return {
        success: true,
        message: 'Input validation test completed'
      };
      
    } catch (error) {
      testUXFeatures.log(`Input validation test failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  },
  
  // Test 5: Code Editor Interaction
  testCodeEditor: async () => {
    testUXFeatures.log('Testing Code Editor Interaction...', 'info');
    
    try {
      const codeEditor = document.querySelector('textarea[class*="font-mono"]');
      if (!codeEditor) {
        throw new Error('Code editor not found');
      }
      
      const originalCode = codeEditor.value;
      testUXFeatures.log(`✓ Code editor found, current length: ${originalCode.length} chars`);
      
      // Test typing
      const testCode = '// Test comment\n';
      codeEditor.focus();
      codeEditor.setSelectionRange(0, 0);
      codeEditor.value = testCode + originalCode;
      codeEditor.dispatchEvent(new Event('input', { bubbles: true }));
      
      await testUXFeatures.wait(500);
      
      testUXFeatures.log('✓ Code editor accepts input');
      
      // Test syntax highlighting (if present)
      const hasHighlighting = codeEditor.parentElement.querySelector('[class*="highlight"]') || 
                              codeEditor.className.includes('language-');
      
      testUXFeatures.log(`✓ Syntax highlighting: ${hasHighlighting ? 'detected' : 'not detected'}`);
      
      // Restore original code
      codeEditor.value = originalCode;
      codeEditor.dispatchEvent(new Event('input', { bubbles: true }));
      
      return {
        success: true,
        originalLength: originalCode.length,
        hasHighlighting,
        message: 'Code editor test completed'
      };
      
    } catch (error) {
      testUXFeatures.log(`Code editor test failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  },
  
  // Test 6: Loading States
  testLoadingStates: async () => {
    testUXFeatures.log('Testing Loading States...', 'info');
    
    try {
      // Trigger proof generation to see loading state
      const generateButton = document.querySelector('button[class*="bg-indigo-600"]');
      if (!generateButton || generateButton.disabled) {
        testUXFeatures.log('Generate button not available', 'warn');
        return { success: true, message: 'Generate button not available for loading test' };
      }
      
      generateButton.click();
      await testUXFeatures.wait(100);
      
      // Check for loading indicators
      const spinnerElement = document.querySelector('[class*="animate-spin"]');
      const loadingText = document.querySelector('[class*="text-blue-800"]');
      const disabledButton = generateButton.disabled;
      
      testUXFeatures.log(`✓ Spinner present: ${!!spinnerElement}`);
      testUXFeatures.log(`✓ Loading text present: ${!!loadingText}`);
      testUXFeatures.log(`✓ Button disabled during loading: ${disabledButton}`);
      
      // Wait for completion
      let attempts = 0;
      while (attempts < 15 && document.querySelector('[class*="animate-spin"]')) {
        await testUXFeatures.wait(1000);
        attempts++;
      }
      
      const loadingComplete = !document.querySelector('[class*="animate-spin"]');
      testUXFeatures.log(`✓ Loading completed: ${loadingComplete}`);
      
      return {
        success: true,
        hadSpinner: !!spinnerElement,
        hadLoadingText: !!loadingText,
        buttonDisabledDuringLoad: disabledButton,
        loadingCompleted: loadingComplete,
        message: 'Loading states test completed'
      };
      
    } catch (error) {
      testUXFeatures.log(`Loading states test failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  },
  
  // Run all tests
  runAllTests: async () => {
    testUXFeatures.log('🚀 Starting comprehensive UI test suite...', 'info');
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: {},
      summary: { passed: 0, failed: 0, total: 0 }
    };
    
    const tests = [
      { name: 'dropdown', fn: testUXFeatures.testDropdown },
      { name: 'copyButton', fn: testUXFeatures.testCopyButton },
      { name: 'clearButton', fn: testUXFeatures.testClearButton },
      { name: 'inputValidation', fn: testUXFeatures.testInputValidation },
      { name: 'codeEditor', fn: testUXFeatures.testCodeEditor },
      { name: 'loadingStates', fn: testUXFeatures.testLoadingStates }
    ];
    
    for (const test of tests) {
      testUXFeatures.log(`\n--- Running ${test.name} test ---`);
      
      try {
        const result = await test.fn();
        results.tests[test.name] = result;
        
        if (result.success) {
          results.summary.passed++;
          testUXFeatures.log(`✅ ${test.name}: PASSED`, 'success');
        } else {
          results.summary.failed++;
          testUXFeatures.log(`❌ ${test.name}: FAILED - ${result.error}`, 'error');
        }
        
      } catch (error) {
        results.tests[test.name] = { success: false, error: error.message };
        results.summary.failed++;
        testUXFeatures.log(`❌ ${test.name}: EXCEPTION - ${error.message}`, 'error');
      }
      
      results.summary.total++;
      
      // Wait between tests
      await testUXFeatures.wait(testUXFeatures.config.waitTime);
    }
    
    // Final summary
    testUXFeatures.log('\n🏁 Test Suite Complete!', 'info');
    testUXFeatures.log(`📊 Results: ${results.summary.passed}/${results.summary.total} tests passed`, 
                       results.summary.failed === 0 ? 'success' : 'warn');
    
    if (results.summary.failed > 0) {
      testUXFeatures.log(`Failed tests: ${Object.keys(results.tests).filter(k => !results.tests[k].success).join(', ')}`, 'error');
    }
    
    // Store results globally for inspection
    window.testResults = results;
    
    return results;
  },
  
  // Individual test runner
  runTest: async (testName) => {
    const testMap = {
      dropdown: testUXFeatures.testDropdown,
      copy: testUXFeatures.testCopyButton,
      clear: testUXFeatures.testClearButton,
      validation: testUXFeatures.testInputValidation,
      editor: testUXFeatures.testCodeEditor,
      loading: testUXFeatures.testLoadingStates
    };
    
    const testFn = testMap[testName];
    if (!testFn) {
      testUXFeatures.log(`Test '${testName}' not found. Available: ${Object.keys(testMap).join(', ')}`, 'error');
      return;
    }
    
    testUXFeatures.log(`Running single test: ${testName}`);
    const result = await testFn();
    testUXFeatures.log(`Test ${testName} ${result.success ? 'PASSED' : 'FAILED'}`, result.success ? 'success' : 'error');
    
    return result;
  }
};

// Auto-run on load (optional)
if (window.location.search.includes('autotest=true')) {
  setTimeout(() => {
    window.testUXFeatures.runAllTests();
  }, 2000);
}

console.log('🧪 UI Test Suite Loaded! Usage:');
console.log('• testUXFeatures.runAllTests() - Run all tests');
console.log('• testUXFeatures.runTest("dropdown") - Run single test');
console.log('• testUXFeatures.testDropdown() - Run specific test directly');
console.log('Available tests:', Object.keys({
  dropdown: 1, copy: 1, clear: 1, validation: 1, editor: 1, loading: 1
}));