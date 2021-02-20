export default class Timer {
  constructor(type, time) {
    this.type = type;
    this.time = time;
    this.state = 'INITIAL';
  }

  start() {
    this.state = 'RUNNING';
  }

  pause() {
    this.state = 'PAUSED';
  }

  complete() {
    this.state = 'COMPLETED';
  }
}
