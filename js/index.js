import Timer from './timer';
import { merge, fromEvent, interval } from 'rxjs';
import { takeUntil, map, takeWhile } from 'rxjs/operators';

const DEFAULT_FOCUS_TIME = 25;
const DEFAULT_BREAK_TIME = 5;

document.addEventListener('DOMContentLoaded', (event) => {
  const timeRemaining = document.getElementById('timer');

  const startButton = document.querySelector('.btn--action-start');
  const stopButton = document.querySelector('.btn--action-stop');
  const focusButton = document.querySelector('.btn--action-focus');
  const breakButton = document.querySelector('.btn--action-break');
  const buttons = [startButton, stopButton, focusButton, breakButton];

  const focusTimeInput = document.querySelector("input[name='focus']");
  const breakTimeInput = document.querySelector("input[name='break']");
  focusTimeInput.value = DEFAULT_FOCUS_TIME.toString();
  breakTimeInput.value = DEFAULT_BREAK_TIME.toString();

  const clickStop$ = fromEvent(stopButton, 'click');
  const clickFocus$ = fromEvent(focusButton, 'click');
  const clickBreak$ = fromEvent(breakButton, 'click');
  const clickStart = fromEvent(startButton, 'click');
  const stopTimer$ = merge(clickBreak$, clickFocus$, clickStop$);

  const changeFocusTime$ = fromEvent(focusTimeInput, 'keyup');
  const changeBreakTime$ = fromEvent(breakTimeInput, 'keyup');

  let timer = new Timer('focus', getFocusTime() * 60 * 1000);
  setTimer(timer);
  disable([stopButton]);

  changeFocusTime$.subscribe({
    next: (event) => {
      if (timer.state !== 'RUNNING' && timer.type === 'focus') {
        const newFocusTime = parseInt(event.target.value, 10);
        if (newFocusTime) {
          timer = new Timer('focus', newFocusTime * 60 * 1000);
          setTimer(timer);
        }
      }
    },
    error: (error) => console.log(error),
    complete: () => timer.complete(),
  });

  changeBreakTime$.subscribe({
    next: (event) => {
      if (timer.state !== 'RUNNING' && timer.type === 'break') {
        const newBreakTime = parseInt(event.target.value, 10);
        if (newBreakTime) {
          timer = new Timer('break', newBreakTime * 60 * 1000);
          setTimer(timer);
        }
      }
    },
    error: (error) => console.log(error),
    complete: () => timer.complete(),
  });

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
      disable([startButton]);
    }
  });

  stopButton.addEventListener('click', () => {
    timer.pause();
    enable(buttons);
    disable([stopButton]);
  });

  focusButton.addEventListener('click', () => {
    timer = new Timer('focus', getFocusTime() * 60 * 1000);
    setTimer(timer);
    enable([breakButton, startButton]);
    disable([focusButton, stopButton]);
  });

  breakButton.addEventListener('click', () => {
    timer = new Timer('break', getBreakTime() * 60 * 1000);
    setTimer(timer);
    enable([focusButton, startButton]);
    disable([breakButton, stopButton]);
  });

  function formatInMinutesAndSeconds(timeInMiliseconds) {
    // mm:ss format
    return new Date(timeInMiliseconds).toISOString().substr(11, 8);
  }

  function setTimer(timer) {
    timeRemaining.textContent = formatInMinutesAndSeconds(timer.time);
    document.title = `${timer.type} time - ${formatInMinutesAndSeconds(timer.time)}`;
    const headerText = document.querySelector('.header-text');
    if (timer.type === 'focus') {
      headerText.textContent = 'Time to focus!';
    } else if (timer.type === 'break') {
      headerText.textContent = 'Take a break!';
    } else {
      headerText.textContent = 'What time is it?';
    }
  }

  function getBreakTime() {
    return parseInt(breakTimeInput.value, 10);
  }

  function getFocusTime() {
    return parseInt(focusTimeInput.value, 10);
  }

  function disable(buttons) {
    buttons.forEach((button) => button.setAttribute('disabled', ''));
  }

  function enable(buttons) {
    buttons.forEach((button) => button.removeAttribute('disabled'));
  }
});
