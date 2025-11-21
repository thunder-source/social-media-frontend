"use client";

import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { socket } from "@/lib/socket";
import type { Message, Chat } from "@/types";
import { toast } from "sonner";

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
}

export const useChat = (): UseChatReturn => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Handle incoming new messages
  const handleNewMessage = useCallback((message: Message) => {
    console.log("📨 New message received:", message);
    
    // Add message to messages list
    setMessages((prev) => {
      // Check if message already exists (prevent duplicates)
      if (prev.some(m => m.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });

    // Update chat's last message and unread count
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === message.chatId) {
          return {
            ...chat,
            lastMessage: message,
            unreadCount: message.senderId === user?.id ? 0 : chat.unreadCount + 1,
            updatedAt: message.createdAt,
          };
        }
        return chat;
      })
    );
  }, [user?.id]);

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
    (content: string, chatId: string) => {
      if (!content.trim() || !user?.id) return;

      if (!socket.connected) {
        toast.error("Connection lost. Cannot send message.");
        return;
      }

      const messageData = {
        chatId,
        content: content.trim(),
        senderId: user.id,
      };

      try {
        socket.emit("message:new", messageData);
      } catch (error) {
        console.error("Failed to send message:", error);
        toast.error("Failed to send message");
      }
    },
    [user?.id]
  );

  // Mark message as read
  const markAsRead = useCallback(
    (messageId: string) => {
      if (!user?.id) return;

      socket.emit("message:read", { messageId, userId: user.id });
    },
    [user?.id]
  );

  // Start typing indicator
  const startTyping = useCallback(
    (chatId: string) => {
      if (!user?.id) return;

      socket.emit("typing:start", { chatId, userId: user.id });
    },
    [user?.id]
  );

  // Stop typing indicator
  const stopTyping = useCallback(
    (chatId: string) => {
      if (!user?.id) return;

      socket.emit("typing:stop", { chatId, userId: user.id });
    },
    [user?.id]
  );

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(
    async (chatId: string, offset: number) => {
      // This would typically call an API endpoint
      // For now, we'll emit a socket event
      socket.emit("messages:fetch", { chatId, offset, limit: 20 });
    },
    []
  );

  // Select a chat
  const selectChat = useCallback((chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setCurrentChat(chat);
      
      // Mark unread messages as read
      const unreadMessages = messages.filter(
        (msg) => 
          msg.chatId === chatId && 
          msg.senderId !== user?.id && 
          !msg.readBy.includes(user?.id || "")
      );
      
      unreadMessages.forEach((msg) => markAsRead(msg.id));
    }
  }, [chats, messages, user?.id, markAsRead]);

  // Set up socket event listeners
  useEffect(() => {
    socket.on("message:new", handleNewMessage);
    socket.on("message:read", handleMessageRead);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    // Handle fetched messages (pagination response)
    const handleMessagesFetched = (fetchedMessages: Message[]) => {
      setMessages((prev) => {
        const newMessages = fetchedMessages.filter(
          (newMsg) => !prev.some((msg) => msg.id === newMsg.id)
        );
        return [...newMessages, ...prev];
      });
    };

    socket.on("messages:fetched", handleMessagesFetched);

    // Cleanup
    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:read", handleMessageRead);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
      socket.off("messages:fetched", handleMessagesFetched);
    };
  }, [handleNewMessage, handleMessageRead, handleTypingStart, handleTypingStop]);

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
  };
};
