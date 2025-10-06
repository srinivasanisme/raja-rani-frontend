// src/SocketContext.jsx
import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

// CHANGE THIS URL to your online backend URL
const BACKEND_URL = "https://raja-rani-backend-cmbr.onrender.com";
export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = io(BACKEND_URL, {
      transports: ["websocket"],
    });

    s.on("connect", () => {
      console.log("✅ Connected to backend:", s.id);
      setConnected(true);
    });

    s.on("disconnect", () => {
      console.log("❌ Disconnected from backend");
      setConnected(false);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
