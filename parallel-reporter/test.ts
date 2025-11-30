import { Hook } from './hook';
import { Step } from './step';
import { TestError } from './test-error';

export class Test {
  title: string;
  status: string;
  body: string;
  tags: string[];
  steps: Step[];
  startTime: number;
  endTime: number;
  duration: number;
  file: string;
  error: TestError | null;
  warnings: string[];
  hooks: Hook[];
  skipInfo: string;

  constructor (title: string) {
    this.title = title;
    this.startTime = Date.now();
    this.endTime = Date.now();
    this.status = 'just started';
    this.body = '';
    this.tags = [];
    this.steps = [];
    this.error = null;
    this.warnings = [];
    this.hooks = [];
    this.file = '';
    this.duration = 0;
    this.skipInfo = '';
  }

  public calculateDuration (): void {
    this.duration = this.endTime - this.startTime;
  }

  public sortStepsByStartTime (): void {
    this.steps.sort((prev, next) => prev.startTime - next.startTime);
  }
}
