"use client";

import { useContext } from "react";
import { useSocket as useSocketProvider } from "@/components/providers/SocketProvider";

export const useSocket = () => {
  const { socket, isConnected } = useSocketProvider();

  return {
    socket,
    isConnected,
    // Maintain interface compatibility if needed, or we can remove these if unused
    connectionState: isConnected ? 'connected' : 'disconnected',
    error: null,
    reconnectAttempt: 0,
  };
};
