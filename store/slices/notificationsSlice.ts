import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '@/types';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  hasPermission: boolean;
  serviceWorkerRegistered: boolean;
  pushSubscribed: boolean;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  hasPermission: false,
  serviceWorkerRegistered: false,
  pushSubscribed: false,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Set all notifications
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
    },

    // Add a new notification (real-time)
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },

    // Mark notification as read
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    // Mark all as read
    markAllAsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
      state.unreadCount = 0;
    },

    // Delete notification
    deleteNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const wasUnread = !state.notifications[index].read;
        state.notifications.splice(index, 1);
        if (wasUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },

    // Update permission status
    setPermissionStatus: (state, action: PayloadAction<boolean>) => {
      state.hasPermission = action.payload;
    },

    // Update service worker status
    setServiceWorkerStatus: (state, action: PayloadAction<boolean>) => {
      state.serviceWorkerRegistered = action.payload;
    },

    // Update push subscription status
    setPushSubscriptionStatus: (state, action: PayloadAction<boolean>) => {
      state.pushSubscribed = action.payload;
    },

    // Clear all notifications (on logout)
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  setPermissionStatus,
  setServiceWorkerStatus,
  setPushSubscriptionStatus,
  clearNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
