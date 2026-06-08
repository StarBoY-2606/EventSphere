/**
 * Socket.IO client helpers
 * Placeholder for real-time notification support.
 * Install: npm install socket.io-client
 */

// import { io, Socket } from "socket.io-client";
// let socket: Socket | null = null;

export function connectSocket(token: string) {
  // socket = io({ auth: { token } });
  console.log("[Socket] connectSocket called — install socket.io-client to enable real-time.");
}

export function disconnectSocket() {
  // socket?.disconnect();
  console.log("[Socket] disconnectSocket called.");
}

export function onNotification(callback: (data: unknown) => void) {
  // socket?.on("notification", callback);
  console.log("[Socket] onNotification registered (stub).");
}
