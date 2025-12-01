import { output } from 'codeceptjs';
import fs from 'node:fs';
import { ParallelReportConfig } from '.';
import { Stats } from './stats';
import { TestSuite } from './test-suite';
import { TestRun } from './test-run';

export async function mergeJsonResults (config: ParallelReportConfig): Promise<TestRun> {
  const reportDir = config.outputDir;
  const jsonReportFiles = fs.readdirSync(reportDir).filter(file => file.startsWith('thread_report') && file.endsWith('.json'));

  if (jsonReportFiles.length < 1) {
    output.error('No JSON reports found.');
    return;
  }

  const mergedTestRun = new TestRun();
  mergedTestRun.endTime = 0;

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let skippedTests = 0;

  for (const file of jsonReportFiles) {
    const filePath = `${reportDir}/${file}`;
    const content = fs.readFileSync(filePath, 'utf8');
    const testRun = JSON.parse(content);

    // Update stats.
    totalTests += testRun.stats.totalTests;
    passedTests += testRun.stats.passedTests;
    failedTests += testRun.stats.failedTests;
    skippedTests += testRun.stats.skippedTests;

    // Parse suite.
    const suites = parseTestSuites(testRun);

    for (const suite of suites) {
      mergedTestRun.suites.push(suite);

      // Add failures.
      if (suite.failures && suite.failures.length > 0) {
        for (const failure of suite.failures) {
          mergedTestRun.addFailure(failure);
        }
      }

      // Update start and end time of merged test run.
      mergedTestRun.startTime = (suite.startTime < mergedTestRun.startTime)
        ? suite.startTime
        : mergedTestRun.startTime;

      mergedTestRun.endTime = (suite.endTime > mergedTestRun.endTime)
        ? suite.endTime
        : mergedTestRun.endTime;
    }
  }

  mergedTestRun.calculateDuration();

  mergedTestRun.stats = new Stats(
    totalTests,
    passedTests,
    failedTests,
    skippedTests
  );

  return mergedTestRun;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseTestSuites (testRun: any): TestSuite[] {
  const suites: TestSuite[] = [];

  for (const suite of testRun.suites) {
    const currentSuite = new TestSuite();
    currentSuite.setTitle(suite.title);
    currentSuite.setFileName(suite.fileName);

    for (const tag of suite.tags) {
      currentSuite.addTag(tag);
    }

    currentSuite.stats = new Stats(
      suite.stats.totalTests,
      suite.stats.passedTests,
      suite.stats.failedTests,
      suite.stats.skippedTests
    );

    for (const hook of suite.hooks) {
      currentSuite.hooks.push(hook);
    }

    for (const test of suite.tests) {
      currentSuite.tests.push(test);
    }

    for (const failure of suite.failures) {
      currentSuite.failures.push(failure);
    }

    currentSuite.startTime = suite.startTime;
    currentSuite.endTime = suite.endTime;
    currentSuite.duration = suite.duration;

    suites.push(currentSuite);
  }

  return suites;
}
