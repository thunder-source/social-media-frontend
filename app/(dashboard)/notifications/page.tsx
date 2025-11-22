"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useLazyGetNotificationsQuery, useMarkAsReadMutation, useDeleteNotificationMutation } from "@/store/api/notificationsApi";
import { Notification } from "@/types";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Loader2, Bell } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { markNotificationAsRead, deleteNotification as deleteNotificationAction } from "@/store/slices/notificationsSlice";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const observerTarget = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();

    const [trigger, { data: newNotifications, isLoading, isFetching }] = useLazyGetNotificationsQuery();
    const [markAsReadMutation] = useMarkAsReadMutation();
    const [deleteNotificationMutation] = useDeleteNotificationMutation();

    const fetchNotifications = useCallback(async (pageNum: number) => {
        if (pageNum > 1) setIsLoadingMore(true);
        try {
            const result = await trigger({ page: pageNum, limit: 10 }).unwrap();

            if (result.length < 10) {
                setHasMore(false);
            }

            setNotifications(prev => {
                if (pageNum === 1) return result;
                // Filter out duplicates just in case
                const existingIds = new Set(prev.map((n: Notification) => n.id));
                const uniqueNew = result.filter(n => !existingIds.has(n.id));
                return [...prev, ...uniqueNew];
            });
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            toast.error("Failed to load notifications");
        } finally {
            setIsLoadingMore(false);
        }
    }, [trigger]);

    useEffect(() => {
        fetchNotifications(1);
    }, [fetchNotifications]);

    useEffect(() => {
        if (page > 1) {
            fetchNotifications(page);
        }
    }, [page, fetchNotifications]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !isFetching && !isLoadingMore) {
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, isFetching, isLoadingMore]);

    const handleMarkAsRead = async (id: string) => {
        try {
            // Optimistic update local state
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            // Update global store
            dispatch(markNotificationAsRead(id));

            await markAsReadMutation(id).unwrap();
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            // Optimistic update local state
            setNotifications(prev => prev.filter(n => n.id !== id));
            // Update global store
            dispatch(deleteNotificationAction(id));

            await deleteNotificationMutation(id).unwrap();
            toast.success("Notification deleted");
        } catch (error) {
            console.error("Failed to delete:", error);
            toast.error("Failed to delete notification");
        }
    };

    return (
        <div className="container max-w-2xl mx-auto py-6 px-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-full">
                    <Bell className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Notifications</h1>
            </div>

            <div className="space-y-2">
                {notifications.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRead={() => handleMarkAsRead(notification.id)}
                        onDelete={() => handleDelete(notification.id)}
                    />
                ))}
            </div>

            {isLoading && page === 1 && (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            )}

            {!isLoading && notifications.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No notifications yet
                </div>
            )}

            {hasMore && (
                <div ref={observerTarget} className="flex justify-center py-4 mt-4">
                    {(isLoadingMore || (isFetching && page > 1)) && (
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    )}
                </div>
            )}

            {!hasMore && notifications.length > 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                    No more notifications
                </div>
            )}
        </div>
    );
}
