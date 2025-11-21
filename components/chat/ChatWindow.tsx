"use client";

import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { X, Phone, Video, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";
import type { Chat, Message } from "@/types";

interface ChatWindowProps {
  chat: Chat;
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (content: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  onLoadMore?: () => void;
  onClose?: () => void;
  isModal?: boolean;
  className?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  messages,
  isTyping,
  onSendMessage,
  onTypingStart,
  onTypingStop,
  onLoadMore,
  onClose,
  isModal = false,
  className,
}) => {
  const { user, onlineUsers } = useSelector((state: RootState) => state.auth);

  // Get the other participant (assuming 1-on-1 chat)
  const otherParticipant = chat.participants.find((p) => p.id !== user?.id);
  const isOnline = otherParticipant ? onlineUsers.includes(otherParticipant.id) : false;

  // Mark messages as read when chat window is opened
  useEffect(() => {
    // This would typically be handled by the parent component
    // but we can add additional logic here if needed
  }, [chat.id]);

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background",
        isModal && "rounded-lg shadow-2xl border",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card/50 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherParticipant?.image} alt={otherParticipant?.name} />
              <AvatarFallback>
                {otherParticipant?.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Online status indicator */}
            <div
              className={cn(
                "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                isOnline ? "bg-green-500" : "bg-gray-400"
              )}
            />
          </div>

          <div className="flex flex-col">
            <h2 className="font-semibold text-sm">{otherParticipant?.name}</h2>
            <p className="text-xs text-muted-foreground">
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MoreVertical className="h-4 w-4" />
          </Button>
          {isModal && onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        chatId={chat.id}
        onLoadMore={onLoadMore}
      />

      {/* Typing Indicator */}
      <AnimatePresence>
        {isTyping && otherParticipant && (
          <TypingIndicator userName={otherParticipant.name} />
        )}
      </AnimatePresence>

      {/* Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
      />
    </div>
  );
};
