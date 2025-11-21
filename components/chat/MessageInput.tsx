"use client";

import React, { useCallback, useRef, useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface MessageInputProps {
    onSendMessage: (content: string) => void;
    onTypingStart: () => void;
    onTypingStop: () => void;
    placeholder?: string;
    disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
    onSendMessage,
    onTypingStart,
    onTypingStop,
    placeholder = "Type a message...",
    disabled = false,
}) => {
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Debounced typing indicator
    const handleTyping = useCallback(() => {
        if (!isTyping) {
            setIsTyping(true);
            onTypingStart();
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            onTypingStop();
        }, 2000);
    }, [isTyping, onTypingStart, onTypingStop]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        handleTyping();
    };

    const handleSend = () => {
        if (!message.trim() || disabled) return;

        onSendMessage(message);
        setMessage("");

        // Stop typing indicator
        if (isTyping) {
            setIsTyping(false);
            onTypingStop();
        }

        // Clear typing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        // Send on Enter, new line on Shift+Enter
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Auto-resize textarea
    const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.target;
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    };

    return (
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-end gap-2 p-4">
                <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => {
                        handleInputChange(e);
                        handleTextareaResize(e);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={cn(
                        "min-h-[44px] max-h-[120px] resize-none",
                        "rounded-2xl border-2 focus-visible:ring-1",
                        "transition-all duration-200"
                    )}
                    rows={1}
                />
                <Button
                    onClick={handleSend}
                    disabled={!message.trim() || disabled}
                    size="icon"
                    className={cn(
                        "h-11 w-11 shrink-0 rounded-full",
                        "transition-all duration-200",
                        message.trim() && !disabled
                            ? "bg-primary hover:bg-primary/90 scale-100"
                            : "scale-95 opacity-50"
                    )}
                >
                    <Send className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};
