"use client";

import React, { useState } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MessageSquare, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import type { Chat } from "@/types";

export default function ChatPage() {
  const {
    messages,
    chats,
    currentChat,
    isTyping,
    sendMessage,
    startTyping,
    stopTyping,
    loadMoreMessages,
    selectChat,
  } = useChat();

  const { user, onlineUsers } = useSelector((state: RootState) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter chats based on search
  const filteredChats = chats.filter((chat) => {
    const otherParticipant = chat.participants.find((p) => p.id !== user?.id);
    return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Format timestamp for chat list
  const formatChatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const handleSendMessage = (content: string) => {
    if (currentChat) {
      sendMessage(content, currentChat.id);
    }
  };

  const handleTypingStart = () => {
    if (currentChat) {
      startTyping(currentChat.id);
    }
  };

  const handleTypingStop = () => {
    if (currentChat) {
      stopTyping(currentChat.id);
    }
  };

  const handleLoadMore = () => {
    if (currentChat) {
      const earliestMessage = messages
        .filter((m) => m.chatId === currentChat.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];

      if (earliestMessage) {
        loadMoreMessages(currentChat.id, messages.length);
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Sidebar - Chat List */}
      <div className="w-full max-w-sm border-r bg-card/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Messages
          </h1>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-full"
            />
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            <AnimatePresence>
              {filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "No chats found" : "No conversations yet"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {!searchQuery && "Start a new conversation with your friends"}
                  </p>
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const otherParticipant = chat.participants.find((p) => p.id !== user?.id);
                  const isOnline = otherParticipant
                    ? onlineUsers.includes(otherParticipant.id)
                    : false;
                  const isSelected = currentChat?.id === chat.id;

                  return (
                    <motion.button
                      key={chat.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onClick={() => selectChat(chat.id)}
                      className={cn(
                        "w-full p-3 rounded-lg transition-all duration-200",
                        "flex items-center gap-3 hover:bg-accent/50",
                        isSelected && "bg-accent"
                      )}
                    >
                      {/* Avatar with online status */}
                      <div className="relative shrink-0">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={otherParticipant?.image} alt={otherParticipant?.name} />
                          <AvatarFallback>
                            {otherParticipant?.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background",
                            isOnline ? "bg-green-500" : "bg-gray-400"
                          )}
                        />
                      </div>

                      {/* Chat info */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm truncate">
                            {otherParticipant?.name}
                          </span>
                          {chat.lastMessage && (
                            <span className="text-xs text-muted-foreground ml-2 shrink-0">
                              {formatChatTime(chat.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-muted-foreground truncate">
                            {chat.lastMessage?.content || "No messages yet"}
                          </p>
                          {chat.unreadCount > 0 && (
                            <Badge
                              variant="default"
                              className="h-5 min-w-5 px-1.5 rounded-full text-xs shrink-0"
                            >
                              {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>

      {/* Chat Window */}
      <div className="flex-1">
        {currentChat ? (
          <ChatWindow
            chat={currentChat}
            messages={messages}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
            onTypingStart={handleTypingStart}
            onTypingStop={handleTypingStop}
            onLoadMore={handleLoadMore}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="bg-primary/10 p-6 rounded-full mb-4">
              <MessageSquare className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Messages</h2>
            <p className="text-muted-foreground max-w-md">
              Select a conversation from the sidebar to start chatting, or start a new
              conversation with your friends.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
