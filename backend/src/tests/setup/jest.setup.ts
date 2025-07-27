/// <reference types="jest" />

// Jest setup file to ensure proper type definitions
export {};
// This ensures Jest types are available in all test files

// Global test setup and teardown
beforeAll(async () => {
  // Ensure test environment is clean before starting
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  // Global teardown - force cleanup any remaining connections
  if (process.env.NODE_ENV === 'test') {
    // Give time for any pending operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));
  }
});

// Set longer timeout for database operations
jest.setTimeout(60000);

// Suppress console.log during tests for cleaner output
// Comment this out if you need to see console logs for debugging
if (process.env.NODE_ENV === 'test') {
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  
  console.log = (...args: any[]) => {
    // Only log actual errors and important test output
    if (args.some(arg => typeof arg === 'string' && (arg.includes('Error') || arg.includes('FAIL')))) {
      originalConsoleLog(...args);
    }
  };
  
  console.warn = (...args: any[]) => {
    // Only log warnings that contain Error or important keywords
    if (args.some(arg => typeof arg === 'string' && (arg.includes('Error') || arg.includes('Warning')))) {
      originalConsoleWarn(...args);
    }
  };
}
