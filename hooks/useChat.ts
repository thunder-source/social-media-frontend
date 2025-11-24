"use client";

import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useSocket } from "@/components/providers/SocketProvider";
import type { Message, Chat } from "@/types";
import { toast } from "sonner";

import {
  useGetChatsQuery,
  useCreateChatMutation,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useSendMessageMutation,
} from "@/store/api/chatsApi";

interface UseChatReturn {
  messages: Message[];
  chats: Chat[];
  currentChat: Chat | null;
  isTyping: boolean;
  sendMessage: (content: string, chatId: string) => void;
  markAsRead: (messageId: string) => void;
  startTyping: (chatId: string) => void;
  stopTyping: (chatId: string) => void;
  loadMoreMessages: (chatId: string, offset: number) => Promise<void>;
  selectChat: (chatId: string) => void;
  createChat: (partnerId: string) => Promise<Chat>;
  isLoading: boolean;
  clearChat: () => void;
}

export const useChat = (): UseChatReturn => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { socket } = useSocket();
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // RTK Query hooks
  const { data: chats = [], refetch: refetchChats, isLoading } = useGetChatsQuery(undefined, {
    skip: !user,
  });

  const [createChatMutation] = useCreateChatMutation();
  const [sendMessageMutation] = useSendMessageMutation();
  
  // We'll use lazy query for messages to fetch only when a chat is selected
  const [triggerGetMessages, { data: fetchedMessages }] = useLazyGetMessagesQuery();

  // Local state for messages to combine API data + real-time updates
  const [messages, setMessages] = useState<Message[]>([]);

  // Sync fetched messages to local state
  useEffect(() => {
    if (Array.isArray(fetchedMessages)) {
      setMessages(fetchedMessages);
    } else {
      setMessages([]);
    }
  }, [fetchedMessages]);

  // Helper to get recipient ID
  const getRecipientId = useCallback((chat: Chat | null) => {
    if (!chat || !user?.id) return null;
    return chat.participants.find(p => p.id !== user.id)?.id;
  }, [user?.id]);

  // Handle incoming new messages (received from other users)
  const handleNewMessage = useCallback((data: { message: any; chatId: string }) => {
    console.log("📨 New message received:", data);
    const rawMessage = data.message;
    
    // Transform raw message to match Message interface
    const message: Message = {
      id: rawMessage.id || rawMessage._id,
      chatId: rawMessage.chatId,
      senderId: typeof rawMessage.senderId === 'object' ? (rawMessage.senderId._id || rawMessage.senderId.id) : rawMessage.senderId,
      content: rawMessage.content || rawMessage.text,
      createdAt: rawMessage.createdAt,
      readBy: Array.isArray(rawMessage.readBy) ? rawMessage.readBy.map((u: any) => (typeof u === 'object' ? (u._id || u.id) : u)) : [],
      sender: typeof rawMessage.senderId === 'object' ? rawMessage.senderId : { id: rawMessage.senderId, name: 'Unknown', email: '' } as any,
    };

    // Add message to messages list if it belongs to current chat
    setMessages((prev) => {
      if (prev.some(m => m.id === message.id)) return prev;
      return [...prev, message];
    });

    // Refetch chats to update last message and unread count
    refetchChats();
  }, [refetchChats]);

  // Handle message sent confirmation (own message)
  const handleMessageSent = useCallback((data: { message: any; chatId: string }) => {
    console.log("✅ Message sent confirmation:", data);
    const rawMessage = data.message;

    const message: Message = {
      id: rawMessage.id || rawMessage._id,
      chatId: rawMessage.chatId,
      senderId: typeof rawMessage.senderId === 'object' ? (rawMessage.senderId._id || rawMessage.senderId.id) : rawMessage.senderId,
      content: rawMessage.content || rawMessage.text,
      createdAt: rawMessage.createdAt,
      readBy: Array.isArray(rawMessage.readBy) ? rawMessage.readBy.map((u: any) => (typeof u === 'object' ? (u._id || u.id) : u)) : [],
      sender: typeof rawMessage.senderId === 'object' ? rawMessage.senderId : { id: rawMessage.senderId, name: 'Unknown', email: '' } as any,
    };

    setMessages((prev) => {
      if (prev.some(m => m.id === message.id)) return prev;
      return [...prev, message];
    });
    
    refetchChats();
  }, [refetchChats]);

  // Handle message read receipt
  const handleMessageRead = useCallback(
    ({ messageId, userId }: { messageId: string; userId: string }) => {
      console.log("👀 Message read:", messageId, "by", userId);
      
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId && !msg.readBy.includes(userId)) {
            return {
              ...msg,
              readBy: [...msg.readBy, userId],
            };
          }
          return msg;
        })
      );
    },
    []
  );

  // Handle typing start
  const handleTypingStart = useCallback(
    ({ userId, chatId }: { userId: string; chatId: string }) => {
      // Only show typing indicator for current chat and other users
      if (currentChat?.id === chatId && userId !== user?.id) {
        setTypingUsers((prev) => new Set(prev).add(userId));
      }
    },
    [currentChat?.id, user?.id]
  );

  // Handle typing stop
  const handleTypingStop = useCallback(
    ({ userId, chatId }: { userId: string; chatId: string }) => {
      if (currentChat?.id === chatId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    },
    [currentChat?.id]
  );

  // Send message
  const sendMessage = useCallback(
    async (content: string, chatId: string) => {
      if (!content.trim() || !user?.id || !socket) return;

      const recipientId = getRecipientId(currentChat);
      if (!recipientId) {
        toast.error("Cannot send message: Recipient not found");
        return;
      }

      // Emit socket event
      socket.emit("send_message", {
        chatId,
        text: content.trim(),
        recipientId
      });
    },
    [user?.id, currentChat, getRecipientId, socket]
  );

  // Mark message as read
  const markAsRead = useCallback(
    (messageId: string) => {
      if (!user?.id || !socket) return;

      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      // We need to send the SENDER's ID to the backend so it can notify them
      // The backend expects { messageId, senderId } where senderId is the message sender
      socket.emit("message_read", { 
        messageId, 
        senderId: message.senderId 
      });
    },
    [user?.id, messages, socket]
  );

  // Start typing indicator
  const startTyping = useCallback(
    (chatId: string) => {
      if (!user?.id || !socket) return;
      const recipientId = getRecipientId(currentChat);
      if (recipientId) {
        socket.emit("typing:start", { chatId, recipientId });
      }
    },
    [user?.id, currentChat, getRecipientId, socket]
  );

  // Stop typing indicator
  const stopTyping = useCallback(
    (chatId: string) => {
      if (!user?.id || !socket) return;
      const recipientId = getRecipientId(currentChat);
      if (recipientId) {
        socket.emit("typing:stop", { chatId, recipientId });
      }
    },
    [user?.id, currentChat, getRecipientId, socket]
  );

  // Load more messages (pagination) - NOT IMPLEMENTED IN API YET
  const loadMoreMessages = useCallback(
    async (chatId: string, offset: number) => {
      // Placeholder for pagination
      console.log("Load more messages not implemented via API yet");
    },
    []
  );

  // Select a chat
  const selectChat = useCallback((chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setCurrentChat(chat);
      triggerGetMessages(chatId);
      
      // Mark unread messages as read (optimistic/local)
      // We should ideally wait for messages to load, but we can try to mark existing ones
      // The actual marking happens when messages are rendered or when we have them
    }
  }, [chats, triggerGetMessages]);

  // Clear current chat
  const clearChat = useCallback(() => {
    setCurrentChat(null);
  }, []);

  // Create chat
  const createChat = useCallback(async (partnerId: string) => {
    try {
      const chat = await createChatMutation({ partnerId }).unwrap();
      // Refetch chats to include the new one
      await refetchChats();
      // Select the new chat
      selectChat(chat.id);
      return chat;
    } catch (error) {
      console.error("Failed to create chat:", error);
      toast.error("Failed to create chat");
      throw error;
    }
  }, [createChatMutation, refetchChats, selectChat]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("message:new", handleNewMessage);
    socket.on("message:sent", handleMessageSent); // Listen for own message confirmation
    socket.on("message:read", handleMessageRead);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    // Cleanup
    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:sent", handleMessageSent);
      socket.off("message:read", handleMessageRead);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [socket, handleNewMessage, handleMessageSent, handleMessageRead, handleTypingStart, handleTypingStop]);

  // Auto-clear typing indicators after timeout (3 seconds)
  useEffect(() => {
    if (typingUsers.size === 0) return;

    const timeout = setTimeout(() => {
      setTypingUsers(new Set());
    }, 3000);

    return () => clearTimeout(timeout);
  }, [typingUsers]);

  return {
    messages,
    chats,
    currentChat,
    isTyping: typingUsers.size > 0,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    loadMoreMessages,
    selectChat,
    createChat,
    isLoading,
    clearChat,
  };
};
