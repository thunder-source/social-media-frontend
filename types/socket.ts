// Socket Event Types
export interface SocketAuthData {
  token: string;
}

export interface UserOnlineEvent {
  userId: string;
  timestamp: Date;
}

export interface UserOfflineEvent {
  userId: string;
  timestamp: Date;
}

export interface UsersOnlineEvent {
  userIds: string[];
}

// Socket connection state types
export type SocketConnectionState = 'connected' | 'disconnected' | 'connecting' | 'error';
