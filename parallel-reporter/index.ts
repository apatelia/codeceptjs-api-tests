import { config as codeceptJsConfig, event, output } from 'codeceptjs';
import { readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { threadId } from 'node:worker_threads';
import generateReport from './generate-report';
import { Hook } from './hook';
import { mergeJsonResults } from './merge-results';
import { Stats } from './stats';
import { Step } from './step';
import { Test } from './test';
import { TestError } from './test-error';
import { TestRun } from './test-run';
import { TestSuite } from './test-suite';

export interface ParallelReportConfig {
  outputDir?: string;
  fileName?: string;
  reportTitle?: string;
  projectName?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getStepArguments (step: any): string {
  const args = step.args;
  let formattedArgs = '';

  for (const argument of args) {
    const argumentIsAnObject = (typeof argument === 'object');
    const argumentIsRegex = (argument instanceof RegExp);
    const argumentIsNumber = (typeof argument === 'number');
    const argumentIsBoolean = (typeof argument === 'boolean');

    let wellFormatted = '';
    if (argumentIsAnObject && !argumentIsRegex) {
      wellFormatted = (argument.length < 20)
        ? JSON.stringify(argument, null, 2)
        : '{ object }';
    } else if (argument.toString().startsWith('{"_secret":"')) {
      wellFormatted = '<secret>';
    } else if (argumentIsNumber || argumentIsBoolean) {
      wellFormatted = argument.toString();
    } else {
      wellFormatted = `'${argument.toString().toWellFormed()}'`;
    }

    formattedArgs = formattedArgs.concat(`${wellFormatted}, `);
  }

  // Strip off redundant last comma and whitespace from arguments.
  formattedArgs = formattedArgs.replace(/(, )$/, '');

  return formattedArgs;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTestErrors (test: any): TestError | null {
  if (test.err) {
    const testError = test.err;
    const errorStack = (testError.stack)
      ? testError.stack.toWellFormed().replace(/(\[\d{1,2}m)/gm, '').trim()
      : 'No stack trace available';

    const errorMessage = getFormattedErrorMessage(testError.message);
    const actualValue = getFormattedValue(testError.actual);
    const expectedValue = getFormattedValue(testError.expected);

    const error = new TestError(
      errorStack,
      errorMessage,
      actualValue,
      expectedValue,
      test.file,
      test.title
    );

    return error;
  }

  return null;
}

function getFormattedErrorMessage (errorMessage: string): string {
  let formattedErrorMessage = 'No error message available';

  if (errorMessage) {
    const messageStart = '[1] "';

    if (errorMessage.includes(messageStart)) {
      const actualMessage = errorMessage.substring(errorMessage.indexOf(messageStart));
      formattedErrorMessage = actualMessage.toWellFormed().replace(/\[\d{1,2}m/gm, '').trim();
    } else {
      formattedErrorMessage = errorMessage.toWellFormed();
    }
  }

  return formattedErrorMessage.toWellFormed();
}

function getFormattedValue (valueFromError: unknown): string {
  let formattedValue = 'Not Available/Applicable';

  if (typeof valueFromError === 'object' && valueFromError instanceof RegExp) {
    formattedValue = JSON.stringify(valueFromError, null, 2);
  } else {
    formattedValue = valueFromError.toString().toWellFormed();
  }

  return formattedValue.toWellFormed();
}

function getStepStatus (stepStatus: string): string {
  let status = '';

  switch (stepStatus) {
    case 'failed':
      status = 'failed';
      break;
    case 'success':
      status = 'passed';
      break;
    case 'skipped':
      status = 'skipped';
      break;
    case 'pending':
      status = 'pending';
      break;
    default:
      status = 'unknown';
      break;
  }

  return status;
}

function parallelReport (config: ParallelReportConfig): void {
  const effectiveConfig: ParallelReportConfig = {
    outputDir: config?.outputDir || codeceptJsConfig.get().output,
    fileName: config?.fileName || 'parallel-report.html',
    reportTitle: config?.reportTitle || 'Test Report',
    projectName: config?.projectName || codeceptJsConfig.get().name
  };

  let testRun: TestRun;
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let skippedTests = 0;
  let currentSuite: TestSuite;
  let currentTest: Test;
  let currentHook: Hook;
  let hookIsRunning = false;

  event.dispatcher.on(event.all.before, () => {
    testRun = new TestRun();
  });

  event.dispatcher.on(event.suite.before, (suite) => {
    const shortenedFileName = suite.file.replace(process.cwd(), '');
    const newSuite = new TestSuite(suite.title, shortenedFileName);

    for (const tag of suite.tags) {
      newSuite.addTag(tag);
    }

    currentSuite = newSuite;
    output.debug(`Before suite: ${shortenedFileName} - ${suite.title}`);
  });

  event.dispatcher.on(event.suite.after, (suite) => {
    output.debug(`After suite: ${suite.file} - ${currentSuite?.tests.length} tests executed.`);
    currentSuite.endTime = Date.now();
    currentSuite.calculateDuration();

    const suiteStats = new Stats(
      currentSuite.tests.length,
      currentSuite.tests.filter(test => test.status === 'passed').length,
      currentSuite.tests.filter(test => test.status === 'failed').length,
      currentSuite.tests.filter(test => test.status === 'pending').length
    );

    currentSuite.stats = suiteStats;

    testRun.suites.push(currentSuite);
    currentSuite = null;
  });

  event.dispatcher.on(event.hook.started, (hook) => {
    output.debug(`Hook started: ${hook.title}`);
    const newHook = new Hook(hook.title);

    currentHook = newHook;
    hookIsRunning = true;
  });

  event.dispatcher.on(event.hook.finished, (hook) => {
    output.debug(`Hook finished: ${hook.title}`);
    const finishedHook = currentHook;
    finishedHook.endTime = Date.now();
    finishedHook.calculateDuration();

    const hookType = hook.runnable.originalTitle.split('hook: ').at(1);
    finishedHook.type = hookType;

    finishedHook.status = hook.runnable.err
      ? 'failed'
      : 'passed';

    finishedHook.location = hook.runnable.file;
    finishedHook.error = getTestErrors(hook.runnable);

    if (hook.title.includes('before all') || hook.title.includes('after all')) {
      currentSuite.addHook(finishedHook);
    }

    if (currentTest) {
      currentTest.hooks.push(finishedHook);
    }

    currentHook = null;
    hookIsRunning = false;
  });

  event.dispatcher.on(event.test.before, (test) => {
    output.debug(`Before test: ${test.title}`);

    const newTest = new Test(test.title);
    currentTest = newTest;

    totalTests += 1;
  });

  event.dispatcher.on(event.test.after, (test) => {
    output.debug(`After test: ${test.title}`);

    currentTest = null;
  });

  event.dispatcher.on(event.test.started, (test) => {
    output.debug(`Test started: ${test.title}`);
    currentTest.startTime = Date.now();
  });

  event.dispatcher.on(event.test.passed, (test) => {
    output.debug(`Test passed: ${test.title}`);
    passedTests += 1;
  });

  event.dispatcher.on(event.test.failed, (test) => {
    output.debug(`Test failed: ${test.title}`);
    failedTests += 1;

    currentTest.error = getTestErrors(test);
    currentSuite.addFailure(currentTest.error);
  });

  event.dispatcher.on(event.test.skipped, (test) => {
    output.debug(`Test skipped: ${test.title}`);
    skippedTests += 1;
    totalTests += 1;

    const skippedTest = new Test(test.title);
    currentSuite.addTest(skippedTest);

    skippedTest.status = test.state;
    skippedTest.tags = test.tags;
    skippedTest.file = test.file;

    skippedTest.skipInfo = (test.opts.skipInfo?.message)
      ? test.opts.skipInfo.message
      : 'No additional information available for this skipped test.';
  });

  event.dispatcher.on(event.test.finished, (test) => {
    output.debug(`Test finished: ${test.title}`);
    currentTest.endTime = Date.now();
    currentTest.calculateDuration();
    currentTest.status = test.state;
    currentTest.tags = test.tags;
    currentTest.file = test.file;
    currentTest.error = getTestErrors(test);
    currentTest.warnings = test.warnings;
    currentTest.hooks = (currentTest?.hooks)
      ? currentTest.hooks
      : [];

    currentTest.sortStepsByStartTime();

    currentSuite.addTest(currentTest);
  });

  event.dispatcher.on(event.step.started, (step) => {
    output.debug(`Step started: ${step.name}`);
    const newStep = new Step(step.name);

    if (hookIsRunning && currentHook) {
      currentHook.steps.push(newStep);
    } else if (currentTest) {
      currentTest.steps.push(newStep);
    }

  });

  event.dispatcher.on(event.step.passed, (step) => {
    output.debug(`Step passed: ${step.name}`);
  });

  event.dispatcher.on(event.step.failed, (step) => {
    output.debug(`Step failed: ${step.name}`);
  });

  event.dispatcher.on(event.step.finished, (step) => {
    output.debug(`Step finished: ${step.name}`);
    let finishedStep: Step | undefined;

    if (hookIsRunning && currentHook && currentHook.steps && currentHook.steps.length > 0) {
      finishedStep = currentHook.steps.findLast((s) => s.name === step.name);
    } else {
      if (currentTest && currentTest.steps && currentTest.steps.length > 0) {
        finishedStep = currentTest.steps.findLast((s) => s.name === step.name);
      }
    }

    if (!finishedStep) {
      finishedStep = new Step(step.name);

      if (hookIsRunning && currentHook) {
        currentHook.steps.push(finishedStep);
      } else if (currentTest) {
        currentTest.steps.push(finishedStep);
      }
    }

    finishedStep.endTime = Date.now();
    finishedStep.calculateDuration();

    finishedStep.actor = step.actor;
    finishedStep.status = getStepStatus(step.status);
    finishedStep.args = getStepArguments(step);
  });

  event.dispatcher.on(event.all.after, () => {
    testRun.endTime = Date.now();
    testRun.calculateDuration();

    testRun.stats = new Stats(
      totalTests,
      passedTests,
      failedTests,
      skippedTests
    );

    const reportPath = `${effectiveConfig.outputDir}/thread_report${threadId}.json`;
    writeFileSync(reportPath, JSON.stringify(testRun, null, 2));
  });

  event.dispatcher.on(event.workers.result, async () => {
    const mergedResults = await mergeJsonResults(effectiveConfig);

    if (mergedResults) {
      try {
        await generateReport(mergedResults, effectiveConfig);
      } catch (error) {
        if (error instanceof Error) {
          output.error('Parallel Report: Failed to generate report.');
          output.error(error.message);
          output.debug(error.stack);
        } else {
          output.error('Parallel Report: Failed to generate report.');
          output.error('Unknown error occurred:');
          output.error(error);
        }
      } finally {
        // Delete thread json files
        const threadFiles = readdirSync(effectiveConfig.outputDir).filter(file => file.startsWith('thread_report') && file.endsWith('.json'));
        for (const file of threadFiles) {
          unlinkSync(path.join(effectiveConfig.outputDir, file));
        }
      }
    } else {
      output.error('No tests found. No report was generated.');
    }
  });
}

module.exports = parallelReport;
