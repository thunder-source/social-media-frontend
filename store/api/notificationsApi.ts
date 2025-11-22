import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Notification } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api`,
    credentials: 'include',
  }),
  tagTypes: ['Notification'],
  endpoints: (builder) => ({
    // Fetch all notifications
    getNotifications: builder.query<Notification[], { unreadOnly?: boolean; page?: number; limit?: number } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.unreadOnly) queryParams.append('unreadOnly', 'true');
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        
        const queryString = queryParams.toString();
        return `/notifications${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: any) => {
        // Backend might return { notifications: [...] } or just [...]
        return response.notifications || response || [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Notification' as const, id })),
              { type: 'Notification', id: 'LIST' },
            ]
          : [{ type: 'Notification', id: 'LIST' }],
    }),

    // Mark notification as read
    markAsRead: builder.mutation<Notification, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Notification', id }],
    }),

    // Mark all notifications as read
    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PUT',
      }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
    }),

    // Delete notification
    deleteNotification: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Notification', id }],
    }),

    // Subscribe to push notifications
    subscribeToPush: builder.mutation<void, PushSubscription>({
      query: (subscription) => ({
        url: '/notifications/subscribe',
        method: 'POST',
        body: subscription,
      }),
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useSubscribeToPushMutation,
} = notificationsApi;
