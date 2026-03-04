let ioInstance = null;

const initSocket = (server) => {
  const { Server } = require("socket.io");
  ioInstance = new Server(server, {
    cors: {
      origin: "*", // Adjust for production
      methods: ["GET", "POST"]
    }
  });

  ioInstance.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);
    
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
    
    // Example event listener for region selection if needed
    socket.on("select-region", (region) => {
      console.log(`Client ${socket.id} selected region: ${region}`);
      socket.join(region);
    });
  });

  return ioInstance;
};

const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized!");
  }
  return ioInstance;
};

const emitUpdate = (event, data) => {
  if (ioInstance) {
    ioInstance.emit(event, data);
  } else {
    console.warn("Attempted to emit socket event but IO not initialized");
  }
};

module.exports = {
  initSocket,
  getIO,
  emitUpdate
};
