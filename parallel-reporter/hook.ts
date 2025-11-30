import { Step } from './step';
import { TestError } from './test-error';

export class Hook {
  title: string;
  type: string;
  status: string;
  startTime: number;
  endTime: number;
  duration: number;
  error?: TestError;
  location: string;
  body: string;
  steps: Step[];

  constructor (title: string) {
    this.title = title;
    this.startTime = Date.now();
    this.endTime = Date.now();
    this.type = 'not determined';
    this.status = 'started';
    this.duration = 0;
    this.error = null;
    this.location = 'not determined';
    this.body = '';
    this.steps = [];
  }

  public calculateDuration (): void {
    this.duration = this.endTime - this.startTime;
  }
}
