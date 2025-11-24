export interface User {
  id: string;
  _id?: string;
  googleId?: string;
  name: string;
  email: string;
  photo?: string; // Backend uses 'photo' not 'image'
  image?: string; // Keep for backward compatibility
  friends?: string[];
  friendsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string; // For videos
}

export interface Comment {
  id: string;
  _id?: string;
  content: string;
  text?: string; // Backend might use 'text'
  userId: string | User; // Can be populated or just ID
  postId: string;
  createdAt: string;
  user?: User; // Optional when populated
}

export interface Post {
  id: string;
  _id?: string;
  content?: string; // Frontend uses 'content'
  text?: string; // Backend uses 'text'
  userId: string | User; // Can be populated User object or just ID string
  user?: User; // Keep for backward compatibility
  createdAt: string;
  updatedAt: string;
  attachments?: Attachment[];
  mediaType?: string | null; // Backend field
  mediaUrl?: string; // Backend field
  likes: string[]; // Array of user IDs
  comments: Comment[];
  likesCount?: number; // Backend uses this
  commentsCount?: number; // Backend uses this
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
  
  // Notification events
  'notification:new': (notification: Notification) => void;
  'notification:read': (notificationId: string) => void;
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

// Notification Types
export type NotificationType = 
  | 'LIKE' 
  | 'COMMENT' 
  | 'FRIEND_REQUEST' 
  | 'FRIEND_ACCEPTED' 
  | 'MENTION'
  | 'POST_SHARE'
  | 'MESSAGE';

export interface Notification {
  id: string;
  _id?: string;
  type: NotificationType | string; // Allow string for raw API values
  userId: string; // The user receiving the notification
  fromUser?: User; // The user who triggered the notification (API response)
  actorId?: string; // Keep for backward compatibility if needed
  actor?: User; // Keep for backward compatibility if needed
  postId?: string | { _id: string; [key: string]: any }; // Can be string or object
  post?: Post;
  commentId?: string;
  friendRequestId?: string | FriendRequest;
  message?: string;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
}
