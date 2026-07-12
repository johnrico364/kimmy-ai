import { Server } from "socket.io";

let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  console.log("Socket.io initialized");
  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io has not been initialized");
  }

  return io;
}
