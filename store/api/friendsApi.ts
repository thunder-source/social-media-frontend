import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User, FriendRequest } from '@/types';

export const friendsApi = createApi({
  reducerPath: 'friendsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    credentials: 'include', // This ensures cookies are sent with every request
  }),
  tagTypes: ['Friends', 'FriendRequests'],
  endpoints: (builder) => ({
    // Get all friends
    getFriends: builder.query<User[], void>({
      query: () => '/friends',
      providesTags: ['Friends'],
      transformResponse: (response: { friends: any[], count: number }) => {
        // Map photo to image for compatibility and ensure id is set
        return response.friends.map(friend => ({
          ...friend,
          id: friend.id || friend._id,
          image: friend.image || friend.photo,
        }));
      },
    }),
    
    // Get pending friend requests
    getPendingRequests: builder.query<FriendRequest[], void>({
      query: () => '/friends/requests',
      providesTags: ['FriendRequests'],
      transformResponse: (response: { requests: any[], count: number }) => {
        // Map API response fields to expected format
        // API uses 'from' and 'to' but we expect 'sender', 'senderId', 'receiverId'
        return response.requests.map(request => ({
          ...request,
          id: request.id || request._id,
          senderId: request.from?.id || request.from?._id,
          receiverId: request.to,
          status: request.status?.toUpperCase() as 'PENDING' | 'ACCEPTED' | 'REJECTED',
          sender: {
            ...request.from,
            id: request.from.id || request.from._id,
            image: request.from.image || request.from.photo,
          },
        }));
      },
    }),
    
    // Send friend request
    sendFriendRequest: builder.mutation<void, { toUserId: string; triggeredFromPostId?: string }>({
      query: (body) => ({
        url: '/friends/request',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FriendRequests'],
    }),
    
    // Accept friend request
    acceptFriendRequest: builder.mutation<void, string>({
      query: (requestId) => ({
        url: `/friends/accept/${requestId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Friends', 'FriendRequests'],
    }),
    
    // Reject friend request
    rejectFriendRequest: builder.mutation<void, string>({
      query: (requestId) => ({
        url: `/friends/reject/${requestId}`,
        method: 'POST',
      }),
      invalidatesTags: ['FriendRequests'],
    }),
    
    // Unfriend
    unfriend: builder.mutation<void, string>({
      query: (friendId) => ({
        url: `/friends/${friendId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Friends'],
    }),
  }),
});

export const {
  useGetFriendsQuery,
  useGetPendingRequestsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useUnfriendMutation,
} = friendsApi;
