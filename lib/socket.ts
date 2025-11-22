// This file is deprecated.
// Socket connection is now managed by SocketProvider.tsx
// Use the useSocket hook from components/providers/SocketProvider to access the socket instance.

export const socket = null;
export const connectSocket = () => {};
export const disconnectSocket = () => {};
export const getConnectionState = () => 'disconnected';
export const getConnectionError = () => null;
export const getReconnectAttempt = () => 0;
