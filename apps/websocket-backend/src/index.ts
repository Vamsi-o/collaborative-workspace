import { Server } from "socket.io";
import { connectionHandler } from "./socket/handlers/connection.handler.js";
import { pubClient, subClient } from "./redis/client.js";
import { Events } from "./socket/event.js";
import { authenticateSocket } from "./socket/middleware.js";

import { createAdapter } from "@socket.io/redis-adapter";

const PORT = parseInt(process.env.WS_PORT || "3001");

const io = new Server(PORT, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.adapter(createAdapter(pubClient, subClient));

io.use(authenticateSocket);


io.on(Events.CONNECTION, (socket) => connectionHandler(io, socket));

console.log(`🚀 WebSocket server running on port ${PORT}`);
console.log(`🔐 JWT authentication enabled`);
console.log(`📡 Redis adapter enabled for scaling`);
