# ZK Circuit Editor User Guide

Welcome to the ZK Circuit Editor & Proof Playground! This comprehensive guide will help you master zero-knowledge proof generation using the Compact language.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Understanding the Interface](#understanding-the-interface)
3. [Writing Compact Circuits](#writing-compact-circuits)
4. [Step-by-Step Workflow](#step-by-step-workflow)
5. [Advanced Playground Mode](#advanced-playground-mode)
6. [Examples and Tutorials](#examples-and-tutorials)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Features](#advanced-features)

## Getting Started

### First Launch

1. **Open the application** in your web browser at `http://localhost:3000`
2. **Choose your interface:**
   - **Step-by-Step Workflow**: Perfect for beginners and learning
   - **Advanced Playground**: Full-featured environment for experienced users

### Quick Start Tutorial

Let's create your first zero-knowledge proof in 5 minutes:

1. **Select Step-by-Step Workflow** (recommended for beginners)
2. **Enter a simple circuit:**
   ```compact
   circuit MyFirstCircuit {
     public fn main(secret_number: u32) -> u32 {
       secret_number * 2
     }
   }
   ```
3. **Set public inputs:** `{"secret_number": 21}`
4. **Leave private inputs empty:** `{}`
5. **Click "Compile Circuit"** ✅
6. **Click "Generate Proof"** ⚡
7. **Click "Verify Proof"** 🔍

Congratulations! You've just generated your first zero-knowledge proof.

## Understanding the Interface

### Dual Interface Design

#### Step-by-Step Workflow
- **Purpose**: Learn ZK concepts progressively
- **Best for**: Beginners, educational use, debugging
- **Features**: Guided process, detailed explanations, visual feedback

#### Advanced Playground
- **Purpose**: Professional development environment
- **Best for**: Experienced users, rapid prototyping, production circuits
- **Features**: Real-time validation, example library, export/import

### Interface Components

#### Code Editor
- **Syntax highlighting** for Compact language
- **Real-time error detection**
- **Auto-indentation** and formatting
- **Line numbers** and bracket matching

#### Input Panels
- **Public Inputs**: Values that will be revealed in the proof
- **Private Inputs**: Secret values known only to the prover
- **JSON validation** with helpful error messages

#### Output Panel
- **Proof Results**: Generated proof data and metadata
- **Verification Status**: Whether the proof is valid
- **Export Options**: Copy, download, or print results

## Writing Compact Circuits

### Basic Syntax

Compact is a domain-specific language for zero-knowledge circuits. Here's the basic structure:

```compact
circuit CircuitName {
  public fn main(param1: type, param2: type) -> return_type {
    // Circuit logic here
    return_value
  }
}
```

### Data Types

| Type | Description | Example |
|------|-------------|---------|
| `u32` | 32-bit unsigned integer | `42` |
| `i32` | 32-bit signed integer | `-42` |
| `bool` | Boolean | `true`, `false` |
| `field` | Field element | Field arithmetic |

### Basic Operations

```compact
circuit OperationsExample {
  public fn main(a: u32, b: u32) -> u32 {
    // Arithmetic
    let sum = a + b;
    let difference = a - b;
    let product = a * b;
    let quotient = a / b;
    let remainder = a % b;
    
    // Comparison
    let is_greater = a > b;
    let is_equal = a == b;
    
    // Conditional
    let result = if a > b { a } else { b };
    
    result
  }
}
```

### Control Flow

```compact
circuit ControlFlowExample {
  public fn main(n: u32) -> u32 {
    // If-else
    let classified = if n > 100 {
      1
    } else if n > 50 {
      2
    } else {
      3
    };
    
    // Loops (limited in ZK circuits)
    let mut sum = 0;
    for i in 0..n {
      sum = sum + i;
    }
    
    sum + classified
  }
}
```

## Step-by-Step Workflow

### Step 1: Write Your Circuit

Start with the circuit template:

```compact
circuit YourCircuitName {
  public fn main(/* parameters */) -> /* return type */ {
    // Your logic here
  }
}
```

**Tips:**
- Use descriptive circuit and parameter names
- Start simple and add complexity gradually
- Comment your logic for clarity

### Step 2: Configure Inputs

#### Public Inputs
Values that will be revealed in the proof:
- Circuit parameters that others can verify
- Expected outputs or constraints
- Non-sensitive computation inputs

#### Private Inputs  
Secret values known only to the prover:
- Passwords, private keys, or sensitive data
- Witness values for complex constraints
- Intermediate computation results

**Example:**
```json
// Public: The result we claim
{"claimed_result": 42}

// Private: The secret inputs that produce this result
{"secret_a": 6, "secret_b": 7}
```

### Step 3: Compile Circuit

The compilation process:
1. **Parses** your Compact code
2. **Validates** syntax and types
3. **Generates** Zero-Knowledge Intermediate Representation (ZKIR)
4. **Reports** any errors or warnings

**Success indicators:**
- ✅ Green checkmark appears
- Circuit hash is displayed
- No error messages

**Common errors:**
- Syntax errors in Compact code
- Type mismatches
- Undefined variables or functions

### Step 4: Generate Proof

Proof generation involves:
1. **Witness generation** from your inputs
2. **Constraint satisfaction** checking
3. **Cryptographic proof** creation
4. **Output computation** and verification

**What happens:**
- Your secret inputs remain private
- A cryptographic proof is generated
- Public outputs are computed and revealed

### Step 5: Verify Proof

Verification confirms:
- The proof is mathematically valid
- Constraints were satisfied correctly
- No cheating or invalid computations occurred

**Verification results:**
- ✅ **VALID**: Proof is correct and trustworthy
- ❌ **INVALID**: Proof failed verification (should not happen with honest generation)

## Advanced Playground Mode

### Real-Time Features

#### Live Validation
- **JSON syntax checking** as you type
- **Circuit compilation** feedback
- **Input validation** with helpful hints

#### Example Library
Pre-built circuits for learning and inspiration:
- **Basic Arithmetic**: Addition, multiplication, comparison
- **Cryptographic**: Hash functions, signature verification
- **Privacy**: Age verification, range proofs
- **Advanced**: Merkle tree proofs, complex constraints

### Workflow Optimization

#### Keyboard Shortcuts
Master these shortcuts for efficient development:

| Shortcut | Action | Use Case |
|----------|--------|----------|
| `Ctrl+Enter` | Generate Proof | Quick proof generation |
| `Ctrl+S` | Save Circuit | Preserve your work |
| `Ctrl+O` | Load Circuit | Import saved circuits |
| `Ctrl+Shift+E` | Export Results | Share or backup results |

#### Auto-Save
Your work is automatically saved to browser storage:
- **Circuit code** is preserved between sessions
- **Public inputs** are restored on reload  
- **Private inputs** are never saved (privacy protection)

### Export and Import

#### Saving Circuits
```javascript
// Exported circuit format
{
  "code": "circuit Example { ... }",
  "publicInputs": {"param": "value"},
  "privateInputs": {}, // Empty for privacy
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Sharing Results
```javascript
// Full result export
{
  "circuit": { /* circuit data */ },
  "result": { /* proof data */ },
  "verification": { /* verification results */ },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0"
}
```

## Examples and Tutorials

### Example 1: Age Verification

**Scenario**: Prove you're over 18 without revealing your exact age.

```compact
circuit AgeVerification {
  public fn main(min_age: u32, actual_age: u32) -> bool {
    actual_age >= min_age
  }
}
```

**Inputs:**
```json
// Public: The minimum age requirement
{"min_age": 18}

// Private: Your actual age (secret!)
{"actual_age": 25}
```

**Result**: Proof that you're over 18 without revealing you're 25.

### Example 2: Password Verification

**Scenario**: Prove you know a password without revealing it.

```compact
circuit PasswordVerification {
  public fn main(password_hash: u32, password: u32) -> bool {
    // Simple hash function (use proper crypto in production)
    let computed_hash = password ^ 0xDEADBEEF;
    computed_hash == password_hash
  }
}
```

**Inputs:**
```json
// Public: The expected password hash
{"password_hash": 3735899821}

// Private: The actual password
{"password": 123456}
```

### Example 3: Range Proof

**Scenario**: Prove a value is within a range without revealing the exact value.

```compact
circuit RangeProof {
  public fn main(min_val: u32, max_val: u32, secret_val: u32) -> bool {
    secret_val >= min_val && secret_val <= max_val
  }
}
```

**Inputs:**
```json
// Public: The allowed range
{"min_val": 100, "max_val": 1000}

// Private: Your secret value
{"secret_val": 750}
```

### Example 4: Merkle Tree Membership

**Scenario**: Prove you have an element in a set without revealing which element.

```compact
circuit MerkleProof {
  public fn main(root: u32, leaf: u32, path: u32) -> bool {
    // Simplified Merkle proof verification
    let computed_root = leaf ^ path;
    computed_root == root
  }
}
```

**Inputs:**
```json
// Public: The Merkle tree root
{"root": 3735928559}

// Private: Your leaf and authentication path
{"leaf": 12345, "path": 3735895678}
```

### Example 5: Arithmetic Circuit

**Scenario**: Prove you know values that satisfy a complex equation.

```compact
circuit ArithmeticCircuit {
  public fn main(result: u32, a: u32, b: u32, c: u32) -> bool {
    // Prove: result = (a + b) * c
    let sum = a + b;
    let product = sum * c;
    product == result
  }
}
```

**Inputs:**
```json
// Public: The claimed result
{"result": 150}

// Private: The secret values
{"a": 10, "b": 20, "c": 5}
```

## Best Practices

### Circuit Design

#### 1. Start Simple
- Begin with basic operations
- Test each component separately
- Add complexity incrementally

#### 2. Minimize Constraints
- Fewer operations = faster proof generation
- Combine operations when possible
- Avoid unnecessary computations

#### 3. Clear Parameter Naming
```compact
// Good
circuit VotingSystem {
  public fn main(candidate_id: u32, voter_secret: u32) -> bool {
    // Clear what each parameter represents
  }
}

// Bad
circuit VotingSystem {
  public fn main(x: u32, y: u32) -> bool {
    // Unclear parameter meanings
  }
}
```

#### 4. Input Validation
```compact
circuit SecureCircuit {
  public fn main(public_param: u32, private_param: u32) -> u32 {
    // Validate inputs
    assert(public_param > 0);
    assert(private_param < 1000000);
    
    // Your logic here
    public_param + private_param
  }
}
```

### Security Considerations

#### 1. Private Input Protection
- Never log private inputs
- Don't include secrets in public outputs
- Use the privacy features of auto-save/export

#### 2. Input Validation
- Always validate public inputs
- Check ranges and constraints
- Handle edge cases gracefully

#### 3. Circuit Logic Review
- Review circuits for information leakage
- Test with various input combinations
- Consider timing attacks in complex circuits

### Performance Tips

#### 1. Circuit Optimization
- Use efficient algorithms
- Minimize loop iterations
- Combine operations when possible

#### 2. Browser Performance
- Close unnecessary browser tabs
- Use modern browsers with WebAssembly support
- Ensure stable internet connection

#### 3. Development Workflow
- Use Step-by-Step mode for debugging
- Switch to Playground for rapid iteration
- Export working circuits for backup

### Testing Strategy

#### 1. Unit Testing
- Test each circuit function independently
- Use known input/output pairs
- Verify edge cases and boundaries

#### 2. Integration Testing
- Test complete proof workflows
- Verify proof generation and verification
- Test error handling scenarios

#### 3. User Acceptance Testing
- Test with realistic scenarios
- Verify privacy guarantees
- Check performance under load

## Troubleshooting

### Common Issues

#### Circuit Compilation Errors

**Error**: `Unexpected token 'xyz'`
**Solution**: Check Compact syntax, missing semicolons, or typos

**Error**: `Type mismatch: expected u32, found bool`
**Solution**: Ensure parameter types match function signatures

**Error**: `Undefined variable 'abc'`
**Solution**: Declare variables before use or fix spelling

#### Proof Generation Failures

**Error**: `Invalid public inputs: must be an object`
**Solution**: Ensure inputs are valid JSON objects

**Error**: `Proof generation timeout`
**Solution**: Simplify circuit or check network connection

**Error**: `WebAssembly not supported`
**Solution**: Use a modern browser or enable WebAssembly

#### Service Issues

**Error**: `Service initialization failed`
**Solution**: Check network connectivity and endpoint configuration

**Error**: `MidnightJS not available`
**Solution**: Enable demo mode or refresh the browser

### Debug Strategies

#### 1. Systematic Debugging
1. Start with minimal circuit
2. Add complexity step by step
3. Test each addition independently
4. Use console logs for intermediate values

#### 2. Input Validation
1. Verify JSON syntax
2. Check data types match circuit parameters
3. Ensure required fields are present
4. Test with simple values first

#### 3. Browser Developer Tools
1. Open browser console (F12)
2. Check for JavaScript errors
3. Monitor network requests
4. Review WebAssembly loading

### Performance Issues

#### Slow Proof Generation
- Reduce circuit complexity
- Optimize algorithm efficiency
- Check system resources
- Use demo mode for testing

#### Memory Issues
- Close unused browser tabs
- Refresh page to clear memory
- Use smaller input sets
- Consider browser limits

#### Network Problems
- Check internet connection
- Verify endpoint configuration
- Try demo mode as fallback
- Check firewall settings

## Advanced Features

### Custom Proof Providers

Configure custom MidnightJS endpoints:

```bash
# .env.local
REACT_APP_MIDNIGHT_ENDPOINT=https://your-custom-endpoint.com
```

### Batch Processing

Process multiple proofs efficiently:

```javascript
async function batchProofGeneration(circuits) {
  const results = [];
  
  for (const circuit of circuits) {
    const result = await generateProof(
      circuit.code,
      circuit.publicInputs,
      circuit.privateInputs
    );
    results.push(result);
  }
  
  return results;
}
```

### Integration with External Tools

#### Export to Testing Frameworks
```javascript
// Export circuit for external testing
const circuitExport = {
  circuit: compactCode,
  testCases: [
    {
      inputs: { a: 1, b: 2 },
      expected: { result: 3 }
    }
  ]
};
```

#### API Integration
```javascript
// Use with external API
async function submitProofToAPI(proof) {
  const response = await fetch('/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proof)
  });
  
  return response.json();
}
```

### Extending the Editor

#### Custom Examples
Add your own circuit examples to the library by creating a PR with:

```javascript
// src/components/ExampleSelector.jsx
const customExample = {
  id: 'custom-circuit',
  title: 'My Custom Circuit',
  category: 'Custom',
  difficulty: 'Advanced',
  code: 'circuit CustomCircuit { ... }',
  publicInputs: { /* ... */ },
  privateInputs: { /* ... */ },
  explanation: 'Description of what this circuit does'
};
```

#### Theming
Customize the appearance:

```css
/* Add to globals.css */
:root {
  --editor-bg: #1e1e1e;
  --editor-text: #d4d4d4;
  --accent-color: #007acc;
}
```

---

## Getting Help

- **Documentation**: Review this guide and the API documentation
- **Examples**: Check the built-in example library
- **Community**: Join discussions on GitHub
- **Issues**: Report bugs with minimal reproduction cases

Happy proving! 🎉