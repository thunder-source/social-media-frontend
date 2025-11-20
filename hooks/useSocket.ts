"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  socket, 
  connectSocket, 
  disconnectSocket, 
  getConnectionState, 
  getConnectionError,
  getReconnectAttempt 
} from "@/lib/socket";
import { useAppDispatch } from "@/store/hooks";
import { setUserOnline, setUserOffline, setOnlineUsers } from "@/store/slices/authSlice";
import type { ConnectionState } from "@/types";

export const useSocket = () => {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState<number>(0);

  useEffect(() => {
    // Connect socket when user is authenticated
    if (status === "authenticated" && session?.user) {
      const token = (session as any).accessToken; // Assuming accessToken is in session
      
      if (token) {
        connectSocket(token);

        // Update connection state on connect
        const handleConnect = () => {
          setConnectionState('connected');
          setError(null);
          setReconnectAttempt(0);
        };

        // Update connection state on disconnect
        const handleDisconnect = () => {
          setConnectionState('disconnected');
          setError(getConnectionError());
        };

        // Update connection state on error
        const handleError = () => {
          setConnectionState('error');
          setError(getConnectionError());
        };

        // Update reconnect attempt
        const handleReconnectAttempt = () => {
          setConnectionState('connecting');
          setReconnectAttempt(getReconnectAttempt());
        };

        // Listen for user:online event
        const handleUserOnline = (userId: string) => {
          console.log("👤 User online:", userId);
          dispatch(setUserOnline(userId));
        };

        // Listen for user:offline event
        const handleUserOffline = (userId: string) => {
          console.log("👤 User offline:", userId);
          dispatch(setUserOffline(userId));
        };

        // Listen for initial online users list
        const handleOnlineUsers = (userIds: string[]) => {
          console.log("👥 Online users:", userIds);
          dispatch(setOnlineUsers(userIds));
        };

        // Attach event listeners
        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleError);
        socket.on("reconnect_attempt", handleReconnectAttempt);
        socket.on("user:online", handleUserOnline);
        socket.on("user:offline", handleUserOffline);
        socket.on("users:online", handleOnlineUsers);

        // Set initial state
        setConnectionState(getConnectionState());
      }
    }

    // Cleanup on unmount or logout
    return () => {
      // Remove all event listeners
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("reconnect_attempt");
      socket.off("user:online");
      socket.off("user:offline");
      socket.off("users:online");

      // Disconnect if user is not authenticated
      if (status !== "authenticated") {
        disconnectSocket();
      }
    };
  }, [status, session, dispatch]);

  return {
    socket,
    isConnected: socket.connected,
    connectionState,
    error,
    reconnectAttempt,
  };
};
