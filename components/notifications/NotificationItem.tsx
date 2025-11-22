"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Heart,
    MessageCircle,
    UserPlus,
    UserCheck,
    AtSign,
    Share2,
    Mail,
    X,
    Check,
    XIcon
} from "lucide-react";
import { Notification, NotificationType } from "@/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useFriends } from "@/hooks/useFriends";
import { toast } from "sonner";

interface NotificationItemProps {
    notification: Notification;
    onRead: () => void;
    onDelete: () => void;
    onClick?: () => void;
}

const notificationConfig: Record<NotificationType, {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    getTitle: (notification: Notification) => string;
    getMessage: (notification: Notification) => string;
    getRoute: (notification: Notification) => string | null;
}> = {
    LIKE: {
        icon: Heart,
        iconBg: "bg-red-100 dark:bg-red-950",
        iconColor: "text-red-600 dark:text-red-400",
        getTitle: (n) => n.fromUser?.name || n.actor?.name || "Someone",
        getMessage: () => "liked your post",
        getRoute: (n) => {
            const postId = typeof n.postId === 'object' ? n.postId?._id : n.postId;
            return postId ? `/feed?post=${postId}` : null;
        },
    },
    COMMENT: {
        icon: MessageCircle,
        iconBg: "bg-blue-100 dark:bg-blue-950",
        iconColor: "text-blue-600 dark:text-blue-400",
        getTitle: (n) => n.fromUser?.name || n.actor?.name || "Someone",
        getMessage: (n) => n.message || "commented on your post",
        getRoute: (n) => {
            const postId = typeof n.postId === 'object' ? n.postId?._id : n.postId;
            return postId ? `/feed?post=${postId}` : null;
        },
    },
    FRIEND_REQUEST: {
        icon: UserPlus,
        iconBg: "bg-purple-100 dark:bg-purple-950",
        iconColor: "text-purple-600 dark:text-purple-400",
        getTitle: (n) => n.fromUser?.name || n.actor?.name || "Someone",
        getMessage: () => "sent you a friend request",
        getRoute: (n) => {
            const userId = n.fromUser?._id || n.fromUser?.id || n.actorId;
            return userId ? `/profile/${userId}` : null;
        },
    },
    FRIEND_ACCEPTED: {
        icon: UserCheck,
        iconBg: "bg-green-100 dark:bg-green-950",
        iconColor: "text-green-600 dark:text-green-400",
        getTitle: (n) => n.fromUser?.name || n.actor?.name || "Someone",
        getMessage: () => "accepted your friend request",
        getRoute: (n) => {
            const userId = n.fromUser?._id || n.fromUser?.id || n.actorId;
            return userId ? `/profile/${userId}` : null;
        },
    },
    MENTION: {
        icon: AtSign,
        iconBg: "bg-orange-100 dark:bg-orange-950",
        iconColor: "text-orange-600 dark:text-orange-400",
        getTitle: (n) => n.fromUser?.name || n.actor?.name || "Someone",
        getMessage: () => "mentioned you in a comment",
        getRoute: (n) => {
            const postId = typeof n.postId === 'object' ? n.postId?._id : n.postId;
            return postId ? `/feed?post=${postId}` : null;
        },
    },
    POST_SHARE: {
        icon: Share2,
        iconBg: "bg-cyan-100 dark:bg-cyan-950",
        iconColor: "text-cyan-600 dark:text-cyan-400",
        getTitle: (n) => n.fromUser?.name || n.actor?.name || "Someone",
        getMessage: () => "shared your post",
        getRoute: (n) => {
            const postId = typeof n.postId === 'object' ? n.postId?._id : n.postId;
            return postId ? `/feed?post=${postId}` : null;
        },
    },
    MESSAGE: {
        icon: Mail,
        iconBg: "bg-indigo-100 dark:bg-indigo-950",
        iconColor: "text-indigo-600 dark:text-indigo-400",
        getTitle: (n) => n.fromUser?.name || n.actor?.name || "Someone",
        getMessage: (n) => n.message || "sent you a message",
        getRoute: () => "/chat",
    },
};

// Helper function to normalize notification types
function normalizeNotificationType(type: string): NotificationType | null {
    // Convert to uppercase and replace hyphens/underscores
    const normalized = type.toUpperCase().replace(/-/g, '_');

    // Map common backend type variations to frontend types
    const typeMap: Record<string, NotificationType> = {
        'POST_LIKE': 'LIKE',
        'NEW_MESSAGE': 'MESSAGE',
        'FRIEND_REQUEST': 'FRIEND_REQUEST',
        'FRIEND_ACCEPTED': 'FRIEND_ACCEPTED',
        'POST_COMMENT': 'COMMENT',
        // Add lowercase mappings for API response
        'post_like': 'LIKE',
        'new_message': 'MESSAGE',
        'friend_request': 'FRIEND_REQUEST',
        'friend_accepted': 'FRIEND_ACCEPTED',
        'post_comment': 'COMMENT',
    };

    // Check if it's a known mapped type
    if (typeMap[normalized]) {
        return typeMap[normalized];
    }

    // Check if it's a valid NotificationType
    if (normalized in notificationConfig) {
        return normalized as NotificationType;
    }

    return null;
}

export function NotificationItem({
    notification,
    onRead,
    onDelete,
    onClick
}: NotificationItemProps) {
    const router = useRouter();
    const { acceptFriendRequest, rejectFriendRequest } = useFriends();

    // Normalize notification type to handle backend/frontend format differences
    const normalizedType = normalizeNotificationType(notification.type);

    // Handle unrecognized notification types
    if (!normalizedType) {
        console.error(`Unknown notification type: ${notification.type}`);
        return null;
    }

    const config = notificationConfig[normalizedType];
    const Icon = config.icon;

    const handleClick = () => {
        if (!notification.read) {
            onRead();
        }

        const route = config.getRoute(notification);
        if (route) {
            router.push(route);
            onClick?.();
        }
    };

    const handleAcceptFriend = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!notification.friendRequestId) return;

        try {
            await acceptFriendRequest(notification.friendRequestId);
            toast.success("Friend request accepted!");
            onRead();
        } catch (error) {
            toast.error("Failed to accept friend request");
        }
    };

    const handleRejectFriend = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!notification.friendRequestId) return;

        try {
            await rejectFriendRequest(notification.friendRequestId);
            toast.success("Friend request rejected");
            onDelete();
        } catch (error) {
            toast.error("Failed to reject friend request");
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete();
    };

    return (
        <Card
            className={cn(
                "relative p-3 mb-2 cursor-pointer transition-all duration-200 hover:shadow-md border",
                notification.read
                    ? "bg-background border-border"
                    : "bg-accent/50 border-primary/20 dark:bg-accent/30"
            )}
            onClick={handleClick}
        >
            <div className="flex items-start gap-3">
                {/* Actor Avatar */}
                <Avatar className="h-10 w-10 ring-2 ring-background">
                    <AvatarImage
                        src={notification.fromUser?.photo || notification.fromUser?.image || notification.actor?.photo || notification.actor?.image}
                        alt={notification.fromUser?.name || notification.actor?.name}
                    />
                    <AvatarFallback>
                        {(notification.fromUser?.name || notification.actor?.name)?.charAt(0)?.toUpperCase() || "?"}
                    </AvatarFallback>
                </Avatar>

                {/* Notification Icon Badge */}
                <div className={cn(
                    "absolute -top-1 left-8 w-6 h-6 rounded-full flex items-center justify-center ring-2 ring-background",
                    config.iconBg
                )}>
                    <Icon className={cn("h-3 w-3", config.iconColor)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">
                        <span className="font-semibold text-foreground">
                            {config.getTitle(notification)}
                        </span>
                        {" "}
                        <span className="text-muted-foreground">
                            {config.getMessage(notification)}
                        </span>
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>

                    {/* Friend Request Actions */}
                    {normalizedType === "FRIEND_REQUEST" && !notification.read && (
                        <div className="flex gap-2 mt-3">
                            <Button
                                size="sm"
                                className="h-7 text-xs flex-1"
                                onClick={handleAcceptFriend}
                            >
                                <Check className="h-3 w-3 mr-1" />
                                Accept
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs flex-1"
                                onClick={handleRejectFriend}
                            >
                                <XIcon className="h-3 w-3 mr-1" />
                                Reject
                            </Button>
                        </div>
                    )}
                </div>

                {/* Delete Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleDelete}
                >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Delete notification</span>
                </Button>

                {/* Unread Indicator */}
                {!notification.read && (
                    <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full" />
                )}
            </div>
        </Card>
    );
}
