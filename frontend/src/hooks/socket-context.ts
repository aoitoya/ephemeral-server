import { createContext } from "react";
import type { Socket } from "socket.io-client";

export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
}

export const SocketContext = createContext<SocketContextType | null>(null);