import Timer from './timer';
import { merge, fromEvent, interval } from 'rxjs';
import { takeUntil, map, takeWhile } from 'rxjs/operators';

document.addEventListener('DOMContentLoaded', (event) => {
  const timeRemaining = document.getElementById('timer');

  const startButton = document.querySelector('.btn--action-start');
  const stopButton = document.querySelector('.btn--action-stop');
  const focusButton = document.querySelector('.btn--action-focus');
  const breakButton = document.querySelector('.btn--action-break');
  const buttons = [startButton, stopButton, focusButton, breakButton];

  const clickStop$ = fromEvent(stopButton, 'click');
  const clickFocus$ = fromEvent(focusButton, 'click');
  const clickBreak$ = fromEvent(breakButton, 'click');
  const clickStart = fromEvent(startButton, 'click');
  const stopTimer$ = merge(clickBreak$, clickFocus$, clickStop$);

  const focusTimeInput = document.querySelector("input[name='focus']");
  const breakTimeInput = document.querySelector("input[name='break']");
  focusTimeInput.value = '25';
  breakTimeInput.value = '5';

  let timer = new Timer('focus', getFocusTime() * 60 * 1000);
  setTimer(timer);
  disable(stopButton);

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
      enable(buttons);
      disable(startButton);
    }
  });

  stopButton.addEventListener('click', () => {
    timer.pause();
    enable(buttons);
    disable(stopButton);
  });

  focusButton.addEventListener('click', () => {
    timer = new Timer('focus', getFocusTime() * 60 * 1000);
    setTimer(timer);
    enable(buttons);
    disable(focusButton);
  });

  breakButton.addEventListener('click', () => {
    timer = new Timer('break', getBreakTime() * 60 * 1000);
    setTimer(timer);
    enable(buttons);
    disable(breakButton);
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

  function getBreakTime() {
    return parseInt(breakTimeInput.value, 10);
  }

  function getFocusTime() {
    return parseInt(focusTimeInput.value, 10);
  }

  function disable(button) {
    button.setAttribute('disabled', '');
  }

  function enable(buttons) {
    buttons.forEach((button) => button.removeAttribute('disabled'));
  }
});
