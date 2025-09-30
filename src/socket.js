import { io } from "socket.io-client";

const backendURL = "https://raja-rani-backend-cmbr.onrender.com"; // Your Render backend URL

const socket = io(backendURL, {
  transports: ["websocket"],
});

export default socket;
