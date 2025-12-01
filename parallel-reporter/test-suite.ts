import { Hook } from './hook';
import { Stats } from './stats';
import { Test } from './test';
import { TestError } from './test-error';

export class TestSuite {
  title: string;
  fileName: string;
  tags: string[];
  stats: Stats;
  tests: Test[];
  failures: TestError[];
  hooks: Hook[];
  startTime: number;
  endTime: number;
  duration: number;

  constructor (title = '', fileName = '') {
    this.title = title;
    this.fileName = fileName;
    this.stats = null;
    this.tags = [];
    this.tests = [];
    this.failures = [];
    this.hooks = [];
    this.startTime = Date.now();
    this.endTime = Date.now();

    this.calculateDuration();
  }

  public calculateDuration (): void {
    this.duration = this.endTime - this.startTime;
  }

  public setTitle (title: string): void {
    this.title = title;
  }

  public setFileName (fileName: string): void {
    this.fileName = fileName;
  }

  public addTag (tag: string): void {
    this.tags.push(tag);
  }

  public addTest (test: Test): void {
    this.tests.push(test);
  }

  public addHook (hook: Hook): void {
    this.hooks.push(hook);
  }

  public addFailure (failure: TestError): void {
    this.failures.push(failure);
  }
}
