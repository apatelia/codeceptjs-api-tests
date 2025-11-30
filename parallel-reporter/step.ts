export class Step {
  name: string;
  args: string;
  actor: string;
  status: string;
  startTime: number;
  endTime: number;
  duration: number;

  constructor (name: string) {
    this.name = name;
    this.args = '';
    this.actor = '';
    this.status = 'unknown';
    this.startTime = Date.now();
    this.endTime = Date.now();

    this.calculateDuration();
  }

  public calculateDuration (): void {
    const difference = Date.now() - this.startTime;
    this.duration = difference;
  }
}
