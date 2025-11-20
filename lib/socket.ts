import { io, Socket } from "socket.io-client";
import type { ConnectionState } from "@/types";

// Connection state tracking
let connectionState: ConnectionState = 'disconnected';
let connectionError: string | null = null;
let reconnectAttempt: number = 0;

// Create socket instance with configuration
export const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
});

// Helper function to connect socket with JWT token
export const connectSocket = (token: string) => {
  if (!socket.connected) {
    connectionState = 'connecting';
    connectionError = null;
    socket.auth = { token };
    socket.connect();
  }
};

// Helper function to disconnect socket
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    connectionState = 'disconnected';
    connectionError = null;
    reconnectAttempt = 0;
  }
};

// Get connection state
export const getConnectionState = (): ConnectionState => connectionState;

// Get connection error
export const getConnectionError = (): string | null => connectionError;

// Get reconnect attempt count
export const getReconnectAttempt = (): number => reconnectAttempt;

// Check if socket is connected
export const isConnected = (): boolean => socket.connected;

// Connection event listeners
socket.on("connect", () => {
  connectionState = 'connected';
  connectionError = null;
  reconnectAttempt = 0;
  console.log("✅ Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  connectionState = 'disconnected';
  console.log("❌ Socket disconnected:", reason);
  
  // Handle different disconnect reasons
  if (reason === "io server disconnect") {
    connectionError = "Disconnected by server";
  } else if (reason === "transport close" || reason === "transport error") {
    connectionError = "Network connection lost";
  }
});

socket.on("connect_error", (error) => {
  connectionState = 'error';
  connectionError = error.message;
  console.error("🔴 Socket connection error:", error.message);
  
  // Handle authentication errors
  if (error.message.includes("auth") || error.message.includes("unauthorized")) {
    connectionError = "Authentication failed";
  }
});

socket.on("reconnect_attempt", (attempt) => {
  reconnectAttempt = attempt;
  connectionState = 'connecting';
  console.log(`🔄 Reconnecting... Attempt ${attempt}/5`);
});

socket.on("reconnect_failed", () => {
  connectionState = 'error';
  connectionError = "Failed to reconnect after 5 attempts";
  console.error("🔴 Reconnection failed");
});

socket.on("reconnect", (attempt) => {
  reconnectAttempt = 0;
  console.log(`✅ Reconnected after ${attempt} attempt(s)`);
});
