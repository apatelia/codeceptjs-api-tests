export class Stats {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;

  constructor (
    totalTests: number = 0,
    passedTests: number = 0,
    failedTests: number = 0,
    skippedTests: number = 0,
  ) {
    this.totalTests = totalTests;
    this.passedTests = passedTests;
    this.failedTests = failedTests;
    this.skippedTests = skippedTests;
  }
}
