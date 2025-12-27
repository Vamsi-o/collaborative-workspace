import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export interface SocketData {
  userId: string;
  email: string;
}

export const authenticateSocket = (
  socket: Socket,
  next: (err?: Error) => void
) => {
    console.log("Authenticating socket...");
  const token = socket.handshake.auth.token || socket.handshake.query.token;
    console.log("Token received:", token);
  if (!token) {
    return next(new Error("Authentication error: Token not provided"));
  }

  const secretKey = process.env.JWT_SECRET;
  if(!secretKey) {
    return next(new Error("Authentication error: Secret key not defined"));
  }
  console.log("Using secret key:", secretKey);
  try {
    const decoded = jwt.verify(
      token,
      secretKey || "your-secret-key"
    ) as SocketData;

    socket.data.userId = decoded.userId;
    socket.data.email = decoded.email;
    return next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
};
