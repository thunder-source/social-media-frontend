import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Post, Comment } from '@/types';

interface PostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

const initialState: PostsState = {
  posts: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
};

// Mock API calls for now - replace with actual API calls later
const fetchPostsApi = async (page: number) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Mock data
  const newPosts: Post[] = Array.from({ length: 5 }).map((_, i) => ({
    id: `post-${page}-${i}`,
    content: `This is post ${i + 1} on page ${page}. #socialmedia #nextjs`,
    userId: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attachments: i % 2 === 0 ? [{
      id: `att-${page}-${i}`,
      type: 'image',
      url: `https://picsum.photos/seed/${page}-${i}/600/400`,
    }] : [],
    likes: [],
    comments: [],
    user: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      image: 'https://github.com/shadcn.png',
    },
    _count: {
      likes: 0,
      comments: 0,
    },
  }));

  return {
    posts: newPosts,
    hasMore: page < 5, // Limit to 5 pages for demo
  };
};

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (page: number) => {
    const response = await fetchPostsApi(page);
    return response;
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData: { content: string; attachments: any[] }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const newPost: Post = {
      id: `post-${Date.now()}`,
      content: postData.content,
      userId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: postData.attachments,
      likes: [],
      comments: [],
      user: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://github.com/shadcn.png',
      },
      _count: {
        likes: 0,
        comments: 0,
      },
    };
    return newPost;
  }
);

export const likePost = createAsyncThunk(
  'posts/likePost',
  async (postId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return postId;
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    resetPosts: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.meta.arg === 1) {
          state.posts = action.payload.posts;
        } else {
          state.posts = [...state.posts, ...action.payload.posts];
        }
        state.hasMore = action.payload.hasMore;
        state.page += 1;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch posts';
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      .addCase(likePost.pending, (state, action) => {
        // Optimistic update
        const post = state.posts.find((p) => p.id === action.meta.arg);
        if (post) {
          const userId = 'user-1'; // Current user
          if (post.likes.includes(userId)) {
            post.likes = post.likes.filter((id) => id !== userId);
            post._count = { 
              likes: (post._count?.likes || 0) - 1,
              comments: post._count?.comments || 0
            };
          } else {
            post.likes.push(userId);
            post._count = { 
              likes: (post._count?.likes || 0) + 1,
              comments: post._count?.comments || 0
            };
          }
        }
      });
  },
});

export const { resetPosts } = postsSlice.actions;
export default postsSlice.reducer;
