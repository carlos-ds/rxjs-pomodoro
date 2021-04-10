import Timer from './timer';
import { merge, fromEvent, interval } from 'rxjs';
import { takeUntil, map, takeWhile } from 'rxjs/operators';

const DEFAULT_FOCUS_TIME = 25;
const DEFAULT_BREAK_TIME = 5;

document.addEventListener('DOMContentLoaded', (event) => {
  showAccordionContentOnClick();
  toggleTabActiveOnClick();

  const timeRemaining = document.getElementById('time-remaining');

  const startButton = document.querySelector('.btn--action-start');
  const stopButton = document.querySelector('.btn--action-stop');
  const focusTab = document.querySelector('.btn--action-focus');
  const breakTab = document.querySelector('.btn--action-break');
  const buttons = [startButton, stopButton];

  const focusTimeInput = document.querySelector("input[name='focus']");
  const breakTimeInput = document.querySelector("input[name='break']");
  focusTimeInput.value = DEFAULT_FOCUS_TIME;
  breakTimeInput.value = DEFAULT_BREAK_TIME;

  const clickStop$ = fromEvent(stopButton, 'click');
  const clickFocus$ = fromEvent(focusTab, 'click');
  const clickBreak$ = fromEvent(breakTab, 'click');
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

  focusTab.addEventListener('click', () => {
    timer = new Timer('focus', getFocusTime() * 60 * 1000);
    setTimer(timer);
    enable([startButton]);
    disable([stopButton]);
    changeBackground('focus');
  });

  breakTab.addEventListener('click', () => {
    timer = new Timer('break', getBreakTime() * 60 * 1000);
    setTimer(timer);
    enable([startButton]);
    disable([stopButton]);
    changeBackground('break');
  });

  function showAccordionContentOnClick() {
    document.querySelector('.accordion-header').addEventListener('click', function () {
      this.nextElementSibling.classList.toggle('active');
    });
  }

  function toggleTabActiveOnClick() {
    document.querySelectorAll('.tab').forEach((tab) => {
      tab.addEventListener('click', function (event) {
        if (event.target.classList.contains('active')) {
          return;
        } else {
          focusTab.classList.toggle('active');
          breakTab.classList.toggle('active');
        }
      });
    });
  }

  function formatInMinutesAndSeconds(timeInMiliseconds) {
    // mm:ss format
    return new Date(timeInMiliseconds).toISOString().substr(14, 5);
  }

  function setTimer(timer) {
    timeRemaining.textContent = formatInMinutesAndSeconds(timer.time);
    document.title = `${timer.type} time - ${formatInMinutesAndSeconds(timer.time)}`;
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

  function changeBackground(type) {
    if (type === 'focus') {
      document.body.classList.add('focus');
      document.body.classList.remove('break');
    }
    if (type === 'break') {
      document.body.classList.add('break');
      document.body.classList.remove('focus');
    }
    return;
  }
});
