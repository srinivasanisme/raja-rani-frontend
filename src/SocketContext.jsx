// src/SocketContext.jsx
import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

// Replace with your backend URL
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
    });

    setSocket(s);

    s.on("connect", () => {
      console.log("✅ Connected to backend", s.id);
      setConnected(true);
    });

    s.on("disconnect", () => {
      console.log("⚠ Disconnected from backend");
      setConnected(false);
    });

    s.on("connect_error", (err) => {
      console.error("❌ Connection error:", err);
      setConnected(false);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}
