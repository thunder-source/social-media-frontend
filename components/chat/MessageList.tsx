"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Message } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MessageListProps {
    messages: Message[];
    chatId: string;
    onLoadMore?: () => void;
    isLoading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
    messages,
    chatId,
    onLoadMore,
    isLoading = false,
}) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const prevScrollHeight = useRef(0);

    // Filter messages for current chat
    const chatMessages = messages.filter((msg) => msg.chatId === chatId);

    // Auto-scroll to bottom on new message
    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    // Handle scroll to detect if user manually scrolled up
    const handleScroll = () => {
        if (!messagesContainerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

        setShouldAutoScroll(isNearBottom);

        // Load more messages when scrolled to top
        if (scrollTop < 100 && !isLoading && onLoadMore) {
            prevScrollHeight.current = scrollHeight;
            onLoadMore();
        } else if (scrollTop >= 100) {
            // Reset prevScrollHeight if user scrolls down, so we don't jump
            // back to a previous position when new messages arrive
            prevScrollHeight.current = 0;
        }
    };

    // Auto-scroll on new messages (only if user hasn't scrolled up)
    useEffect(() => {
        if (shouldAutoScroll && chatMessages.length > 0) {
            // If it's the very first load or we are already at bottom, scroll instantly or smooth
            // We can use a ref to track if it's the first mount for this chat
            scrollToBottom();
        }
    }, [chatMessages.length, shouldAutoScroll]);

    // Maintain scroll position after loading more messages
    useEffect(() => {
        if (messagesContainerRef.current && prevScrollHeight.current) {
            const { scrollHeight } = messagesContainerRef.current;
            const scrollDiff = scrollHeight - prevScrollHeight.current;
            messagesContainerRef.current.scrollTop = scrollDiff;
            prevScrollHeight.current = 0;
        }
    }, [chatMessages.length]); // Changed dependency to length to catch updates

    // Initial scroll to bottom
    useEffect(() => {
        // Use a small timeout to ensure DOM is ready
        const timeoutId = setTimeout(() => {
            scrollToBottom("instant");
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [chatId]);

    // Force scroll to bottom when messages first load if they were empty
    useEffect(() => {
        if (chatMessages.length > 0 && shouldAutoScroll) {
            scrollToBottom("instant");
        }
    }, [chatId]); // This might be redundant with the above, but ensures if messages come in later

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getMessageDate = (timestamp: string) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        }
    };

    const shouldShowDateDivider = (currentMsg: Message, prevMsg?: Message) => {
        if (!prevMsg) return true;

        const currentDate = new Date(currentMsg.createdAt).toDateString();
        const prevDate = new Date(prevMsg.createdAt).toDateString();

        return currentDate !== prevDate;
    };

    const renderReadReceipt = (message: Message) => {
        if (message.senderId !== user?.id) return null;

        const isRead = message.readBy.length > 1; // More than just the sender

        return (
            <div className="flex items-center gap-0.5">
                {isRead ? (
                    <CheckCheck className="h-4 w-4 text-blue-500" />
                ) : (
                    <Check className="h-4 w-4 text-muted-foreground" />
                )}
            </div>
        );
    };

    return (
        <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-2 md:px-4 py-6 space-y-4"
        >
            {isLoading && (
                <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                </div>
            )}

            <AnimatePresence initial={false}>
                {chatMessages.map((message, index) => {
                    const isOwnMessage = message.senderId === user?.id;
                    const prevMessage = index > 0 ? chatMessages[index - 1] : undefined;
                    const showDate = shouldShowDateDivider(message, prevMessage);

                    return (
                        <React.Fragment key={message.id}>
                            {showDate && (
                                <div className="flex justify-center my-4">
                                    <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                                        {getMessageDate(message.createdAt)}
                                    </div>
                                </div>
                            )}

                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className={cn("flex gap-2", isOwnMessage ? "flex-row-reverse" : "flex-row")}
                            >
                                {!isOwnMessage && (
                                    <Avatar className="h-8 w-8 shrink-0">
                                        <AvatarImage src={message.sender.image} alt={message.sender.name} />
                                        <AvatarFallback className="text-xs">
                                            {message.sender.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                )}

                                <div
                                    className={cn(
                                        "flex flex-col gap-1 max-w-[85%] md:max-w-[70%]",
                                        isOwnMessage ? "items-end" : "items-start"
                                    )}
                                >
                                    {!isOwnMessage && (
                                        <span className="text-xs font-medium text-muted-foreground px-3">
                                            {message.sender.name}
                                        </span>
                                    )}

                                    <div
                                        className={cn(
                                            "rounded-2xl px-4 py-2.5 shadow-sm",
                                            "transition-all duration-200 hover:shadow-md",
                                            isOwnMessage
                                                ? "bg-primary text-primary-foreground rounded-tr-md"
                                                : "bg-muted text-foreground rounded-tl-md"
                                        )}
                                    >
                                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                            {message.content}
                                        </p>
                                    </div>

                                    <div
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 text-xs text-muted-foreground",
                                            isOwnMessage && "flex-row-reverse"
                                        )}
                                    >
                                        <span>{formatTime(message.createdAt)}</span>
                                        {renderReadReceipt(message)}
                                    </div>
                                </div>
                            </motion.div>
                        </React.Fragment>
                    );
                })}
            </AnimatePresence>

            <div ref={messagesEndRef} />
        </div>
    );
};
