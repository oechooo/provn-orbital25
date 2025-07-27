import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execPromise = promisify(exec);

interface TestResult {
  testName: string;
  passed: boolean;
  output: string;
  duration: number;
  error?: string;
}

class TestRunner {
  private testFiles: string[] = [
    'testStakeIntegration.ts',
    'marketLifecycle.test.ts',
    'provePointsEconomy.test.ts',
    'avatarSystem.test.ts',
    'newsIntegration.test.ts',
    'errorHandling.test.ts',
    'frontendAPI.test.ts'
  ];

  private testsDir = path.join(__dirname);
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('Starting comprehensive test suite...\n');
    console.log('=====================================');
    console.log('PROVN ORBITAL 25 - TEST RUNNER');
    console.log('=====================================\n');

    const startTime = Date.now();

    for (let i = 0; i < this.testFiles.length; i++) {
      const testFile = this.testFiles[i];
      console.log(`[${i + 1}/${this.testFiles.length}] Running ${testFile}...`);
      
      await this.runSingleTest(testFile);
      
      // Add delay between tests to allow database operations to complete
      if (i < this.testFiles.length - 1) {
        await this.delay(2000);
      }
    }

    const totalDuration = Date.now() - startTime;
    this.printSummary(totalDuration);
  }

  private async runSingleTest(testFile: string): Promise<void> {
    const testPath = path.join(this.testsDir, testFile);
    const startTime = Date.now();

    try {
      const { stdout, stderr } = await execPromise(`npx tsx ${testPath}`, {
        cwd: path.dirname(this.testsDir),
        timeout: 60000 // 60 second timeout per test
      });

      const duration = Date.now() - startTime;
      const output = stdout + (stderr ? `\nSTDERR: ${stderr}` : '');

      // Determine if test passed based on output content
      const passed = !stderr && !output.toLowerCase().includes('error') && !output.toLowerCase().includes('failed');

      this.results.push({
        testName: testFile,
        passed,
        output,
        duration
      });

      console.log(`  ✓ ${testFile} completed in ${duration}ms`);
      if (!passed) {
        console.log(`  ⚠ Test may have issues - check detailed output`);
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.results.push({
        testName: testFile,
        passed: false,
        output: '',
        duration,
        error: errorMessage
      });

      console.log(`  ✗ ${testFile} failed in ${duration}ms`);
      console.log(`  Error: ${errorMessage}`);
    }

    console.log('');
  }

  private printSummary(totalDuration: number): void {
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = this.results.filter(r => !r.passed).length;

    console.log('=====================================');
    console.log('TEST SUITE SUMMARY');
    console.log('=====================================');
    console.log(`Total tests: ${this.results.length}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Total duration: ${totalDuration}ms`);
    console.log('');

    if (passedTests === this.results.length) {
      console.log('🎉 ALL TESTS PASSED!');
    } else {
      console.log('⚠ Some tests need attention');
    }

    console.log('\nDetailed Results:');
    console.log('=====================================');

    this.results.forEach((result, index) => {
      const status = result.passed ? '✓ PASS' : '✗ FAIL';
      console.log(`${index + 1}. ${result.testName}: ${status} (${result.duration}ms)`);
      
      if (!result.passed && result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log('\nTest Coverage:');
    console.log('=====================================');
    console.log('✓ Stake Integration - Core betting functionality');
    console.log('✓ Market Lifecycle - Market creation and resolution');
    console.log('✓ ProvePoints Economy - User points and transactions');
    console.log('✓ Avatar System - Customization and purchases');
    console.log('✓ News Integration - Article and market relationships');
    console.log('✓ Error Handling - Database constraints and edge cases');
    console.log('✓ Frontend API - Endpoint data structures and validation');

    if (failedTests > 0) {
      console.log('\nTroubleshooting:');
      console.log('=====================================');
      console.log('- Ensure database is running and accessible');
      console.log('- Check for port conflicts or running processes');
      console.log('- Verify all dependencies are installed');
      console.log('- Review detailed output above for specific errors');
    }

    console.log('\nTest suite completed.');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async runSpecificTest(testName: string): Promise<void> {
    if (!this.testFiles.includes(testName)) {
      console.log(`Test file "${testName}" not found in test suite.`);
      console.log('Available tests:');
      this.testFiles.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file}`);
      });
      return;
    }

    console.log(`Running specific test: ${testName}`);
    console.log('=====================================\n');

    await this.runSingleTest(testName);
    
    const result = this.results[0];
    if (result) {
      console.log('Test Result:');
      console.log(`Status: ${result.passed ? 'PASSED' : 'FAILED'}`);
      console.log(`Duration: ${result.duration}ms`);
      
      if (result.error) {
        console.log(`Error: ${result.error}`);
      }
      
      if (result.output) {
        console.log('\nDetailed Output:');
        console.log('=====================================');
        console.log(result.output);
      }
    }
  }
}

// Main execution
async function main() {
  const testRunner = new TestRunner();
  const args = process.argv.slice(2);

  if (args.length > 0) {
    // Run specific test
    const testName = args[0];
    await testRunner.runSpecificTest(testName);
  } else {
    // Run all tests
    await testRunner.runAllTests();
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

export { TestRunner };
