import { io } from "socket.io-client";

const backendURL = import.meta.env.VITE_BACKEND_URL; // use Vercel env

const socket = io(backendURL, {
  transports: ["websocket"], 
});

export default socket;
