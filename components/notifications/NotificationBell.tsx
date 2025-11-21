"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    } = useNotifications();

    const [showBadgePulse, setShowBadgePulse] = useState(false);

    // Trigger pulse animation when unread count changes
    useEffect(() => {
        if (unreadCount > 0) {
            setShowBadgePulse(true);
            const timer = setTimeout(() => setShowBadgePulse(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [unreadCount]);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                        "relative h-9 w-9 transition-all duration-200",
                        isOpen && "bg-accent"
                    )}
                >
                    <Bell className="h-4 w-4" />
                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-1 -right-1"
                            >
                                <motion.div
                                    animate={
                                        showBadgePulse
                                            ? {
                                                scale: [1, 1.2, 1],
                                                transition: { duration: 0.5 },
                                            }
                                            : {}
                                    }
                                    className="flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full ring-2 ring-background"
                                >
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <span className="sr-only">Notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[380px] p-0"
                align="end"
                sideOffset={8}
            >
                <div className="flex items-center justify-between p-4 pb-3">
                    <h3 className="font-semibold text-base">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="h-7 text-xs text-muted-foreground hover:text-foreground"
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>
                <Separator />

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                ) : notifications.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-12 text-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                            <Bell className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                            No notifications yet
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            We'll notify you when something happens
                        </p>
                    </motion.div>
                ) : (
                    <ScrollArea className="h-[400px]">
                        <div className="p-1">
                            <AnimatePresence mode="popLayout">
                                {notifications.map((notification, index) => (
                                    <motion.div
                                        key={notification.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <NotificationItem
                                            notification={notification}
                                            onRead={() => markAsRead(notification.id)}
                                            onDelete={() => deleteNotification(notification.id)}
                                            onClick={() => setIsOpen(false)}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                )}

                {notifications.length > 0 && (
                    <>
                        <Separator />
                        <div className="p-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs text-muted-foreground hover:text-foreground"
                            >
                                View all notifications
                            </Button>
                        </div>
                    </>
                )}
            </PopoverContent>
        </Popover>
    );
}
