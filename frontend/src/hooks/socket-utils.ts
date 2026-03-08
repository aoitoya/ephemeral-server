import { useEffect } from "react";
import { useSocket } from "./use-socket";

export function useSocketEvent<T extends unknown[] = unknown[]>(
  event: string, 
  handler: (..._args: T) => void
) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(event, handler as (..._args: unknown[]) => void);

    return () => {
      socket.off(event, handler as (..._args: unknown[]) => void);
    };
  }, [socket, event, handler]);
}