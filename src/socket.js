// src/socket.js
import { io } from "socket.io-client";

const backendURL = "https://raja-rani-backend-cmbr.onrender.com";

const socket = io(backendURL, {
  transports: ["websocket"], // ensures stable connection
});

export default socket;
