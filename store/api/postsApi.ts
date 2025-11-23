import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Post } from '@/types';

interface FetchPostsResponse {
  posts: Post[];
  hasMore: boolean;
  total?: number;
}

interface CreatePostRequest {
  text: string;
  media: 'image' | 'video' | 'null';
}

type CreatePostPayload = CreatePostRequest | FormData;

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include', // This ensures cookies are sent with every request
  }),
  tagTypes: ['Posts'],
  endpoints: (builder) => ({
    // Get posts with pagination
    getPosts: builder.query<FetchPostsResponse, { page: number; limit?: number }>({
      query: ({ page, limit = 10 }) => `/posts?page=${page}&limit=${limit}`,
      providesTags: (result) =>
        result
          ? [
              ...result.posts.map(({ id }) => ({ type: 'Posts' as const, id })),
              { type: 'Posts', id: 'LIST' },
            ]
          : [{ type: 'Posts', id: 'LIST' }],
      // Merge pages for infinite scroll
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        return {
          ...newItems,
          posts: [...currentCache.posts, ...newItems.posts],
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),

    // Create a new post
    createPost: builder.mutation<Post, CreatePostPayload>({
      query: (body) => ({
        url: '/posts',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Posts', id: 'LIST' }],
    }),

    // Like/Unlike a post (toggle)
    likePost: builder.mutation<Post, string>({
      query: (postId) => ({
        url: `/posts/${postId}/like`,
        method: 'POST',
      }),
      // Optimistically update the cache
      async onQueryStarted(postId, { dispatch, queryFulfilled, getState }) {
        // Get current user ID from auth state
        const state = getState() as any;
        const currentUser = state.auth?.user;
        const userId = currentUser?.id || currentUser?._id;
        
        const patchResult = dispatch(
          postsApi.util.updateQueryData('getPosts', { page: 1, limit: 10 }, (draft) => {
            const post = draft.posts.find((p) => p.id === postId || p._id === postId);
            if (post && userId) {
              // Toggle like optimistically (we'll update with real data when response comes)
              const isLiked = post.likes.includes(userId);
              if (isLiked) {
                post.likes = post.likes.filter((id) => id !== userId);
                if (post.likesCount !== undefined) post.likesCount--;
              } else {
                post.likes.push(userId);
                if (post.likesCount !== undefined) post.likesCount++;
              }
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, postId) => [{ type: 'Posts', id: postId }],
    }),

    // Add comment to a post
    addComment: builder.mutation<Post, { postId: string; text: string }>({
      query: ({ postId, text }) => ({
        url: `/posts/${postId}/comment`,
        method: 'POST',
        body: { text },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Posts', id: postId },
        { type: 'Posts', id: 'LIST' },
      ],
    }),

    // Update a post
    updatePost: builder.mutation<Post, { postId: string; text: string; media?: 'image' | 'video' | 'null' }>({
      query: ({ postId, ...body }) => ({
        url: `/posts/${postId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Posts', id: postId },
        { type: 'Posts', id: 'LIST' },
      ],
    }),

    // Delete a post
    deletePost: builder.mutation<void, string>({
      query: (postId) => ({
        url: `/posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Posts', id: 'LIST' }],
    }),

    // Get a single post
    getPost: builder.query<Post, string>({
      query: (postId) => `/posts/${postId}`,
      providesTags: (result, error, postId) => [{ type: 'Posts', id: postId }],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useCreatePostMutation,
  useLikePostMutation,
  useAddCommentMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useGetPostQuery,
  useLazyGetPostsQuery,
} = postsApi;
