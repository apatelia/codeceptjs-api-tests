import { writeFileSync } from 'node:fs';
import path from 'node:path';
import type { ParallelReportConfig } from '.';
import { type Step, type Suite } from './types';
import { format } from 'date-fns';

export default async function generateReport (result: Suite, config: ParallelReportConfig): Promise<void> {
  const suite = result;

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
    </head>
  `;

  const reportGenerationTime = format(new Date(suite._endTime), 'dd MMM yyyy, hh:mm:ss a');

  let html = htmlHead;
  html += '  <body>';
  html += '   <div class="container justify-content-center">';
  html += `     <h1 class="text-center m-2">${config.reportTitle}</h1>`;
  html += `     <h5 class="text-center text-secondary">${config.projectName}</h5>`;
  html += `     <div class="text-end text-body-tertiary">${reportGenerationTime}</div>`;
  html += '     <hr>';
  html += '     <div class="container p-4">';
  html += '       <div class="row justify-content-center mx-auto p-2 bg-primary-subtle border rounded-pill">';
  html += '         <span class="col text-center">';
  html += '           <span class="material-symbols-rounded align-bottom text-info">schedule</span>';
  html += '           <span class="p-1 fw-bold">Duration:</span>';
  html += `           <span>${(suite._stats.duration / 1000).toFixed(2)} s</span>`;
  html += '         </span>';
  html += '         <span class="col text-center">';
  html += '           <span class="material-symbols-rounded align-bottom text-primary">experiment</span>';
  html += '           <span class="p-1 fw-bold">Tests:</span>';
  html += `           <span>${suite._stats.tests}</span>`;
  html += '         </span>';
  html += '         <span class="col text-center">';
  html += '           <span class="material-symbols-rounded align-bottom text-success">verified</span>';
  html += '           <span class="p-1 fw-bold">Passed:</span>';
  html += `           <span>${suite._stats.passes}</span>`;
  html += '         </span>';
  html += '         <span class="col text-center">';
  html += '           <span class="material-symbols-rounded align-bottom text-danger">dangerous</span>';
  html += '           <span class="p-1 fw-bold">Failed:</span>';
  html += `           <span>${suite._stats.failures}</span>`;
  html += '         </span>';
  html += '         <span class="col text-center">';
  html += '           <span class="material-symbols-rounded align-bottom text-warning">hourglass_top</span>';
  html += '           <span class="p-1 fw-bold">Pending:</span>';
  html += `           <span>${suite._stats.pending}</span>`;
  html += '         </span>';
  html += '       </div>';
  html += '     </div>';
  html += '   </div>';

  const testGroups = Object.groupBy(suite._tests, (test) => test[ 'parent' ].title);

  html += '   <div class="container mt-4">';

  let groupCount = 1;
  let accordionCollapseCount = 1;

  for (const group in testGroups) {
    const tests = testGroups[ group ];

    html += '   <div class="d-grid gap-2">';
    html += `     <button class="btn btn-primary text-start rounded-0" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${groupCount}" aria-expanded="false" aria-controls="collapse${groupCount}">`;
    html += `       <span>${group}</span>`;
    html += '     </button>';
    html += '   </div>';

    if (groupCount === 1) {
      html += `   <div class="collapse rounded-0 show" id="collapse${groupCount}">`;
    } else {
      html += `   <div class="collapse rounded-0" id="collapse${groupCount}">`;
    }

    html += `<div class="accordion rounded-0" id="accordion${groupCount}">`;

    if (tests && tests.length > 0) {
      for (const test of tests!) {
        html += '<div class="accordion-item rounded-0">';
        html += '<h2 class="accordion-header rounded-0">';
        html += `<button class="accordion-button rounded-0" type="button" data-bs-toggle="collapse" data-bs-target="#accordionCollapse${accordionCollapseCount}" aria-expanded="true" aria-controls="accordionCollapse${accordionCollapseCount}">`;
        const icon = test.state === 'passed'
          ? '<span class="material-symbols-rounded text-success">check</span>'
          : '<span class="material-symbols-rounded text-danger">close</span>';
        html += `${icon}`;
        html += `     <span class="text-wrap p-2">${test.title}</span>`;

        html += `<span class="text-secondary position-absolute end-0 p-5">${(test.duration / 1000).toFixed(2)}s</span>`;
        html += '</button>';
        html += '</h2>'; // End of accordion-header

        html += `<div id="accordionCollapse${accordionCollapseCount}" class="accordion-collapse collapse" data-bs-parent="#accordion${groupCount}">`;
        html += '<div class="accordion-body">';

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

        html += '<ul class="list-group">';

        // Sort steps by their start time, so they appear in correct order in report.
        const sortedSteps = test.steps.sort((prev, next) => prev.startTime - next.startTime);

        for (const step of sortedSteps) {
          const stepStatusIcon = step.status === 'success'
            ? '<span class="material-symbols-rounded align-bottom text-success">check_small</span>'
            : step.status === 'failed'
              ? '<span class="material-symbols-rounded align-bottom text-danger">close_small</span>'
              : '<span class="material-symbols-rounded align-bottom text-warning">exclamation</span>';
          const fullStep = `${step.actor}.${step.name}(${getStepArguments(step)})`;
          html += `<li class="list-group-item">
            <span>${stepStatusIcon}</span>
          <span><code>${fullStep}</code></span>
          </li>`;
        }
        html += '</ul>'; // End of list-group.

        if (test.err) {
          const errorStack = test.err.stack
            ? test.err.stack.toWellFormed().replace(/(\[\d{1,2}m)/gm, '').trim()
            : 'No stack trace available';
          const errorMessage = test.err.message
            ? test.err.message.toWellFormed()
            : 'No error message available';
          const actualValue = test.err.actual.toWellFormed();
          const expectedValue = test.err.expected.toWellFormed();
          const error = {
            stack: errorStack,
            message: errorMessage,
            actual: actualValue,
            expected: expectedValue,
          };
          html += '<div class="alert alert-danger mt-3" role="alert">';
          html += '<pre>';
          html += `${'Error: '.concat(error.message)}`;
          html += `${'\nActual: '.concat(error.actual)}`;
          html += `${'\nExpected: '.concat(error.expected)}`;
          html += `${'\n'.concat(error.stack)}`;
          html += '</pre>';
          html += '</div>';
        }

        html += '</div>'; // End of container inside accordion-body
        html += '</div>'; // End of accordion-body

        html += '</div>'; // End of accordion-item
        accordionCollapseCount++;
      }
    }

    html += '   </div>'; // End of accordion
    html += '   </div>'; // End of collapse
    html += '   <br/>';

    groupCount++;
  }

  html += '   </div>';

  html += '<div class="container justify-content-center p-2">';
  html += '<hr/>';
  html += '<div class="text-center"> Made in 🇮🇳  with';
  html += '<span class="material-symbols-rounded align-bottom text-danger">favorite</span>';
  html += '</div>';
  html += '</div>';

  html += '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js" integrity="sha384-ndDqU0Gzau9qJ1lfW4pNLlhNTkCfHzAVBReH9diLvGRem5+R9g2FzA8ZGN954O5Q" crossorigin="anonymous"></script>';
  html += ' </body>';
  html += '</html>';

  try {
    const reportFilePath = path.normalize(`${config.outputDir}/${config.fileName}`);
    writeFileSync(reportFilePath, html, 'utf-8');
    // eslint-disable-next-line no-console
    console.log('\n', `A report was generated successfully at ${reportFilePath}`);
  } catch (err) {
    if (err instanceof Error) {
      // eslint-disable-next-line no-console
      console.error('Error generating the report:', err.message, err.stack);
    }
  }
}

function getStepArguments (step: Step): string {
  const args = step.args;
  let formattedArgs = '';

  for (const argument of args) {
    const wellFormatted = argument.toWellFormed();
    const argumentIsNumber = (argument && argument !== '' && !isNaN(Number(wellFormatted)));
    const argumentIsAnArray = (argument && argument.startsWith('[') && argument.endsWith(']'));
    const argumentIsAnObject = (argument && argument.startsWith('{') && argument.endsWith('}'));
    const argumentIsTruncatedSchema = (argument && argument.startsWith('{') && argument.endsWith(':'));

    if (argumentIsNumber || argumentIsAnArray) {
      formattedArgs = formattedArgs.concat(`${wellFormatted}, `);
    } else if (argumentIsAnObject) {
      formattedArgs = formattedArgs.concat('[object], ');
    } else if (argumentIsTruncatedSchema) {
      formattedArgs = formattedArgs.concat('[schema object], ');
    } else {
      // Regular string with double quotes.
      formattedArgs = formattedArgs.concat(`"${wellFormatted}", `);
    }
  }

  // Strip off last comma and arguments.
  formattedArgs = formattedArgs.replace(/(, )$/, '');

  return formattedArgs;
}

// module.exports = generateReport;
