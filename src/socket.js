import { io } from "socket.io-client";

const socket = io(
  import.meta.env.VITE_BACKEND_URL ||
    "http://https://complaine-backend.vercel.app",

  {
    transports: ["websocket"],

    autoConnect: true,
  },
);

export default socket;
