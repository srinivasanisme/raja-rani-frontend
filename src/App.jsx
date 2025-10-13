// src/App.jsx
import { useState, useEffect, useContext } from "react";
import { SocketProvider, SocketContext } from "./SocketContext.jsx";
import RajaRaniGame from "./RajaRaniGame";
import GameIntro from "./GameIntro";

const BACKEND_URL = "http://localhost:4000";

function AppContent() {
  const { connected } = useContext(SocketContext);
  const [started, setStarted] = useState(false);

  const handleStart = () => {
    if (connected) setStarted(true);
    else alert("Backend not reachable. Please try again later!");
  };

  return !started ? (
    <div className="text-center mt-8">
      <GameIntro onStart={handleStart} />

      <p className={`mt-6 font-semibold ${connected ? "text-green-500" : "text-red-500"}`}>
        Backend: {connected ? "🟢 Online" : "🔴 Offline"}
      </p>
    </div>
  ) : (
    <RajaRaniGame onExit={() => setStarted(false)} />
  );
}

export default function App() {
  return (
    <SocketProvider backendUrl={BACKEND_URL}>
      <AppContent />
    </SocketProvider>
  );
}
