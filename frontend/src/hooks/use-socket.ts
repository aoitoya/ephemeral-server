import { useContext } from "react";
import { SocketContext, type SocketContextType } from "./socket-context";

export function useSocket(): SocketContextType {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

export { SocketContext } from "./socket-context";