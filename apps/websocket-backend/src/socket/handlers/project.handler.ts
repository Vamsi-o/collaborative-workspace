import { Server, Socket } from "socket.io";
import { Events } from "../event.js";

export const projectHandler = (io: Server, socket: Socket) => {
  console.log("🔥 PROJECT HANDLER REGISTERED");
  console.log("🔥 Listening for event:", Events.JOIN_PROJECT);

  // FIX: Receive entire data object
  socket.on(Events.JOIN_PROJECT, async (data: any) => {
    const { projectId } = data; // Extract projectId from data
    
    if (!projectId) {
      console.error("❌ No projectId provided!");
      
      return;
    }

    socket.join(projectId);
    console.log(`✅ User ${socket.data.email} joined project ${projectId}`);

    const socketsInRoom = await io.in(projectId).fetchSockets();
    const usersInRoom = socketsInRoom.map((s) => ({
      userId: s.data.userId,
      email: s.data.email,
    }));

    console.log(`Current users in project ${projectId}:`, usersInRoom);

    // Broadcast to OTHERS only (not sender)
    socket.to(projectId).emit(Events.USER_JOINED, {
      userId: socket.data.userId,
      email: socket.data.email,
      timestamp: new Date().toISOString(),
    });

    console.log(`Broadcasted USER_JOINED to others in project ${projectId}`);

    // Send full user list to EVERYONE (including sender)
    io.to(projectId).emit(Events.USERS_LIST, usersInRoom);
    
    console.log(`Sent USERS_LIST to project ${projectId}`);
  });

  socket.on(Events.LEAVE_PROJECT, async (data: any) => {
    const { projectId } = data; // Extract projectId from data
    
    if (!projectId) {
      console.error("❌ No projectId provided!");
      return;
    }

    console.log(`❌ User ${socket.data.email} leaving project ${projectId}`);

    // Notify others BEFORE leaving
    socket.to(projectId).emit(Events.USER_LEFT, {
      userId: socket.data.userId,
      email: socket.data.email,
      timestamp: new Date().toISOString(),
    });

    socket.leave(projectId);
    console.log(`✅ User ${socket.data.email} left project ${projectId}`);
  });
};
