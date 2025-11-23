'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setOnlineUsers, setUserOnline, setUserOffline } from '@/store/slices/authSlice';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 5000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
      setIsConnected(true);

      // Emit setup events
      socketInstance.emit('get_online_friends');
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error.message);
      setIsConnected(false);
    });

    // Global Online status events
    socketInstance.on('friends:online', (data: { onlineFriends: string[] }) => {
      console.log('Online friends:', data.onlineFriends);
      dispatch(setOnlineUsers(data.onlineFriends));
    });

    socketInstance.on('users:online', (userIds: string[]) => {
      console.log('Online users:', userIds);
      dispatch(setOnlineUsers(userIds));
    });

    socketInstance.on('user:online', (data: { userId: string; timestamp: string }) => {
      console.log('User online:', data);
      dispatch(setUserOnline(data));
    });

    socketInstance.on('user:offline', (data: { userId: string }) => {
      console.log('User offline:', data);
      dispatch(setUserOffline(data.userId));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [user, dispatch]); // Removed socket from dependency array to prevent re-initialization loop

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
