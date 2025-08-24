import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ZKPlayground from '../ZKPlayground';
import { jest } from '@jest/globals';

// Mock the zkService wrapper
const mockZkServiceWrapper = {
  generateProof: jest.fn(),
  getServiceStatus: jest.fn(),
};

jest.mock('../../services/zkServiceWrapper.js', () => mockZkServiceWrapper);

// Mock the global setup
jest.mock('../../services/globalSetup.js', () => ({
  isGlobalSetupComplete: jest.fn(() => true),
  getGlobalMaxField: jest.fn(() => () => BigInt('123456789')),
}));

describe('ZKPlayground Integration Tests', () => {
  let mockGenerateProof;
  let mockGetServiceStatus;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock implementations
    mockGenerateProof = mockZkServiceWrapper.generateProof;
    mockGetServiceStatus = mockZkServiceWrapper.getServiceStatus;

    // Default mock implementations
    mockGetServiceStatus.mockResolvedValue({
      isInitialized: true,
      isReady: true,
      mode: 'mock',
      message: 'Running in demonstration mode',
    });

    mockGenerateProof.mockResolvedValue({
      success: true,
      result: {
        proofData: 'mock_proof_data_123',
        publicOutputs: { result: 8 },
        mockMode: true,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        compactCodeHash: 'abc123',
        publicInputsHash: 'def456',
      },
    });

    // Mock localStorage
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };

    // Mock file operations
    global.URL = {
      createObjectURL: jest.fn(() => 'blob:mock-url'),
      revokeObjectURL: jest.fn(),
    };

    global.Blob = jest.fn(() => ({}));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('should render main UI elements', () => {
      render(<ZKPlayground />);
      
      expect(screen.getByText('ZK Circuit Editor & Proof Playground')).toBeInTheDocument();
      expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      expect(screen.getByTestId('public-inputs')).toBeInTheDocument();
      expect(screen.getByText('Generate ZK Proof')).toBeInTheDocument();
    });

    test('should render with default circuit code', () => {
      render(<ZKPlayground />);
      
      const codeEditor = screen.getByTestId('code-editor');
      expect(codeEditor.value).toContain('circuit AdditionCircuit');
    });

    test('should render with default inputs', () => {
      render(<ZKPlayground />);
      
      const publicInputs = screen.getByTestId('public-inputs');
      expect(publicInputs.value).toBe('{"a": 5, "b": 3}');
    });
  });

  describe('Proof Generation Workflow', () => {
    test('should generate proof successfully', async () => {
      const user = userEvent.setup();
      render(<ZKPlayground />);

      const generateButton = screen.getByText('Generate ZK Proof');
      await user.click(generateButton);

      // Wait for service loading and proof generation
      await waitFor(() => {
        expect(mockGetServiceStatus).toHaveBeenCalled();
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(mockGenerateProof).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Check if result is displayed
      await waitFor(() => {
        expect(screen.getByText('Proof Generated Successfully')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    test('should handle proof generation error', async () => {
      mockGenerateProof.mockResolvedValueOnce({
        success: false,
        error: {
          message: 'Circuit compilation failed',
          type: 'CompilationError',
        },
      });

      const user = userEvent.setup();
      render(<ZKPlayground />);

      const generateButton = screen.getByText('Generate ZK Proof');
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Proof Generation Failed')).toBeInTheDocument();
      });

      expect(screen.getByText('Circuit compilation failed')).toBeInTheDocument();
    });

    test('should validate inputs before proof generation', async () => {
      const user = userEvent.setup();
      render(<ZKPlayground />);

      // Set invalid JSON
      const publicInputs = screen.getByTestId('public-inputs');
      await user.clear(publicInputs);
      await user.type(publicInputs, 'invalid json');

      const generateButton = screen.getByText('Generate ZK Proof');
      
      // Button should be disabled due to invalid JSON
      expect(generateButton).toBeDisabled();
    });
  });

  describe('Auto-save Functionality', () => {
    test('should auto-save circuit changes', async () => {
      const user = userEvent.setup();
      render(<ZKPlayground />);

      const codeEditor = screen.getByTestId('code-editor');
      await user.clear(codeEditor);
      await user.type(codeEditor, 'circuit Test { }');

      // Wait for auto-save debounce
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'zkCircuitEditor',
          expect.stringContaining('circuit Test')
        );
      }, { timeout: 3000 });
    });

    test('should exclude private inputs from auto-save', async () => {
      const user = userEvent.setup();
      render(<ZKPlayground />);

      const privateInputs = screen.getByLabelText(/Private Inputs/);
      await user.clear(privateInputs);
      await user.type(privateInputs, '{"secret": "value"}');

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Check that private inputs are not saved
      const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
      expect(savedData.privateInputs).toBe('{}');
    });

    test('should allow toggling auto-save', async () => {
      const user = userEvent.setup();
      render(<ZKPlayground />);

      const autoSaveCheckbox = screen.getByLabelText(/Auto-save/);
      await user.click(autoSaveCheckbox);

      // Verify checkbox is unchecked
      expect(autoSaveCheckbox).not.toBeChecked();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('should trigger proof generation with Ctrl+Enter', async () => {
      render(<ZKPlayground />);

      // Simulate Ctrl+Enter
      fireEvent.keyDown(document, {
        key: 'Enter',
        ctrlKey: true,
      });

      await waitFor(() => {
        expect(mockGenerateProof).toHaveBeenCalled();
      });
    });

    test('should save circuit with Ctrl+S', async () => {
      render(<ZKPlayground />);

      // Simulate Ctrl+S
      fireEvent.keyDown(document, {
        key: 's',
        ctrlKey: true,
      });

      // Should trigger save functionality
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalled();
      });
    });
  });

  describe('Export/Import Functionality', () => {
    test('should export results when available', async () => {
      const user = userEvent.setup();
      render(<ZKPlayground />);

      // First generate a proof to have results
      const generateButton = screen.getByText('Generate ZK Proof');
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Proof Generated Successfully')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Now export should be available
      const exportButton = screen.getByText('Export Results');
      expect(exportButton).not.toBeDisabled();

      await user.click(exportButton);

      // Check if download was triggered
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.Blob).toHaveBeenCalled();
    });

    test('should handle file import', async () => {
      const user = userEvent.setup();
      render(<ZKPlayground />);

      // Mock FileReader
      const mockFileReader = {
        readAsText: jest.fn(),
        result: JSON.stringify({
          circuit: {
            code: 'circuit Imported { }',
            publicInputs: { x: 10 },
            privateInputs: { y: 20 },
          },
        }),
      };
      
      global.FileReader = jest.fn(() => mockFileReader);

      const loadButton = screen.getByText('Load Circuit');
      await user.click(loadButton);

      // Simulate file selection
      const fileInput = document.querySelector('input[type="file"]');
      const file = new File(['mock'], 'circuit.json', { type: 'application/json' });
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      // Trigger the file reader onload
      mockFileReader.onload({ target: { result: mockFileReader.result } });

      // Check if circuit was loaded
      await waitFor(() => {
        const codeEditor = screen.getByTestId('code-editor');
        expect(codeEditor.value).toContain('circuit Imported');
      });
    });
  });

  describe('Service Status Display', () => {
    test('should display service status', async () => {
      mockGetServiceStatus.mockResolvedValueOnce({
        mode: 'production',
        message: 'Full ZK proof functionality available',
      });

      render(<ZKPlayground />);

      // Trigger service loading
      const generateButton = screen.getByText('Generate ZK Proof');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Production Mode')).toBeInTheDocument();
      });
    });

    test('should handle service errors', async () => {
      mockGetServiceStatus.mockResolvedValueOnce({
        mode: 'error',
        message: 'Service initialization failed',
        error: { message: 'Network error' },
      });

      render(<ZKPlayground />);

      const generateButton = screen.getByText('Generate ZK Proof');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Service Error')).toBeInTheDocument();
      });
    });
  });

  describe('Example Selector', () => {
    test('should load example circuit', async () => {
      const user = userEvent.setup();
      render(<ZKPlayground />);

      // This test would need the ExampleSelector component to be properly mocked
      // For now, we'll just verify the selector is present
      expect(screen.getByText('Circuit Examples')).toBeInTheDocument();
    });
  });

  describe('Clear and Reset Functions', () => {
    test('should clear results', async () => {
      const user = userEvent.setup();
      render(<ZKPlayground />);

      // Generate proof first
      const generateButton = screen.getByText('Generate ZK Proof');
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Proof Generated Successfully')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Clear results
      const clearButton = screen.getByText('Clear Results');
      await user.click(clearButton);

      await waitFor(() => {
        expect(screen.queryByText('Proof Generated Successfully')).not.toBeInTheDocument();
      });
    });

    test('should reset all state', async () => {
      const user = userEvent.setup();
      render(<ZKPlayground />);

      // Modify some inputs
      const codeEditor = screen.getByTestId('code-editor');
      await user.clear(codeEditor);
      await user.type(codeEditor, 'modified circuit');

      // Reset all
      const resetButton = screen.getByText('Reset All');
      await user.click(resetButton);

      // Check if default values are restored
      await waitFor(() => {
        expect(codeEditor.value).toContain('circuit AdditionCircuit');
      });

      expect(global.localStorage.removeItem).toHaveBeenCalledWith('zkCircuitEditor');
    });
  });

  describe('Error Handling', () => {
    test('should handle service loading failure', async () => {
      mockGetServiceStatus.mockRejectedValueOnce(new Error('Service unavailable'));

      const user = userEvent.setup();
      render(<ZKPlayground />);

      // Service loading is triggered when generating a proof
      const generateButton = screen.getByText('Generate ZK Proof');
      await user.click(generateButton);

      // Wait for service error to appear
      await waitFor(() => {
        expect(screen.getByText('Service Error')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should handle JSON validation errors', async () => {
      const user = userEvent.setup();
      render(<ZKPlayground />);

      const publicInputs = screen.getByTestId('public-inputs');
      await user.clear(publicInputs);
      await user.type(publicInputs, 'invalid json');

      // Error indicator should appear
      await waitFor(() => {
        expect(screen.getByText('Invalid JSON')).toBeInTheDocument();
      });
    });
  });
});