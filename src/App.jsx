// src/App.jsx
import { useState } from "react";
import RajaRaniGame from "./RajaRaniGame";
import GameIntro from "./GameIntro";

export default function App() {
  const [started, setStarted] = useState(false);

  return (
    <>
      {!started ? (
        <GameIntro onStart={() => setStarted(true)} />
      ) : (
        <RajaRaniGame onExit={() => setStarted(false)} />
      )}
    </>
  );
}
