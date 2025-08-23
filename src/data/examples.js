export const circuitExamples = [
  {
    id: 'simple-arithmetic',
    title: 'Simple Arithmetic Proof',
    description: 'Proves that two numbers sum to a specific result without revealing the inputs',
    category: 'Basic',
    difficulty: 'Beginner',
    code: `// Simple arithmetic proof circuit
circuit ArithmeticProof {
  public fn main(a: u32, b: u32, expected_sum: u32) -> bool {
    let sum = a + b;
    sum == expected_sum
  }
}`,
    publicInputs: {
      expected_sum: 15
    },
    privateInputs: {
      a: 7,
      b: 8
    },
    explanation: 'This circuit proves that the prover knows two private numbers (a, b) that sum to a publicly known value (expected_sum), without revealing the actual private values.',
    expectedResult: 'Returns true if a + b equals expected_sum'
  },
  
  {
    id: 'range-proof',
    title: 'Range Proof',
    description: 'Proves a secret number is within a specific range without revealing it',
    category: 'Privacy',
    difficulty: 'Intermediate',
    code: `// Range proof circuit - proves a number is between min and max
circuit RangeProof {
  public fn main(secret: u32, min_val: u32, max_val: u32) -> bool {
    // Check if secret is within the range [min_val, max_val]
    secret >= min_val && secret <= max_val
  }
}`,
    publicInputs: {
      min_val: 18,
      max_val: 65
    },
    privateInputs: {
      secret: 25
    },
    explanation: 'This circuit allows proving that a secret value (like age) falls within a specific range without revealing the exact value. Useful for age verification, income brackets, etc.',
    expectedResult: 'Returns true if secret is between min_val and max_val inclusive'
  },

  {
    id: 'hash-preimage',
    title: 'Hash Preimage Proof',
    description: 'Proves knowledge of a preimage that hashes to a specific value',
    category: 'Cryptography',
    difficulty: 'Intermediate',
    code: `// Hash preimage proof circuit
use std::hash::Hasher;

circuit HashPreimageProof {
  public fn main(preimage: u32, expected_hash: u32) -> bool {
    // Simple hash function for demonstration
    // In practice, you'd use SHA-256 or similar
    let computed_hash = hash_simple(preimage);
    computed_hash == expected_hash
  }
}

fn hash_simple(input: u32) -> u32 {
  // Simple multiplicative hash for demo purposes
  // Not cryptographically secure - use proper hash in production
  let prime: u32 = 31;
  (input * prime) % 1000000007
}`,
    publicInputs: {
      expected_hash: 775
    },
    privateInputs: {
      preimage: 25
    },
    explanation: 'This circuit proves knowledge of a secret value (preimage) that produces a specific hash when processed. This is fundamental to many ZK applications like password verification.',
    expectedResult: 'Returns true if hash(preimage) equals expected_hash'
  },

  {
    id: 'merkle-proof',
    title: 'Basic Merkle Tree Proof',
    description: 'Proves membership in a Merkle tree without revealing the position',
    category: 'Data Structures',
    difficulty: 'Advanced',
    code: `// Basic Merkle tree membership proof
circuit MerkleProof {
  public fn main(
    leaf: u32,
    root: u32,
    path_elements: [u32; 3],
    path_indices: [bool; 3]
  ) -> bool {
    let mut current_hash = leaf;
    
    // Traverse up the tree using the path
    for i in 0..3 {
      let path_element = path_elements[i];
      let is_right = path_indices[i];
      
      if is_right {
        // Current node is right child
        current_hash = hash_pair(path_element, current_hash);
      } else {
        // Current node is left child
        current_hash = hash_pair(current_hash, path_element);
      }
    }
    
    current_hash == root
  }
}

fn hash_pair(left: u32, right: u32) -> u32 {
  // Simple hash combination for demo
  // In production, use proper cryptographic hash
  let prime: u32 = 31;
  ((left + right) * prime) % 1000000007
}`,
    publicInputs: {
      root: 923456789,
      path_elements: [100, 200, 300],
      path_indices: [false, true, false]
    },
    privateInputs: {
      leaf: 42
    },
    explanation: 'This circuit proves that a specific leaf exists in a Merkle tree with a given root, without revealing the exact position of the leaf. Essential for blockchain and privacy-preserving systems.',
    expectedResult: 'Returns true if the leaf is part of the Merkle tree with the given root'
  },

  {
    id: 'age-verification',
    title: 'Age Verification',
    description: 'Proves age is above minimum threshold without revealing exact age',
    category: 'Identity',
    difficulty: 'Beginner',
    code: `// Age verification circuit
circuit AgeVerification {
  public fn main(birth_year: u32, current_year: u32, min_age: u32) -> bool {
    let age = current_year - birth_year;
    age >= min_age
  }
}`,
    publicInputs: {
      current_year: 2024,
      min_age: 21
    },
    privateInputs: {
      birth_year: 1995
    },
    explanation: 'A practical application proving someone is old enough (e.g., for voting, drinking) without revealing their exact age or birth year.',
    expectedResult: 'Returns true if calculated age is >= min_age'
  },

  {
    id: 'quadratic-equation',
    title: 'Quadratic Equation Solver',
    description: 'Proves knowledge of solutions to a quadratic equation',
    category: 'Mathematics',
    difficulty: 'Intermediate',
    code: `// Quadratic equation solver proof
circuit QuadraticProof {
  public fn main(x: i32, a: i32, b: i32, c: i32) -> bool {
    // Prove that x is a root of ax² + bx + c = 0
    let result = a * x * x + b * x + c;
    result == 0
  }
}`,
    publicInputs: {
      a: 1,
      b: -5,
      c: 6
    },
    privateInputs: {
      x: 3
    },
    explanation: 'This circuit proves knowledge of a solution to a quadratic equation ax² + bx + c = 0 without revealing which root (there can be two) was found.',
    expectedResult: 'Returns true if x satisfies the quadratic equation'
  },

  {
    id: 'password-check',
    title: 'Password Verification',
    description: 'Verify password knowledge without revealing the password',
    category: 'Security',
    difficulty: 'Intermediate',
    code: `// Password verification circuit
circuit PasswordCheck {
  public fn main(password_hash: u32, password: u32) -> bool {
    let computed_hash = simple_hash(password);
    computed_hash == password_hash
  }
}

fn simple_hash(input: u32) -> u32 {
  // Simple hash for demo - use proper cryptographic hash in production
  let mut hash = input;
  hash = hash * 1103515245 + 12345;
  hash = (hash / 65536) % 32768;
  hash * 31 % 1000000007
}`,
    publicInputs: {
      password_hash: 123456789
    },
    privateInputs: {
      password: 555444333
    },
    explanation: 'Demonstrates password verification without exposing the actual password, only proving that the correct password is known.',
    expectedResult: 'Returns true if the password hashes to the expected value'
  },

  {
    id: 'sum-check',
    title: 'Private Sum Verification',
    description: 'Proves the sum of private numbers equals a public total',
    category: 'Privacy',
    difficulty: 'Beginner',
    code: `// Private sum verification circuit
circuit SumCheck {
  public fn main(
    private_values: [u32; 4],
    public_sum: u32
  ) -> bool {
    let mut total = 0;
    for i in 0..4 {
      total += private_values[i];
    }
    total == public_sum
  }
}`,
    publicInputs: {
      public_sum: 100
    },
    privateInputs: {
      private_values: [25, 30, 20, 25]
    },
    explanation: 'This circuit proves that a set of private values sum to a known total without revealing the individual values. Useful for financial privacy or vote counting.',
    expectedResult: 'Returns true if the sum of private_values equals public_sum'
  }
];

// Helper function to get example by ID
export const getExampleById = (id) => {
  return circuitExamples.find(example => example.id === id);
};

// Helper function to get examples by category
export const getExamplesByCategory = (category) => {
  return circuitExamples.filter(example => example.category === category);
};

// Helper function to get examples by difficulty
export const getExamplesByDifficulty = (difficulty) => {
  return circuitExamples.filter(example => example.difficulty === difficulty);
};

// Get all unique categories
export const getCategories = () => {
  return [...new Set(circuitExamples.map(example => example.category))];
};

// Get all unique difficulties
export const getDifficulties = () => {
  return [...new Set(circuitExamples.map(example => example.difficulty))];
};

export default circuitExamples;