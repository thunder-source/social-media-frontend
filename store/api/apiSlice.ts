import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User } from '../../types/auth';


// Wrapper to ensure credentials are included in every request if needed, 
// but actually fetchBaseQuery supports `credentials` in the individual request config 
// or we can pass it to the fetchBaseQuery config itself if we want it global?
// Wait, looking at type definitions, fetchBaseQuery options include `credentials`.
// Let's use that.

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    credentials: 'include', // This ensures cookies are sent with every request
  }),
  tagTypes: ['Chats', 'Messages', 'Posts', 'Friends', 'FriendRequests', 'Notification'],
  endpoints: (builder) => ({
    getCurrentUser: builder.query<User, void>({
      query: () => '/auth/me',
      transformResponse: (response: { user: User }) => response.user,
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
  }),
});

export const { useGetCurrentUserQuery, useLogoutMutation } = apiSlice;
