import { useState, useCallback, useEffect } from 'react';
import {
  useGetPostsQuery,
  useCreatePostMutation,
  useLikePostMutation,
  useAddCommentMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} from '@/store/api/postsApi';
import { compressFile } from '@/lib/utils';
import { toast } from 'sonner';

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

  useEffect(() => {
    if (error) {
      toast.error('Failed to fetch posts');
    }
  }, [error]);

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
      try {
        if (file) {
          let fileToUpload: File | Blob = file;
          try {
            fileToUpload = await compressFile(file);
          } catch (error) {
            console.error('File compression failed:', error);
            // Continue with original file if compression fails
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
        toast.success('Post created successfully');
      } catch (error: any) {
        console.error('Failed to create post:', error);
        toast.error(error?.data?.message || 'Failed to create post');
      }
    },
    [createPostMutation, refetch]
  );

  const toggleLike = useCallback(
    async (postId: string) => {
      try {
        await likePostMutation(postId).unwrap();
      } catch (error: any) {
        console.error('Failed to like post:', error);
        toast.error(error?.data?.message || 'Failed to like post');
      }
    },
    [likePostMutation]
  );

  const addComment = useCallback(
    async (postId: string, text: string) => {
      try {
        await addCommentMutation({ postId, text }).unwrap();
        toast.success('Comment added');
      } catch (error: any) {
        console.error('Failed to add comment:', error);
        toast.error(error?.data?.message || 'Failed to add comment');
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
        toast.success('Post deleted');
      } catch (error: any) {
        console.error('Failed to delete post:', error);
        toast.error(error?.data?.message || 'Failed to delete post');
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
        toast.success('Post updated');
      } catch (error: any) {
        console.error('Failed to update post:', error);
        toast.error(error?.data?.message || 'Failed to update post');
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
