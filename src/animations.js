import confetti from "canvas-confetti";
import { Howl } from "howler";

// sounds
const sounds = {
  celebrate: new Howl({ src: ["/sounds/celebration.mp3"] }),
  wrong: new Howl({ src: ["/sounds/wrong.mp3"] }),
  buzzer: new Howl({ src: ["/sounds/buzzer.mp3"] }),
  fireworks: new Howl({ src: ["/sounds/fireworks.mp3"] })
};

export function playConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
  sounds.celebrate.play();
}

export function playSwapAnim() {
  document.body.classList.add("swapAnim");
  sounds.wrong.play();
  setTimeout(() => document.body.classList.remove("swapAnim"), 1000);
}

export function playBuzzer() {
  sounds.buzzer.play();
}

export function playFireworks() {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 360,
        origin: { x: Math.random(), y: Math.random() - 0.2 }
      });
    }, i * 500);
  }
  sounds.fireworks.play();
}
