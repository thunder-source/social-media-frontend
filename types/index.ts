export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string; // For videos
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  postId: string;
  createdAt: string;
  user: User;
}

export interface Post {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
  likes: string[]; // Array of user IDs
  comments: Comment[];
  user: User;
  _count?: {
    likes: number;
    comments: number;
  };
}

export type FriendshipStatus = 'NONE' | 'PENDING' | 'FRIENDS';

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  sender: User;
  triggeredFromPostId?: string;
}

// Socket.io Types
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface SocketEvents {
  // User presence events
  'user:online': (userId: string) => void;
  'user:offline': (userId: string) => void;
  'users:online': (userIds: string[]) => void;
  
  // Friend request events
  'friend:request': (request: FriendRequest) => void;
  'friend:accepted': (friendId: string) => void;
  'friend:removed': (friendId: string) => void;
  
  // Message events (for future chat implementation)
  'message:new': (message: any) => void;
  'message:typing': (userId: string) => void;
}

export interface SocketState {
  connected: boolean;
  connectionState: ConnectionState;
  error: string | null;
  reconnectAttempt: number;
}
