import { io, type Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/auth/tokens";
import type { Notification } from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:4000";

// Server -> client events, per docs/architecture.md §5.
export interface ServerToClientEvents {
  "low-stock": (payload: Notification) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ClientToServerEvents {}

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    socket = io(WS_URL, {
      autoConnect: false,
      auth: (cb) => cb({ token: getAccessToken() }),
    });
  }
  return socket;
}
