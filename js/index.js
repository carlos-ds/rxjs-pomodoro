import { interval, fromEvent } from 'rxjs';
import { takeUntil, map, takeWhile } from 'rxjs/operators';

const focusTimeInMiliseconds = 1 * 60 * 1000;
let remainingFocusTimeInMiliseconds = focusTimeInMiliseconds;

const breakTimeInMiliseconds = 5 * 60 * 1000;
let remainingBreakTimeInMiliseconds = breakTimeInMiliseconds;

document.addEventListener('DOMContentLoaded', (event) => {
  setTimer(focusTimeInMiliseconds);
});

const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const breakButton = document.getElementById('break');
const resetButton = document.getElementById('reset');

const clickStop$ = fromEvent(stopButton, 'click');
const clickStart$ = fromEvent(startButton, 'click');
const clickBreak$ = fromEvent(breakButton, 'click');
const clickReset$ = fromEvent(resetButton, 'click');

const focusTimerInterval$ = interval(1000).pipe(
  map((x) => (remainingFocusTimeInMiliseconds -= 1000)),
  takeWhile((x) => x >= 0),
  takeUntil(clickStop$),
  takeUntil(clickStart$),
  takeUntil(clickBreak$)
);

const breakTimerInterval$ = interval(1000).pipe(
  map((x) => (remainingBreakTimeInMiliseconds -= 1000)),
  takeWhile((x) => x >= 0),
  takeUntil(clickStop$),
  takeUntil(clickStart$),
  takeUntil(clickBreak$)
);

startButton.addEventListener('click', () => {
  setTimer(focusTimeInMiliseconds);
  const focusTimer$ = focusTimerInterval$.subscribe({
    next: (x) => {
      setTimer(x);
      setTitle({ prefix: 'FOCUS - ', time: x });
    },
    error: (error) => console.log('error: ', error),
    complete: () => {
      remainingFocusTimeInMiliseconds = focusTimeInMiliseconds;
      console.log('focus stream completed');
    },
  });
});

breakButton.addEventListener('click', () => {
  setTimer(breakTimeInMiliseconds);
  const breakTimer$ = breakTimerInterval$.subscribe({
    next: (x) => {
      setTimer(x);
      setTitle({ prefix: 'BREAK - ', time: x });
    },
    error: (error) => console.log('error: ', error),
    complete: () => {
      remainingBreakTimeInMiliseconds = breakTimeInMiliseconds;
      console.log('break stream completed');
    },
  });
});

function setTimer(timeInMiliseconds) {
  document.getElementById('timer').textContent = formatInMinutesAndSeconds(timeInMiliseconds);
}

function setTitle(value) {
  document.title = value.prefix + formatInMinutesAndSeconds(value.time);
}

function formatInMinutesAndSeconds(timeInMiliseconds) {
  // mm:ss format
  return new Date(timeInMiliseconds).toISOString().substr(14, 5);
}
