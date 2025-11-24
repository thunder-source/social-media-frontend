"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Server, Coffee, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { DotBackground } from "@/components/ui/dot-background";

export function LoadingScreen() {
    const [dots, setDots] = useState(".");
    const [showBackendMessage, setShowBackendMessage] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Show backend message after 5 seconds
        const timer = setTimeout(() => {
            setShowBackendMessage(true);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
            <DotBackground />
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-purple-500/10 blur-[120px] animate-pulse" />
                <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse delay-1000" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 flex flex-col items-center max-w-md px-4 text-center"
            >
                {/* Animated Icon */}
                <AnimatePresence mode="wait">
                    {!showBackendMessage ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative mb-8"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-2xl"
                            >
                                <Loader2 className="h-12 w-12 text-white" />
                            </motion.div>

                            {/* Glow effect */}
                            <div className="absolute -inset-4 bg-primary/30 blur-xl rounded-full animate-pulse" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="server"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative mb-8"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-2xl"
                            >
                                <Server className="h-12 w-12 text-white" />
                            </motion.div>

                            {/* Glow effect */}
                            <div className="absolute -inset-4 bg-primary/30 blur-xl rounded-full animate-pulse" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Text Content */}
                <AnimatePresence mode="wait">
                    {!showBackendMessage ? (
                        <motion.div
                            key="loading-text"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-3xl font-bold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                Loading{dots}
                            </h2>
                            <p className="text-muted-foreground text-lg">
                                Please wait
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="backend-text"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            <h2 className="text-3xl font-bold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                Waking up the server{dots}
                            </h2>

                            <p className="text-muted-foreground text-lg">
                                Preparing your experience
                            </p>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border/50 backdrop-blur-sm"
                            >
                                <div className="flex items-start gap-3 text-left">
                                    <Coffee className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                                    <div className="space-y-1">
                                        <p className="font-medium text-sm text-foreground">
                                            First load might take a minute
                                        </p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Our backend is hosted on a free instance that sleeps when inactive.
                                            It's just grabbing a coffee and will be ready shortly!
                                            Subsequent loads will be lightning fast. ⚡
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading Bar */}
                <motion.div
                    className="mt-8 h-1.5 w-48 overflow-hidden rounded-full bg-secondary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <motion.div
                        className="h-full bg-primary"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{
                            repeat: Infinity,
                            duration: 1.5,
                            ease: "easeInOut"
                        }}
                    />
                </motion.div>
            </motion.div>
        </div>
    );
}
