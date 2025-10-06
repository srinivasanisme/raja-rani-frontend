// src/SocketContext.jsx
import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

// ✅ Use your actual Render backend URL here
const BACKEND_URL = "https://raja-rani-backend-cmbr.onrender.com"; 

export const SocketContext = createContext({
  socket: null,
  connected: false,
});

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = io(BACKEND_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
    });

    setSocket(s);

    s.on("connect", () => {
      console.log("✅ Connected to backend:", s.id);
      setConnected(true);
    });

    s.on("disconnect", (reason) => {
      console.warn("⚠ Disconnected:", reason);
      setConnected(false);
    });

    s.on("connect_error", (err) => {
      console.error("❌ Connection error:", err.message);
      setConnected(false);
    });

    return () => {
      console.log("🔌 Cleaning up socket");
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}
