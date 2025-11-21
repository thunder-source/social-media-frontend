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
  
  // Message events
  'message:new': (message: Message) => void;
  'message:read': (data: { messageId: string; userId: string }) => void;
  'typing:start': (data: { userId: string; chatId: string }) => void;
  'typing:stop': (data: { userId: string; chatId: string }) => void;
}

export interface SocketState {
  connected: boolean;
  connectionState: ConnectionState;
  error: string | null;
  reconnectAttempt: number;
}

// Chat Types
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readBy: string[]; // Array of user IDs who read the message
  sender: User;
}

export interface Chat {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface TypingUser {
  userId: string;
  chatId: string;
  timestamp: number;
}
