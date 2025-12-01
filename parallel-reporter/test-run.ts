import { Stats } from './stats';
import { TestError } from './test-error';
import { TestSuite } from './test-suite';

export class TestRun {
  stats: Stats;
  suites: TestSuite[];
  failures: TestError[];
  startTime: number;
  endTime: number;
  duration: number;

  constructor () {
    this.stats = null;
    this.suites = [];
    this.failures = [];
    this.startTime = Date.now();
    this.endTime = Date.now();

    this.calculateDuration();
  }

  public calculateDuration (): void {
    this.duration = this.endTime - this.startTime;
  }

  public addFailure (failure: TestError): void {
    this.failures.push(failure);
  }
}
