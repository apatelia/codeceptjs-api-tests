import { event, config as codeceptJsConfig } from 'codeceptjs';
import generateReport from './generate-report';

export interface ParallelReportConfig {
  outputDir?: string;
  fileName?: string;
  reportTitle?: string;
  projectName?: string;
}

function parallelReport (config: ParallelReportConfig): void {
  const effectiveConfig: ParallelReportConfig = {
    outputDir: config?.outputDir || codeceptJsConfig.get().output,
    fileName: config?.fileName || 'parallel-report.html',
    reportTitle: config?.reportTitle || 'Test Report',
    projectName: config?.projectName || codeceptJsConfig.get().name
  };

  event.dispatcher.on(event.workers.result, async (result) => {
    await generateReport(result, effectiveConfig);
  });
}

module.exports = parallelReport;
