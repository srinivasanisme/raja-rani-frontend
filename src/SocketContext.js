// src/SocketContext.jsx
import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

export function SocketProvider({ children, backendUrl }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(backendUrl, {
      transports: ["websocket"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setConnected(true);
      console.log("✅ Connected to backend:", backendUrl);
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
      console.log("❌ Disconnected from backend");
    });

    return () => {
      newSocket.disconnect();
    };
  }, [backendUrl]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}
