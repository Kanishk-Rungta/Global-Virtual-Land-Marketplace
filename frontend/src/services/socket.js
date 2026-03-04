import { io } from "socket.io-client";

const REGIONS = {
  asia: 'http://localhost:5001',
  us: 'http://localhost:5002',
  eu: 'http://localhost:5003'
};

let socket;
let currentSubscription = null;

export const connectSocket = (region, onUpdate) => {
  if (socket) {
    socket.disconnect();
  }

  const url = REGIONS[region] || REGIONS.asia;
  socket = io(url);

  socket.on("connect", () => {
    console.log(`Connected to Socket Server: ${url}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  if (onUpdate) {
    socket.on("land-update", (data) => {
        console.log("Received land-update:", data);
        onUpdate(data);
    });
  }

  return socket;
};

export const getSocket = () => socket;
