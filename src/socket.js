// src/socket.js
import { io } from "socket.io-client";

// Replace with your Render backend URL
const BACKEND_URL = "https://raja-rani-backend-cmbr.onrender.com";

const socket = io(BACKEND_URL, {
  transports: ["websocket"], // ensures proper websocket connection
  secure: true,               // ensures secure connection
  rejectUnauthorized: false, // allows self-signed certificates
});

export default socket;
