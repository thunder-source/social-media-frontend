import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPosts, createPost, likePost, resetPosts } from '@/store/slices/postsSlice';

export const usePosts = () => {
  const dispatch = useAppDispatch();
  const { posts, loading, error, hasMore, page } = useAppSelector((state) => state.posts);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      dispatch(fetchPosts(page));
    }
  }, [dispatch, loading, hasMore, page]);

  const createNewPost = useCallback(async (content: string, attachments: any[]) => {
    await dispatch(createPost({ content, attachments })).unwrap();
  }, [dispatch]);

  const toggleLike = useCallback((postId: string) => {
    dispatch(likePost(postId));
  }, [dispatch]);

  const refreshPosts = useCallback(() => {
    dispatch(resetPosts());
    dispatch(fetchPosts(1));
  }, [dispatch]);

  // Initial load
  useEffect(() => {
    if (posts.length === 0 && !loading) {
      dispatch(fetchPosts(1));
    }
  }, [dispatch, posts.length, loading]);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    createNewPost,
    toggleLike,
    refreshPosts,
  };
};
