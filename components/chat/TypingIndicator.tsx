"use client";

import React from "react";
import { motion } from "framer-motion";

interface TypingIndicatorProps {
    userName?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ userName = "User" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground"
        >
            <span className="font-medium">{userName}</span>
            <span>is typing</span>
            <div className="flex gap-1">
                {[0, 1, 2].map((index) => (
                    <motion.div
                        key={index}
                        className="w-1.5 h-1.5 bg-primary rounded-full"
                        animate={{
                            y: [0, -8, 0],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: index * 0.15,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>
        </motion.div>
    );
};
