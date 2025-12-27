export const Events = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  
  JOIN_PROJECT: "join:project",
  LEAVE_PROJECT: "leave:project",
  
  CURSOR_MOVE: "cursor:move",
  CURSOR_UPDATE: "cursor:update",
  
  USER_JOINED: "user:joined",
  USER_LEFT: "user:left",
  USERS_LIST: "users:list",
} as const;
