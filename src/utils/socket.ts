import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

export interface ServerToClientEvents {
  new_notification: (data: any) => void;
  "new-message": (data: any) => void;
}

export interface ClientToServerEvents {
  "join-admin": () => void;
  "join-property": (propertyId: string) => void;
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  SOCKET_URL,
  {
    path: "/socket.io",
    transports: ["polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    autoConnect: false,
  },
);

export default socket;
