import { Server, Socket } from "socket.io";
import { Events } from "../event.js";
import { projectHandler } from "./project.handler.js";
import { cursorHandler } from "./cursor.handler.js";

export const connectionHandler = (io: Server, socket: Socket) => {
  console.log(`🔌 New client connected: ${socket.id} (${socket.data.email})`);
  projectHandler(io, socket);
  cursorHandler(io, socket);
  socket.on(Events.DISCONNECT, () => {
    const rooms = Array.from(socket.rooms);

    rooms.forEach((room) => {
      if (room !== socket.id) {
        io.to(room).emit(Events.USER_LEFT, {
          userId: socket.data.userId,
          timestamp: new Date().toISOString(),
        });
      }
    });

    console.log(`❌ Client disconnected: ${socket.id} (${socket.data.email})`);
  });
};
