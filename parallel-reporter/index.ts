import { config as codeceptJsConfig, event, output } from 'codeceptjs';
import { readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { threadId } from 'node:worker_threads';
import { Hook } from './hook';
import generateReport from './generate-report';
import { mergeJsonResults } from './merge-results';
import { Stats } from './stats';
import { Step } from './step';
import { Test } from './test';
import { TestError } from './test-error';
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

  let testSuite: TestSuite;
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let skippedTests = 0;
  let currentHook: Hook | null = null;
  let currentTest: Test | null = null;

  event.dispatcher.on(event.all.before, () => {
    testSuite = new TestSuite();
  });

  event.dispatcher.on(event.hook.started, (hook) => {
    const newHook = new Hook(hook.title);

    currentHook = newHook;
  });

  event.dispatcher.on(event.hook.finished, (hook) => {
    const finishedHook = currentHook ?? new Hook(hook.title);
    finishedHook.endTime = Date.now();
    finishedHook.calculateDuration();

    const hookType = hook.runnable.originalTitle.split('hook: ').at(1);
    finishedHook.type = hookType;

    finishedHook.status = hook.runnable.err
      ? 'failed'
      : 'passed';

    finishedHook.location = hook.runnable.file;
    finishedHook.body = hook.runnable.body;

    finishedHook.error = getTestErrors(hook.runnable);

    if (hook.title.includes('before all') || hook.title.includes('after all')) {
      testSuite.addHook(finishedHook);
    }

    if (currentTest) {
      currentTest.hooks.push(finishedHook);
    }

    currentHook = null;
  });

  event.dispatcher.on(event.step.started, (step) => {
    const newStep = new Step(step.name);

    if (currentTest) {
      currentTest.steps.push(newStep);
    }

    if (currentHook) {
      currentHook.steps.push(newStep);
    }
  });

  event.dispatcher.on(event.step.finished, (step) => {
    let finishedStep: Step | undefined;

    if (currentTest && currentTest.steps && currentTest.steps.length > 0) {
      finishedStep = currentTest.steps.findLast((s) => s.name === step.name);

      if (!finishedStep) {
        finishedStep = new Step(step.name);

        if (currentTest) {
          currentTest.steps.push(finishedStep);
        }
      }
    }

    if (currentHook && currentHook.steps && currentHook.steps.length > 0) {
      finishedStep = currentHook.steps.findLast((s) => s.name === step.name);

      if (!finishedStep) {
        finishedStep = new Step(step.name);

        if (currentHook) {
          currentHook.steps.push(finishedStep);
        }
      }
    }

    finishedStep.endTime = Date.now();
    finishedStep.calculateDuration();

    finishedStep.actor = step.actor;
    finishedStep.status = getStepStatus(step.status);
    finishedStep.args = getStepArguments(step);
  });

  event.dispatcher.on(event.test.before, () => {
    currentHook = null;
    currentTest = null;
  });

  event.dispatcher.on(event.test.started, (test) => {
    const newTest = new Test(test.title);
    testSuite.addTest(newTest);
    currentTest = newTest;

    totalTests++;
  });

  event.dispatcher.on(event.test.finished, (test) => {
    const finishedTest = currentTest ?? testSuite.tests.findLast((t) => t.title === test.title);

    if (!finishedTest) {
      output.error(`Parallel Report: Could not find finished test for title '${test.title}'`);
      return;
    }

    finishedTest.endTime = Date.now();
    finishedTest.calculateDuration();

    finishedTest.status = test.state;
    finishedTest.body = test.body;
    finishedTest.tags = test.tags;
    finishedTest.file = test.file;
    finishedTest.steps = currentTest.steps;
    finishedTest.error = getTestErrors(test);
    finishedTest.warnings = test.warnings;
    finishedTest.hooks = (currentTest?.hooks)
      ? currentTest.hooks
      : [];

    if (finishedTest.status === 'failed') {
      failedTests++;
      testSuite.addFailure(finishedTest.error);
    } else {
      passedTests++;
    }

    currentTest = null;
  });

  event.dispatcher.on(event.test.skipped, (test) => {
    const skippedTest = new Test(test.title);
    testSuite.addTest(skippedTest);

    skippedTest.status = test.state;
    skippedTest.body = test.body;
    skippedTest.tags = test.tags;
    skippedTest.file = test.file;

    skippedTest.skipInfo = (test.opts.skipInfo?.message)
      ? test.opts.skipInfo.message
      : 'No additional information available for this pending test.';

    skippedTests++;

    // Skipped tests never start, so add them to total here.
    totalTests++;
  });

  event.dispatcher.on(event.all.after, () => {
    testSuite.endTime = Date.now();
    testSuite.calculateDuration();

    testSuite.stats = new Stats(
      totalTests,
      passedTests,
      failedTests,
      skippedTests
    );

    const reportPath = `${effectiveConfig.outputDir}/thread_report${threadId}.json`;
    writeFileSync(reportPath, JSON.stringify(testSuite, null, 2));
  });

  event.dispatcher.on(event.workers.result, async () => {
    const mergedTestSuite = await mergeJsonResults(effectiveConfig);

    if (mergedTestSuite) {
      // TODO: remove after testing.
      const reportPath = `${effectiveConfig.outputDir}/merged_suite.json`;
      writeFileSync(reportPath, JSON.stringify(mergedTestSuite, null, 2));

      try {
        await generateReport(mergedTestSuite, effectiveConfig);
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
