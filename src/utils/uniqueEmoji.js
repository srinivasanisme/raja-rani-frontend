import { useEffect } from "react";
import { setFavicon } from "./favicon";

// Game-themed emojis
const emojiSets = {
  yourTurn: ["🕹️","🎯","⚡","🏹","🎮","💥","🚀","🛡️","👑","🔥"],
  othersTurn: ["👀","💣","🦾","⚠️","🐾","🧨","🕷️","🦂","🧟","🐉"],
  waiting: ["⏳","🛌","🌌","🪐","💤","🧩","🕰️","🌱","💭","🌀"]
};

// Generate 3 consistent emojis based on player name
function getUniqueEmojis(name, state) {
  const set = emojiSets[state] || emojiSets.waiting;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const emojis = [];
  for (let i = 0; i < 3; i++) {
    const index = Math.abs(hash + i) % set.length;
    emojis.push(set[index]);
  }
  return emojis;
}

// Hook for blinking favicon
export function useBlinkingEmoji(name, state) {
  useEffect(() => {
    if (!name) return;

    const emojis = getUniqueEmojis(name, state);

    // Waiting = static first emoji
    if (state === "waiting") {
      setFavicon(emojis[0]);
      return;
    }

    // Blink through all emojis
    let i = 0;
    const interval = setInterval(() => {
      setFavicon(emojis[i % emojis.length]);
      i++;
    }, 500);

    return () => clearInterval(interval);
  }, [name, state]);
}
