import Redis from "ioredis";  // ✅ This is right
// @ts-ignore
export const pubClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
});

export const subClient = pubClient.duplicate();
