export interface Suite {
  /* eslint-disable @typescript-eslint/naming-convention */

  _startTime: string;
  _endTime: string;
  _stats: {
    passes: number;
    failures: number;
    tests: number;
    pending: number;
    failedHooks: number;
    start: string;
    end: string;
    duration: number;
  };
  _tests: Test[];
  _failures: string[][];

  /* eslint-enable @typescript-eslint/naming-convention */
}

export interface TestError {
  stack: string;
  message: string;
  actual: string;
  expected: string;
}

export interface Test {
  title: string;
  state: string;
  body: string;
  opts: object;
  pending: boolean;
  tags: string[];
  steps: Step[];
  parent: {
    title: string;
  },
  duration: number;
  file: string;
  skipInfo: {
    message: string;
    description: string;
  };
  err: TestError | undefined;
}

export interface Step {
  name: string;
  timeouts: object;
  args: string[];
  opts: object;
  actor: string;
  status: string;
  suffix: string;
  prefix: string;
  comment: string;
  helper: string | null;
  helperMethod: string;
  startTime: number;
  endTime: number;
  duration: number;
  title: string;
  parent: {
    title: string;
  };
  meta: object;
}
