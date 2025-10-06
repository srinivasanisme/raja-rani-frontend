// src/SocketContext.jsx
import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

export const SocketProvider = ({ children, backendUrl }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!backendUrl) return;

    const s = io(backendUrl, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    s.on("connect", () => {
      console.log("✅ Connected to backend:", s.id);
      setConnected(true);
    });

    s.on("disconnect", (reason) => {
      console.log("❌ Disconnected from backend:", reason);
      setConnected(false);
    });

    s.on("connect_error", (err) => {
      console.warn("⚠ Socket connection error:", err.message);
      setConnected(false);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [backendUrl]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
