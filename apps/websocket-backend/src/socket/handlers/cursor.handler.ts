import { Server, Socket } from "socket.io";
import { Events } from "../event.js";

export interface CursorPosition {
  userId: string;
  email: string;
  x: number;
  y: number;
  projectId: string;
  fileId?: string;
}

export const cursorHandler = (io: Server, socket: Socket) => {
  socket.on(Events.CURSOR_MOVE, (data: CursorPosition) => {
    socket.to(data.projectId).emit(Events.CURSOR_UPDATE, {
      userId: socket.data.userId,
      email: socket.data.email,
      x: data.x,
      y: data.y,
      fileId: data.fileId,
      timestamp: new Date().toISOString(),
    });
  });
};
