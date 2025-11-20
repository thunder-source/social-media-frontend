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
