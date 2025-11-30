export class TestError {
  stack: string;
  message: string;
  actual: string;
  expected: string;
  file: string;
  testName: string;

  constructor (
    stack: string = '',
    message: string = '',
    actual: string = '',
    expected: string = '',
    file: string = '',
    testName: string = ''
  ) {
    this.stack = stack;
    this.message = message;
    this.actual = actual;
    this.expected = expected;
    this.file = file;
    this.testName = testName;
  }
}
