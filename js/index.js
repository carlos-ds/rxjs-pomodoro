import Timer from './timer';
import { merge, fromEvent, interval } from 'rxjs';
import { takeUntil, map, takeWhile } from 'rxjs/operators';

document.addEventListener('DOMContentLoaded', (event) => {
  const timeRemaining = document.getElementById('timer');

  let timer = new Timer('focus', 25 * 60 * 1000);
  setTimer(timer);

  const startButton = document.getElementById('start');
  const stopButton = document.getElementById('stop');
  const focusButton = document.getElementById('focus');
  const breakButton = document.getElementById('break');

  const clickStop$ = fromEvent(stopButton, 'click');
  const clickFocus$ = fromEvent(focusButton, 'click');
  const clickBreak$ = fromEvent(breakButton, 'click');
  const clickStart = fromEvent(startButton, 'click');

  const stopTimer$ = merge(clickBreak$, clickFocus$, clickStop$);

  const startTimer$ = interval(1000).pipe(
    map((x) => (timer.time -= 1000)),
    takeWhile((x) => x >= 0),
    takeUntil(stopTimer$)
  );

  startButton.addEventListener('click', () => {
    if (timer.state !== 'RUNNING') {
      startTimer$.subscribe({
        next: (value) => {
          timeRemaining.textContent = formatInMinutesAndSeconds(value);
          setTimer(timer);
        },
        error: (error) => console.log(error),
        complete: () => timer.complete(),
      });
      timer.start();
    }
  });

  stopButton.addEventListener('click', () => {
    timer.pause();
    setTimer(timer);
  });

  focusButton.addEventListener('click', () => {
    timer = new Timer('focus', 25 * 60 * 1000);
    setTimer(timer);
  });

  breakButton.addEventListener('click', () => {
    timer = new Timer('break', 5 * 60 * 1000);
    setTimer(timer);
  });

  function formatInMinutesAndSeconds(timeInMiliseconds) {
    // mm:ss format
    return new Date(timeInMiliseconds).toISOString().substr(14, 5);
  }

  function setTimer(timer) {
    timeRemaining.textContent = formatInMinutesAndSeconds(timer.time);
    document.title = `${timer.type} time - ${formatInMinutesAndSeconds(timer.time)}`;
    document.querySelector('.header-text').textContent = timer.type.toUpperCase() + ' time';
  }
});
