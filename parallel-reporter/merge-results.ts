import { output } from 'codeceptjs';
import fs from 'node:fs';
import { ParallelReportConfig } from '.';
import { Stats } from './stats';
import { TestSuite } from './test-suite';

export async function mergeJsonResults (config: ParallelReportConfig): Promise<TestSuite> {
  const reportDir = config.outputDir;
  const jsonReportFiles = fs.readdirSync(reportDir).filter(file => file.startsWith('thread_report') && file.endsWith('.json'));

  if (jsonReportFiles.length < 1) {
    output.error('No JSON reports found.');
    return;
  }

  const mergedSuite = new TestSuite();
  mergedSuite.endTime = 0;

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let skippedTests = 0;

  for (const file of jsonReportFiles) {
    const filePath = `${reportDir}/${file}`;
    const content = fs.readFileSync(filePath, 'utf8');
    const suite = JSON.parse(content);

    // Update stats.
    totalTests += suite.stats.totalTests;
    passedTests += suite.stats.passedTests;
    failedTests += suite.stats.failedTests;
    skippedTests += suite.stats.skippedTests;

    // Add tests.
    for (const test of suite.tests) {
      mergedSuite.addTest(test);
    }

    // Add failures.
    if (suite.failures && suite.failures.length > 0) {
      for (const failure of suite.failures) {
        mergedSuite.addFailure(failure);
      }
    }

    // Add hooks.
    for (const hook of suite.hooks) {
      mergedSuite.addHook(hook);
    }


    mergedSuite.startTime = (suite.startTime < mergedSuite.startTime)
      ? suite.startTime
      : mergedSuite.startTime;

    mergedSuite.endTime = (suite.endTime > mergedSuite.endTime)
      ? suite.endTime
      : mergedSuite.endTime;
  }

  mergedSuite.calculateDuration();

  mergedSuite.stats = new Stats(
    totalTests,
    passedTests,
    failedTests,
    skippedTests
  );

  return mergedSuite;
}
