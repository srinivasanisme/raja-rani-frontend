// src/App.jsx
import { useState } from "react";
import { SocketProvider } from "./SocketContext.jsx";
import RajaRaniGame from "./RajaRaniGame";
import GameIntro from "./GameIntro";

export default function App() {
  const [started, setStarted] = useState(false);

  return (
    <SocketProvider>
      {!started ? (
        <GameIntro onStart={() => setStarted(true)} />
      ) : (
        <RajaRaniGame onExit={() => setStarted(false)} />
      )}
    </SocketProvider>
  );
}
