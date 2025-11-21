import { useState, useCallback } from 'react';
import {
  useGetPostsQuery,
  useCreatePostMutation,
  useLikePostMutation,
  useAddCommentMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} from '@/store/api/postsApi';
import { compressFile } from '@/lib/utils';

export const usePosts = () => {
  const [page, setPage] = useState(1);
  
  // Fetch posts with current page
  const { data, isLoading, error, refetch } = useGetPostsQuery(
    { page, limit: 10 },
    { 
      // Keep previous data while fetching new page
      refetchOnMountOrArgChange: false,
    }
  );

  const [createPostMutation] = useCreatePostMutation();
  const [likePostMutation] = useLikePostMutation();
  const [addCommentMutation] = useAddCommentMutation();
  const [updatePostMutation] = useUpdatePostMutation();
  const [deletePostMutation] = useDeletePostMutation();

  const posts = data?.posts || [];
  const hasMore = data?.hasMore || false;

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [isLoading, hasMore]);

  const createNewPost = useCallback(
    async (text: string, media: 'image' | 'video' | 'null', file?: File) => {
      if (file) {
        let fileToUpload: File | Blob = file;
        try {
          fileToUpload = await compressFile(file);
        } catch (error) {
          console.error('File compression failed:', error);
        }

        const formData = new FormData();
        formData.append('text', text);
        formData.append('file', fileToUpload);
        await createPostMutation(formData).unwrap();
      } else {
        await createPostMutation({ text, media }).unwrap();
      }
      // Reset to page 1 to show the new post
      setPage(1);
      refetch();
    },
    [createPostMutation, refetch]
  );

  const toggleLike = useCallback(
    (postId: string) => {
      likePostMutation(postId);
    },
    [likePostMutation]
  );

  const addComment = useCallback(
    async (postId: string, text: string) => {
      try {
        await addCommentMutation({ postId, text }).unwrap();
      } catch (error) {
        console.error('Failed to add comment:', error);
        throw error;
      }
    },
    [addCommentMutation]
  );

  const refreshPosts = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  const deletePost = useCallback(
    async (postId: string) => {
      try {
        await deletePostMutation(postId).unwrap();
        // Refresh posts after deletion
        setPage(1);
        refetch();
      } catch (error) {
        console.error('Failed to delete post:', error);
        throw error;
      }
    },
    [deletePostMutation, refetch]
  );

  const updatePost = useCallback(
    async (postId: string, text: string, media?: 'image' | 'video' | 'null') => {
      try {
        await updatePostMutation({ postId, text, media }).unwrap();
        // Refresh posts after update
        refetch();
      } catch (error) {
        console.error('Failed to update post:', error);
        throw error;
      }
    },
    [updatePostMutation, refetch]
  );

  return {
    posts,
    loading: isLoading,
    error: error ? 'Failed to fetch posts' : null,
    hasMore,
    loadMore,
    createNewPost,
    toggleLike,
    addComment,
    updatePost,
    deletePost,
    refreshPosts,
  };
};
