// src/SocketContext.jsx
import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

// ✅ Your backend URL
const BACKEND_URL = "https://raja-rani-backend-cmbr.onrender.com";

export const SocketContext = createContext({
  socket: null,
  connected: false,
});

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // ✅ Create socket with proper reconnection options
    const s = io(BACKEND_URL, {
      transports: ["websocket"], // force WebSocket only
      reconnection: true,        // auto reconnect if dropped
      reconnectionAttempts: 10,  // retry up to 10 times
      reconnectionDelay: 1000,   // wait 1s between attempts
    });

    setSocket(s);

    s.on("connect", () => {
      console.log("✅ Connected to backend", s.id);
      setConnected(true);
    });

    s.on("disconnect", (reason) => {
      console.warn("⚠ Disconnected from backend:", reason);
      setConnected(false);
    });

    s.on("connect_error", (err) => {
      console.error("❌ Connection error:", err.message);
      setConnected(false);
    });

    return () => {
      console.log("🔌 Cleaning up socket connection");
      s.disconnect();
    };
  }, []);

  return (
  <SocketContext.Provider value={{ socket, connected, setConnected }}>
    {children}
  </SocketContext.Provider>
);
}
