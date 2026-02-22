import { output } from 'codeceptjs';
import { format } from 'date-fns';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import type { ParallelReportConfig } from '.';
import { TestRun } from './test-run';
import { TestSuite } from './test-suite';

export default async function generateReport (
  testRun: TestRun,
  config: ParallelReportConfig
): Promise<void> {
  const htmlHead = `
  <!doctype html>
  <html lang="en" data-bs-theme="light">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Parallel Test Report</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-LN+7fdVzj6u52u30Kp6M/trliBMCMKTyK833zpbD+pXdCLuTusPj697FH4R/5mcr" crossorigin="anonymous">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"/>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=warning" />
    </head>
  `;

  const reportGenerationTime = format(new Date(testRun.endTime), 'dd MMM yyyy, hh:mm:ss a');

  let html = htmlHead;
  html += '  <body>';
  html += '   <div class="container justify-content-center">';
  html += `     <h1 class="text-center m-2">${config.reportTitle}</h1>`;
  html += `     <h5 class="text-center text-secondary">${config.projectName}</h5>`;
  html += `     <div class="text-end text-body-tertiary">${reportGenerationTime}</div>`;
  html += '     <hr>';
  html += '     <div class="container pt-4 pb-4">';
  html += '       <div class="row justify-content-center mx-auto p-2 bg-primary-subtle border rounded-pill">';
  html += '         <span class="col text-center">';
  html += '           <span class="material-symbols-rounded align-bottom text-info">schedule</span>';
  html += '           <span class="fw-bold">Duration:</span>';
  html += `           <span>${(testRun.duration / 1000).toFixed(2)} s</span>`;
  html += '         </span>';
  html += '         <span class="col text-center">';
  html += '           <span class="material-symbols-rounded align-bottom text-success text-opacity-75">assignment</span>';
  html += '           <span class="fw-bold">Suites:</span>';
  html += `           <span>${testRun.suites.length}</span>`;
  html += '         </span>';
  html += '         <span class="col text-center">';
  html += '           <span class="material-symbols-rounded align-bottom text-primary">experiment</span>';
  html += '           <span class="fw-bold">Tests:</span>';
  html += `           <span>${testRun.stats.totalTests}</span>`;
  html += '         </span>';
  html += '         <span class="col text-center">';
  html += '           <span class="material-symbols-rounded align-bottom text-success">verified</span>';
  html += '           <span class="fw-bold">Passed:</span>';
  html += `           <span>${testRun.stats.passedTests}</span>`;
  html += '         </span>';
  html += '         <span class="col text-center">';
  html += '           <span class="material-symbols-rounded align-bottom text-danger">dangerous</span>';
  html += '           <span class="fw-bold">Failed:</span>';
  html += `           <span>${testRun.stats.failedTests}</span>`;
  html += '         </span>';
  html += '         <span class="col text-center">';
  html += '           <span class="material-symbols-rounded align-bottom text-warning">hourglass_top</span>';
  html += '           <span class="fw-bold">Skipped:</span>';
  html += `           <span>${testRun.stats.skippedTests}</span>`;
  html += '         </span>';
  html += '       </div>';
  html += '     </div>';
  html += '   </div>';

  html += '   <div class="container mt-4">'; // Start of report body container

  let suiteCount = 1;
  let accordionCollapseCount = 1;
  let errorCount = 1;

  const testSuites: TestSuite[] = testRun.suites;

  for (const suite of testSuites) {
    const suiteFileName = suite.fileName;

    const suiteExecutionDuration = suite.duration;

    html += '   <div class="d-grid gap-2">';
    html += `     <button class="btn btn-primary rounded-0" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${suiteCount}" aria-expanded="false" aria-controls="collapse${suiteCount}">`;
    html += '       <div class="hstack gap-3">';
    html += '         <span class="material-symbols-rounded align-bottom">assignment</span>';
    html += `         <div class="p-2">${suiteFileName}</div>`;
    html += '         <div class="p-2 ms-auto">&nbsp;</div>';
    html += '         <div class="p-2">';
    html += '           <span class="material-symbols-rounded align-bottom text-white">experiment</span>';
    html += `           <span>${suite.stats.totalTests}</span>`;
    html += '         </div>';
    html += '         <div class="p-2">';
    html += '           <span class="material-symbols-rounded align-bottom text-info">verified</span>';
    html += `           <span>${suite.stats.passedTests}</span>`;
    html += '         </div>';
    html += '         <div class="p-2">';
    html += '           <span class="material-symbols-rounded align-bottom text-danger-emphasis">dangerous</span>';
    html += `           <span>${suite.stats.failedTests}</span>`;
    html += '         </div>';
    html += '         <div class="p-2">';
    html += '           <span class="material-symbols-rounded align-bottom text-warning">hourglass_top</span>';
    html += `           <span>${suite.stats.skippedTests}</span>`;
    html += '         </div>';
    html += `         <div class="p-2">${(suiteExecutionDuration / 1000).toFixed(2)}s</div>`;
    html += '       </div>';
    html += '     </button>';
    html += '   </div>';

    html += `   <div class="collapse rounded-0 show" id="collapse${suiteCount}">`;
    html += `<div class="accordion rounded-0" id="accordion${suiteCount}">`;


    // Before Suite Hooks.
    const beforeSuiteHooks = suite.hooks.filter((hook) => hook.type === 'BeforeSuite');
    let beforeSuiteHooksDuration = 0;

    beforeSuiteHooks.forEach((hook) => {
      beforeSuiteHooksDuration += hook.duration;
    });

    if (beforeSuiteHooks.length > 0) {
      html += '<div class="accordion-item rounded-0">'; // Start of accordion-item
      html += '<h2 class="accordion-header rounded-0">'; // Start of accordion-header
      html += `<button class="accordion-button rounded-0 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accordionCollapse${accordionCollapseCount}" aria-expanded="false" aria-controls="accordionCollapse${accordionCollapseCount}">`;
      html += '   <span class="material-symbols-rounded pb-2 text-secondary">anchor</span>';
      html += '   <span class="text-wrap fw-bold p-2">Before Suite Hooks</span>';
      html += `   <span class="text-secondary position-absolute end-0 p-5">${(beforeSuiteHooksDuration / 1000).toFixed(2)}s</span>`;
      html += '</button>';
      html += '</h2>'; // End of accordion-header

      html += `<div id="accordionCollapse${accordionCollapseCount}" class="accordion-collapse collapse" data-bs-parent="#accordion${suiteCount}">`;
      html += '<div class="accordion-body">'; // Start of accordion-body
      html += '<div class="mt-3">'; // Start of BeforeSuite container

      let currentHookNumber = 1;

      for (const hook of beforeSuiteHooks) {
        html += '<div class="pb-4">';
        html += '<ul class="list-group">';
        html += '<li class="list-group-item">';
        html += ' <div class="hstack">';
        html += getHookIcon(hook.status);
        html += `   <div class="fw-bold">Hook #${currentHookNumber++}</div>`;
        html += '   <div>&nbsp;</div>';
        html += `   <div class="ms-auto text-secondary">${(hook.duration / 1000).toFixed(2)}s</div>`;
        html += ' </div>';
        html += '</li>';

        for (const step of hook.steps) {
          const stepStatusIcon = step.status === 'passed'
            ? '<span class="material-symbols-rounded align-bottom text-success">check_small</span>'
            : step.status === 'failed'
              ? '<span class="material-symbols-rounded align-bottom text-danger">close_small</span>'
              : '<span class="material-symbols-rounded align-bottom text-warning">exclamation</span>';
          const completeStep = `${step.actor}.${step.name} (${step.args})`;
          html += '<li class="list-group-item">';
          html += ' <div class="hstack">'; // Start of horizontal stack
          html += `   <div>${stepStatusIcon}</div>`;
          html += `   <div><code>${completeStep}</code></div>`;
          html += '   <div>&nbsp;</div>';
          html += `   <div class="ms-auto text-secondary">${(step.duration / 1000).toFixed(2)}s</div>`;
          html += '</div>'; // End of horizontal stack
          html += '</li>';
        }

        html += '</div>'; // End of container for hook
        html += '</ul>'; // End of list-group.
      }

      html += '</div>'; // End of BeforeSuite container inside accordion-body
      html += '</div>'; // End of accordion-body
      html += '</div>'; // End of accordion-item
      html += '   </div>'; // End of collapse

      accordionCollapseCount++;
    }

    // Tests.
    const tests = suite.tests;

    if (tests && tests.length > 0) {
      for (const test of tests) {
        html += '<div class="accordion-item rounded-0">'; // Start of accordion-item
        html += '<h2 class="accordion-header rounded-0">'; // Start of accordion-header
        html += `<button class="accordion-button rounded-0 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accordionCollapse${accordionCollapseCount}" aria-expanded="false" aria-controls="accordionCollapse${accordionCollapseCount}">`;
        html += getTestIcon(test.status);
        html += `     <span class="text-wrap p-2">${test.title}</span>`;
        html += `<span class="text-secondary position-absolute end-0 p-5">${(test.duration / 1000).toFixed(2)}s</span>`;
        html += '</button>';
        html += '</h2>'; // End of accordion-header

        html += `<div id="accordionCollapse${accordionCollapseCount}" class="accordion-collapse collapse" data-bs-parent="#accordion${suiteCount}">`;
        html += '<div class="accordion-body">'; // Start of accordion-body

        // Test Tags.
        if (test.tags && test.tags.length > 0) {
          html += '<div class="d-flex gap-0 column-gap-1">';
          html += '<span class="p-2"><h6>Tags:</h6></span>';

          // Remove duplicate tags.
          const uniqueTags = [ ...new Set(test.tags) ];

          for (const tag of uniqueTags) {
            html += `<span class="p-2 badge bg-success me-2 mb-4">${tag}</span>`;
          }

          html += '</div>'; // End of container for tags
        }

        // Before Test Hooks.
        const beforeEachHooks = test.hooks.filter((hook) => hook.type === 'Before');

        for (const hook of beforeEachHooks) {
          html += '<div class="pb-4">';
          html += '<ul class="list-group">';
          html += '<li class="list-group-item">';
          html += ' <div class="hstack">'; // Start of horizontal stack
          html += getHookIcon(hook.status);
          html += '   <div class="fw-bold">Before Test Hook</div>';
          html += '   <div>&nbsp;</div>';
          html += `   <div class="ms-auto text-secondary">${(hook.duration / 1000).toFixed(2)}s</div>`;
          html += '</div>'; // End of horizontal stack
          html += '</li>';

          for (const step of hook.steps) {
            const stepStatusIcon = step.status === 'passed'
              ? '<span class="material-symbols-rounded align-bottom text-success">check_small</span>'
              : step.status === 'failed'
                ? '<span class="material-symbols-rounded align-bottom text-danger">close_small</span>'
                : '<span class="material-symbols-rounded align-bottom text-warning">exclamation</span>';
            const completeStep = `${step.actor}.${step.name} (${step.args})`;
            html += '<li class="list-group-item">';
            html += ' <div class="hstack">'; // Start of horizontal stack
            html += `   <div>${stepStatusIcon}</div>`;
            html += `   <div><code>${completeStep}</code></div>`;
            html += '   <div>&nbsp;</div>';
            html += `   <div class="ms-auto text-secondary">${(step.duration / 1000).toFixed(2)}s</div>`;
            html += '</div>'; // End of horizontal stack
            html += '</li>';
          }

          html += '</div>'; // End of container for hook
          html += '</ul>'; // End of list-group.
        }

        // Test Steps
        html += '<ul class="list-group">';
        html += '<li class="list-group-item">';

        if (test.status === 'pending') {
          html += '<span class="fw-bold">Skip Info</span>';
        } else {
          html += '<span class="fw-bold">Steps</span>';
        }

        html += '</li>';

        for (const step of test.steps) {
          const stepStatusIcon = step.status === 'passed'
            ? '<span class="material-symbols-rounded align-bottom text-success">check_small</span>'
            : step.status === 'failed'
              ? '<span class="material-symbols-rounded align-bottom text-danger">close_small</span>'
              : '<span class="material-symbols-rounded align-bottom text-warning">exclamation</span>';
          const completeStep = `${step.actor}.${step.name} (${step.args})`;
          html += '<li class="list-group-item">';
          html += ' <div class="hstack">'; // Start of horizontal stack
          html += `   <div>${stepStatusIcon}</div>`;
          html += `   <div><code>${completeStep}</code></div>`;
          html += '   <div>&nbsp;</div>';
          html += `   <div class="ms-auto text-secondary">${(step.duration / 1000).toFixed(2)}s</div>`;
          html += '</div>'; // End of horizontal stack
          html += '</li>';
        }

        if (test.status === 'pending') {
          html += `<li class="list-group-item">
            <span class="material-symbols-rounded align-bottom text-warning">exclamation</span>
          <span><code>${test.skipInfo}</code></span>
          </li>`;
        }

        html += '</ul>'; // End of list-group.

        const afterEachHooks = test.hooks.filter((hook) => hook.type === 'After');

        for (const hook of afterEachHooks) {
          html += '<div class="pt-4">';
          html += '<ul class="list-group">';
          html += '<li class="list-group-item">';
          html += ' <div class="hstack">'; // Start of horizontal stack
          html += getHookIcon(hook.status);
          html += '   <div class="fw-bold">After Test Hook</div>';
          html += '   <div>&nbsp;</div>';
          html += `   <div class="ms-auto text-secondary">${(hook.duration / 1000).toFixed(2)}s</div>`;
          html += ' </div>'; // End of horizontal stack
          html += '</li>';

          for (const step of hook.steps) {
            const stepStatusIcon = step.status === 'passed'
              ? '<span class="material-symbols-rounded align-bottom text-success">check_small</span>'
              : step.status === 'failed'
                ? '<span class="material-symbols-rounded align-bottom text-danger">close_small</span>'
                : '<span class="material-symbols-rounded align-bottom text-warning">exclamation</span>';
            const completeStep = `${step.actor}.${step.name} (${step.args})`;
            html += '<li class="list-group-item">';
            html += ' <div class="hstack">'; // Start of horizontal stack
            html += `   <div>${stepStatusIcon}</div>`;
            html += `   <div><code>${completeStep}</code></div>`;
            html += '   <div>&nbsp;</div>';
            html += `   <div class="ms-auto text-secondary">${(step.duration / 1000).toFixed(2)}s</div>`;
            html += '</div>'; // End of horizontal stack
            html += '</li>';
          }

          html += '</div>'; // End of container for hook
          html += '</ul>'; // End of list-group.
        }

        // Test Error.
        html += '<ul class="list-group">';

        if (test.error) {
          const error = test.error;

          html += '<div class="mt-3">'; // Start of Error container

          html += `<ul class="nav nav-tabs" id="tabList${errorCount}" role="tablist">`; // Start of tab buttons
          html += '<li class="nav-item" role="presentation">';
          html += `<button class="nav-link active" id="error-tab${errorCount}" data-bs-toggle="tab" data-bs-target="#error-tab-pane${errorCount}" type="button" role="tab" aria-controls="error-tab-pane${errorCount}" aria-selected="true">Error Details</button>`;
          html += '</li>';
          html += '<li class="nav-item" role="presentation">';
          html += `<button class="nav-link" id="stack-tab${errorCount}" data-bs-toggle="tab" data-bs-target="#stack-tab-pane${errorCount}" type="button" role="tab" aria-controls="stack-tab-pane${errorCount}" aria-selected="false">Error Stack</button>`;
          html += '</li>';
          html += '</ul>'; // End of tab buttons
          html += `<div class="tab-content p-2 border border-top-0 rounded-bottom" id="tabContent${errorCount}">`;
          html += `<div class="tab-pane fade show active" id="error-tab-pane${errorCount}" role="tabpanel" aria-labelledby="error-tab${errorCount}" tabindex="0">`;
          html += '<div class="alert alert-danger" role="alert">';
          html += '<pre>';
          html += '<div class="vstack">';
          html += '<div class="p-1">';
          html += `${'Error: '.concat('\n').concat(error.message)}`;
          html += '</div>';
          html += '<div class="p-1">';
          html += `${'\nActual: '.concat('\n').concat(error.actual)}`;
          html += '</div>';
          html += '<div class="p-1">';
          html += `${'\nExpected: '.concat('\n').concat(error.expected)}`;
          html += '</div>';
          html += '</div>'; // End of vstack
          html += '</pre>';
          html += '</div>'; // End of alert
          html += '</div>'; // End of error tab
          html += `<div class="tab-pane fade" id="stack-tab-pane${errorCount}" role="tabpanel" aria-labelledby="stack-tab${errorCount}" tabindex="0">`;
          html += '<div class="alert alert-danger" role="alert">';
          html += '<pre>';
          html += `${error.stack}`;
          html += '</pre>';
          html += '</div>'; // End of alert
          html += '</div>'; // End of stack tab
          html += '</div>'; // End of tab content div

          html += '</div>'; // End of error container
        }

        errorCount++;

        html += '</div>'; // End of container inside accordion-body
        html += '</div>'; // End of accordion-body

        html += '</div>'; // End of accordion-item
        accordionCollapseCount++;
      }
    }

    // After Suite Hooks.
    const afterSuiteHooks = suite.hooks.filter((hook) => hook.type === 'AfterSuite');
    let afterSuiteHooksDuration = 0;

    afterSuiteHooks.forEach((hook) => {
      afterSuiteHooksDuration += hook.duration;
    });


    if (afterSuiteHooks.length > 0) {
      html += '<div class="accordion-item rounded-0">'; // Start of accordion-item
      html += '<h2 class="accordion-header rounded-0">'; // Start of accordion-header
      html += `<button class="accordion-button rounded-0 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accordionCollapse${accordionCollapseCount}" aria-expanded="false" aria-controls="accordionCollapse${accordionCollapseCount}">`;
      html += '   <span class="material-symbols-rounded pb-2 text-secondary">anchor</span>';
      html += '   <span class="text-wrap fw-bold p-2">After Suite Hooks</span>';
      html += `   <span class="text-secondary position-absolute end-0 p-5">${(afterSuiteHooksDuration / 1000).toFixed(2)}s</span>`;
      html += '</button>';
      html += '</h2>'; // End of accordion-header

      html += `<div id="accordionCollapse${accordionCollapseCount}" class="accordion-collapse collapse" data-bs-parent="#accordion${suiteCount}">`;
      html += '<div class="accordion-body">'; // Start of accordion-body
      html += '<div class="mt-3">'; // Start of AfterSuite container

      let currentHookNumber = 1;

      for (const hook of afterSuiteHooks) {
        html += '<div class="pb-4">';
        html += '<ul class="list-group">';
        html += '<li class="list-group-item">';
        html += ' <div class="hstack">';
        html += getHookIcon(hook.status);
        html += `   <div class="fw-bold">Hook #${currentHookNumber++}</div>`;
        html += '   <div>&nbsp;</div>';
        html += `   <div class="ms-auto text-secondary">${(hook.duration / 1000).toFixed(2)}s</div>`;
        html += ' </div>';
        html += '</li>';

        for (const step of hook.steps) {
          const stepStatusIcon = step.status === 'passed'
            ? '<span class="material-symbols-rounded align-bottom text-success">check_small</span>'
            : step.status === 'failed'
              ? '<span class="material-symbols-rounded align-bottom text-danger">close_small</span>'
              : '<span class="material-symbols-rounded align-bottom text-warning">exclamation</span>';
          const completeStep = `${step.actor}.${step.name} (${step.args})`;
          html += '<li class="list-group-item">';
          html += ' <div class="hstack">'; // Start of horizontal stack
          html += `   <div>${stepStatusIcon}</div>`;
          html += `   <div><code>${completeStep}</code></div>`;
          html += '   <div>&nbsp;</div>';
          html += `   <div class="ms-auto text-secondary">${(step.duration / 1000).toFixed(2)}s</div>`;
          html += '</div>'; // End of horizontal stack
          html += '</li>';
        }

        html += '</div>'; // End of container for hook
        html += '</ul>'; // End of list-group.
      }

      html += '</div>'; // End of BeforeSuite container inside accordion-body
      html += '</div>'; // End of accordion-body
      html += '</div>'; // End of accordion-item
      html += '   </div>'; // End of collapse
      accordionCollapseCount++;
    }

    html += '   </div>'; // End of accordion
    html += '   </div>'; // End of collapse
    html += '   <br/>';

    suiteCount++;
  }

  html += '   </div>'; // End of report body container

  // Failures.
  const failures = testRun.failures;

  if (failures && failures.length > 0) {
    html += '<div class="container mt-4">'; // Start of failures container

    html += '   <div class="d-grid gap-2">';
    html += `     <button class="btn btn-primary text-start rounded-0" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${suiteCount}" aria-expanded="false" aria-controls="collapse${suiteCount}">`;
    html += '       <div class="hstack gap-3">';
    html += '         <div class="p-2"><span class="material-symbols-rounded position-absolute translate-middle">error</span></div>';
    html += '         <div>Failures</div>';
    html += '         <div class="p-2 ms-auto">&nbsp;</div>';
    html += `         <div class="p-2">${failures.length}</div>`;
    html += '       </div>';
    html += '     </button>';
    html += '   </div>';

    html += `<div class="collapse rounded-0 show" id="collapse${suiteCount}">`; // Start of failures collapse

    html += `<div class="accordion rounded-0" id="accordion${suiteCount}">`; // Start of failures accordion

    let failureCount = 10001;

    for (const error of failures) {
      html += '<div class="accordion-item rounded-0">'; // Start of accordion-item

      const shortenedFileName = error.file.replace(process.cwd(), '');

      html += '<h2 class="accordion-header rounded-0">'; // Start of accordion-header
      html += `<button class="accordion-button rounded-0 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accordionCollapse${accordionCollapseCount}" aria-expanded="false" aria-controls="accordionCollapse${accordionCollapseCount}">`;
      html += '<ul class="list-group list-group-horizontal">';
      html += `<li class="list-group-item flex-fill">${shortenedFileName}</li>`;
      html += `<li class="list-group-item flex-fill text-wrap">${error.testName}</li>`;
      html += `<li class="list-group-item flex-fill text-wrap">${error.message}</li>`;
      html += '</ul>';
      html += '</button>';
      html += '</h2>'; // End of accordion-header

      html += `<div id="accordionCollapse${accordionCollapseCount}" class="accordion-collapse collapse p-3" data-bs-parent="#accordion${suiteCount}">`; // Start of failure accordion-body-collapse
      html += '<div class="accordion-body">'; // Start of accordion-body

      html += '<div class="mt-3">'; // Start of Error container

      html += `<ul class="nav nav-tabs" id="tabList${failureCount}" role="tablist">`; // Start of tab buttons
      html += '<li class="nav-item" role="presentation">';
      html += `<button class="nav-link active" id="error-tab${failureCount}" data-bs-toggle="tab" data-bs-target="#error-tab-pane${failureCount}" type="button" role="tab" aria-controls="error-tab-pane${failureCount}" aria-selected="true">Error Details</button>`;
      html += '</li>';
      html += '<li class="nav-item" role="presentation">';
      html += `<button class="nav-link" id="stack-tab${failureCount}" data-bs-toggle="tab" data-bs-target="#stack-tab-pane${failureCount}" type="button" role="tab" aria-controls="stack-tab-pane${failureCount}" aria-selected="false">Error Stack</button>`;
      html += '</li>';
      html += '</ul>'; // End of tab buttons
      html += `<div class="tab-content p-2 border border-top-0 rounded-bottom" id="tabContent${failureCount}">`;
      html += `<div class="tab-pane fade show active" id="error-tab-pane${failureCount}" role="tabpanel" aria-labelledby="error-tab${failureCount}" tabindex="0">`;
      html += '<div class="alert alert-danger" role="alert">';
      html += '<pre>';
      html += '<div class="vstack">';
      html += '<div class="p-1">';
      html += `${'Error: '.concat('\n').concat(error.message)}`;
      html += '</div>';
      html += '<div class="p-1">';
      html += `${'\nActual: '.concat('\n').concat(error.actual)}`;
      html += '</div>';
      html += '<div class="p-1">';
      html += `${'\nExpected: '.concat('\n').concat(error.expected)}`;
      html += '</div>';
      html += '</div>'; // End of vstack
      html += '</pre>';
      html += '</div>'; // End of alert
      html += '</div>'; // End of error tab
      html += `<div class="tab-pane fade" id="stack-tab-pane${failureCount}" role="tabpanel" aria-labelledby="stack-tab${failureCount}" tabindex="0">`;
      html += '<div class="alert alert-danger" role="alert">';
      html += '<pre>';
      html += `${error.stack}`;
      html += '</pre>';
      html += '</div>'; // End of alert
      html += '</div>'; // End of stack tab
      html += '</div>'; // End of tab content div

      html += '</div>'; // End of error container

      html += '   </div>'; // End of failures accordion-body
      html += '   </div>'; // End of failures accordion-body-collapse
      html += '   </div>'; // End of failures accordion-item

      accordionCollapseCount++;
      failureCount++;
    }

    html += '   </div>'; // End of failures accordion
    html += '   </div>'; // End of failures collapse
    html += '   </div>'; // End of failures container
  }

  html += '<div class="container justify-content-center p-2">';
  html += '<hr/>';
  html += '<div class="text-center"> Made with ';
  html += '<span class="material-symbols-rounded align-bottom text-danger">favorite</span>';
  html += ' in 🇮🇳</div>';
  html += '</div>';

  html += '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js" integrity="sha384-ndDqU0Gzau9qJ1lfW4pNLlhNTkCfHzAVBReH9diLvGRem5+R9g2FzA8ZGN954O5Q" crossorigin="anonymous"></script>';
  html += ' </body>';
  html += '</html>';

  try {
    const reportFilePath = path.normalize(`${config.outputDir}/${config.fileName}`);
    writeFileSync(reportFilePath, html, 'utf-8');

    output.success(`\nA report was generated successfully at ${reportFilePath}`);
  } catch (err) {
    if (err instanceof Error) {

      output.error(`\nError generating the report: ${err.message}`);
      output.error(err.stack);
    }
  }
}

function getTestIcon (testStatus: string): string {
  let icon = '';

  switch (testStatus) {
    case 'passed':
      icon = '<span class="material-symbols-rounded text-success">check</span>';
      break;
    case 'failed':
      icon = '<span class="material-symbols-rounded text-danger">close</span>';
      break;
    case 'pending':
      icon = '<span class="material-symbols-outlined text-warning">warning</span>';
      break;
    default:
      icon = '<span class="material-symbols-rounded text-info">question_mark</span>';
      break;
  }

  return icon;
}

function getHookIcon (hookStatus: string): string {
  let hookIcon = '';

  switch (hookStatus) {
    case 'passed':
      hookIcon = '<div class="material-symbols-rounded text-success">phishing</div>';
      break;
    case 'failed':
      hookIcon = '<div class="material-symbols-rounded text-danger">phishing</div>';
      break;
    case 'pending':
      hookIcon = '<div class="material-symbols-rounded text-warning">phishing</div>';
      break;
    default:
      hookIcon = '<div class="material-symbols-rounded text-info">phishing</div>';
      break;
  }

  return hookIcon;
}
