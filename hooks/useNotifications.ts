"use client";

import { useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useAppDispatch } from "@/store/hooks";
import { useSocket } from "@/components/providers/SocketProvider";
import type { Notification } from "@/types";
import { toast } from "sonner";
import {
  setNotifications,
  addNotification,
  markNotificationAsRead,
  markAllAsRead as markAllAsReadAction,
  deleteNotification as deleteNotificationAction,
  setPermissionStatus,
  setServiceWorkerStatus,
  setPushSubscriptionStatus,
} from "@/store/slices/notificationsSlice";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useSubscribeToPushMutation,
} from "@/store/api/notificationsApi";
import {
  registerServiceWorker,
  requestPushPermission,
  subscribeToPush,
  sendSubscriptionToBackend,
} from "@/lib/serviceWorker";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

export function useNotifications() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { socket } = useSocket();
  const {
    notifications,
    unreadCount,
    hasPermission,
    serviceWorkerRegistered,
    pushSubscribed,
  } = useSelector((state: RootState) => state.notifications);

  // RTK Query hooks
  const {
    data: fetchedNotifications,
    isLoading,
    refetch,
  } = useGetNotificationsQuery(undefined, { skip: !isAuthenticated });
  const [markAsReadMutation] = useMarkAsReadMutation();
  const [markAllAsReadMutation] = useMarkAllAsReadMutation();
  const [deleteNotificationMutation] = useDeleteNotificationMutation();
  const [subscribeToPushMutation] = useSubscribeToPushMutation();

  // Update Redux store when notifications are fetched
  useEffect(() => {
    if (fetchedNotifications) {
      dispatch(setNotifications(fetchedNotifications));
    }
  }, [fetchedNotifications, dispatch]);

  // Initialize service worker and permissions
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const initializeNotifications = async () => {
      try {
        // Register service worker
        const registration = await registerServiceWorker();

        if (registration) {
          dispatch(setServiceWorkerStatus(true));
        }

        // Wait before requesting permission
        setTimeout(async () => {
          const permission = await requestPushPermission();
          dispatch(setPermissionStatus(permission === "granted"));

          // Validate VAPID key format (simple regex for base64url)
          const isValidVapidKey =
            VAPID_PUBLIC_KEY &&
            VAPID_PUBLIC_KEY.length > 10 &&
            /^[a-zA-Z0-9\-_]+$/.test(VAPID_PUBLIC_KEY);

          if (permission === "granted" && isValidVapidKey && registration) {
            try {
              const subscription = await subscribeToPush(
                registration,
                VAPID_PUBLIC_KEY
              );

              if (subscription) {
                const success = await sendSubscriptionToBackend(
                  subscription,
                  API_URL
                );
                dispatch(setPushSubscriptionStatus(success));
              }
            } catch (error) {
              console.error("Failed to setup push notifications:", error);
            }
          }
        }, 3000);
      } catch (error) {
        console.error("Failed to initialize notifications:", error);
      }
    };

    initializeNotifications();
  }, [isAuthenticated, user?.id, dispatch]);

  // Socket listener for new notifications
  useEffect(() => {
    if (!isAuthenticated || !user?.id || !socket) return;

    const handleNewNotification = (notification: Notification) => {
      console.log("📬 New notification received:", notification);

      // Add to Redux store
      dispatch(addNotification(notification));

      // Show browser notification
      if (hasPermission) {
        showBrowserNotification(notification);
      }

      // Show toast
      // const config = getNotificationConfig(notification);
      // toast.info(config.title, {
      //   description: config.message,
      //   duration: 4000,
      // });
    };

    socket.on("notification", handleNewNotification);

    return () => {
      socket.off("notification", handleNewNotification);
    };
  }, [isAuthenticated, user?.id, hasPermission, dispatch, socket]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        // Optimistic update
        dispatch(markNotificationAsRead(notificationId));

        // Call API
        await markAsReadMutation(notificationId).unwrap();
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        // Refetch to sync state
        refetch();
      }
    },
    [dispatch, markAsReadMutation, refetch, socket]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      dispatch(markAllAsReadAction());

      // Call API
      await markAllAsReadMutation().unwrap();

      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark all as read");
      // Refetch to sync state
      refetch();
    }
  }, [dispatch, markAllAsReadMutation, refetch]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        // Optimistic update
        dispatch(deleteNotificationAction(notificationId));

        // Call API
        await deleteNotificationMutation(notificationId).unwrap();
      } catch (error) {
        console.error("Failed to delete notification:", error);
        toast.error("Failed to delete notification");
        // Refetch to sync state
        refetch();
      }
    },
    [dispatch, deleteNotificationMutation, refetch]
  );

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      dispatch(setPermissionStatus(true));
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      const granted = permission === "granted";
      dispatch(setPermissionStatus(granted));
      return granted;
    }

    return false;
  }, [dispatch]);

  return {
    notifications,
    unreadCount,
    isLoading,
    hasPermission,
    serviceWorkerRegistered,
    pushSubscribed,
    fetchNotifications: refetch,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestNotificationPermission,
  };
}

// Helper function to show browser notification
function showBrowserNotification(notification: Notification) {
  if (Notification.permission !== "granted") return;

  const config = getNotificationConfig(notification);
  const title = config.title;
  const body = config.message;

  const browserNotification = new Notification(title, {
    body,
    icon:
      notification.actor?.photo ||
      notification.actor?.image ||
      "/default-avatar.png",
    badge: "/logo.png",
    tag: notification.id,
    requireInteraction: false,
    silent: false,
  });

  browserNotification.onclick = () => {
    window.focus();
    const route = config.route;
    if (route) {
      window.location.href = route;
    }
    browserNotification.close();
  };

  // Auto close after 5 seconds
  setTimeout(() => browserNotification.close(), 5000);
}

// Helper function to get notification config
function getNotificationConfig(notification: Notification) {
  const actorName = notification.actor?.name || "Someone";

  const configs: Record<
    string,
    { title: string; message: string; route: string | null }
  > = {
    LIKE: {
      title: actorName,
      message: "liked your post",
      route: notification.postId ? `/feed?post=${notification.postId}` : null,
    },
    COMMENT: {
      title: actorName,
      message: notification.message || "commented on your post",
      route: notification.postId ? `/feed?post=${notification.postId}` : null,
    },
    FRIEND_REQUEST: {
      title: actorName,
      message: "sent you a friend request",
      route: `/profile/${notification.actorId}`,
    },
    FRIEND_ACCEPTED: {
      title: actorName,
      message: "accepted your friend request",
      route: `/profile/${notification.actorId}`,
    },
    MENTION: {
      title: actorName,
      message: "mentioned you in a comment",
      route: notification.postId ? `/feed?post=${notification.postId}` : null,
    },
    POST_SHARE: {
      title: actorName,
      message: "shared your post",
      route: notification.postId ? `/feed?post=${notification.postId}` : null,
    },
    MESSAGE: {
      title: actorName,
      message: notification.message || "sent you a message",
      route: "/chat",
    },
  };

  return (
    configs[notification.type] || {
      title: actorName,
      message: "sent you a notification",
      route: null,
    }
  );
}
