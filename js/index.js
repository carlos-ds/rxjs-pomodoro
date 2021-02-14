import { interval, fromEvent } from 'rxjs';
import { takeUntil, map, takeWhile } from 'rxjs/operators';

let startValueInMiliseconds = 25 * 60 * 1000;

document.addEventListener('DOMContentLoaded', (event) => {
  document.getElementById('timer').textContent = formatInMinutesAndSeconds(startValueInMiliseconds);
});

const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');

const clickStop$ = fromEvent(stopButton, 'click');
const clickStart$ = fromEvent(startButton, 'click');

const timerInterval$ = interval(1000).pipe(
  map((x) => (startValueInMiliseconds -= 1000)),
  takeWhile((x) => x >= 0),
  takeUntil(clickStop$)
);

startButton.addEventListener('click', () => {
  timerInterval$.subscribe({
    next: (x) => (document.getElementById('timer').textContent = formatInMinutesAndSeconds(x)),
    error: (error) => console.log('error: ', error),
    complete: () => console.log('completed!'),
  });
});

stopButton.addEventListener('click', () => {
  console.log('stopped');
});

function setTimer(timeInMiliseconds) {
  document.getElementById('timer').textContent = formatInMinutesAndSeconds(timeInMiliseconds);
}

function formatInMinutesAndSeconds(timeInMiliseconds) {
  // mm:ss format
  return new Date(timeInMiliseconds).toISOString().substr(14, 5);
}
