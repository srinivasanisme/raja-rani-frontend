// src/App.jsx
import { useState, useEffect } from "react";
import { SocketProvider } from "./SocketContext.jsx";
import RajaRaniGame from "./RajaRaniGame";
import GameIntro from "./GameIntro";

export default function App() {
  const [started, setStarted] = useState(false);
  const [backendAlive, setBackendAlive] = useState(null); // null = unknown

  // Check backend status on mount
  useEffect(() => {
    async function checkBackend() {
      try {
        const res = await fetch(
          "https://raja-rani-backend-cmbr.onrender.com/health"
        );
        const data = await res.json();
        if (data.status === "ok") {
          console.log("✅ Backend alive!", data);
          setBackendAlive(true);
        } else {
          console.warn("⚠ Backend responded but status not ok", data);
          setBackendAlive(false);
        }
      } catch (err) {
        console.error("❌ Backend not reachable", err);
        setBackendAlive(false);
      }
    }

    checkBackend();
    const interval = setInterval(checkBackend, 10000); // optional: re-check every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <SocketProvider>
      {!started ? (
        <div>
          <GameIntro onStart={() => {
            if (backendAlive) {
              setStarted(true);
            } else {
              alert("Backend is not reachable. Please try again later!");
            }
          }} />
          <div className="text-center mt-4 text-white">
            Backend: {backendAlive === null ? "Checking..." : backendAlive ? "🟢 Online" : "🔴 Offline"}
          </div>
        </div>
      ) : (
        <RajaRaniGame onExit={() => setStarted(false)} />
      )}
    </SocketProvider>
  );
}
