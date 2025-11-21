'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react';
import { Post } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import VideoPlayer from './VideoPlayer';
import { useFriends } from '@/hooks/useFriends';
import { useRouter } from 'next/navigation';
import { UserPlus, MessageSquare } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string, text: string) => Promise<void>;
  onUpdate?: (postId: string, text: string, media?: 'image' | 'video' | 'null') => Promise<void>;
  onDelete?: (postId: string) => Promise<void>;
  activeVideoId?: string | null;
  onPlayVideo?: (id: string) => void;
}

export default function PostCard({ post, onLike, onComment, onUpdate, onDelete, activeVideoId, onPlayVideo }: PostCardProps) {
  const router = useRouter();
  const { checkFriendshipStatus, sendFriendRequest } = useFriends();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Get current user from auth state
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  // Extract user data - backend sends userId as populated User object
  const user = typeof post.userId === 'object' ? post.userId : post.user;
  const userIdString = typeof post.userId === 'object' ? (post.userId.id || post.userId._id) : post.userId;

  // Guard clause: if user data is not available, don't render
  if (!user) {
    console.error('Post user is undefined:', post);
    return null;
  }

  // Get user image/photo
  const userImage = user.photo || user.image;

  // Get post content
  const postContent = post.text || post.content;

  // Get counts
  const likesCount = post.likesCount ?? post._count?.likes ?? 0;
  const commentsCount = post.commentsCount ?? post._count?.comments ?? 0;

  const friendshipStatus = checkFriendshipStatus(userIdString || '');

  const handleChatOrConnect = async () => {
    if (!userIdString) return;

    if (friendshipStatus === 'FRIENDS') {
      router.push(`/chat?userId=${userIdString}`);
    } else if (friendshipStatus === 'NONE') {
      try {
        await sendFriendRequest(userIdString, post.id);
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const handleLike = () => {
    onLike?.(post.id);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await onComment?.(post.id, commentText);
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDeletePost = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(post.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditPost = () => {
    const postContent = post.text || post.content || '';
    setEditContent(postContent);
    setIsEditDialogOpen(true);
  };

  const handleUpdatePost = async () => {
    if (!onUpdate || !editContent.trim()) return;

    setIsUpdating(true);
    try {
      await onUpdate(post.id, editContent);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update post:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Check if current user has liked this post
  const currentUserId = currentUser?.id || currentUser?._id;
  const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;

  return (
    <Card className="w-full mb-6 overflow-hidden shadow-sm bg-card/50 backdrop-blur-sm py-0 gap-0 ">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Avatar className="cursor-pointer">
          <AvatarImage src={userImage} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1">
          <span className="font-semibold text-sm cursor-pointer hover:underline">
            {user.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
        </div>
        {/* Only show edit/delete options if current user owns this post */}
        {currentUserId && (currentUserId === userIdString || currentUserId === post.userId) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditPost}>Edit Post</DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {postContent && (
          <p className="px-4 pb-4 text-sm whitespace-pre-wrap">{postContent}</p>
        )}

        {/* Handle media - backend uses mediaType and mediaUrl */}
        {post.mediaUrl && post.mediaType && (
          <div className="w-full">
            {post.mediaType === 'image' ? (
              <div className="relative w-full aspect-video">
                <Image
                  src={post.mediaUrl}
                  alt="Post attachment"
                  fill
                  className="object-cover"
                />
              </div>
            ) : post.mediaType === 'video' ? (
              <VideoPlayer
                src={post.mediaUrl}
                videoId={`${post.id}-main`}
                activeVideoId={activeVideoId}
                onPlay={onPlayVideo}
              />
            ) : null}
          </div>
        )}

        {/* Fallback to attachments array if present */}
        {!post.mediaUrl && post.attachments && post.attachments.length > 0 && (
          <div className="w-full">
            {post.attachments.map((attachment) => (
              <div key={attachment.id} className="w-full">
                {attachment.type === 'image' ? (
                  <div className="relative w-full aspect-video">
                    <Image
                      src={attachment.url}
                      alt="Post attachment"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <VideoPlayer
                    src={attachment.url}
                    videoId={attachment.id}
                    activeVideoId={activeVideoId}
                    onPlay={onPlayVideo}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col p-0">
        <div className="flex items-center justify-between w-full px-4 py-3 border-t border-border/50">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 px-2 ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground'}`}
              onClick={handleLike}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">{likesCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 px-2 text-muted-foreground"
              onClick={() => setIsCommentsOpen(!isCommentsOpen)}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs font-medium">{commentsCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 px-2 text-muted-foreground">
              <Share2 className="h-5 w-5" />
            </Button>

            {userIdString !== currentUserId && ( // Don't show for own posts
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 px-2 text-muted-foreground"
                onClick={handleChatOrConnect}
                disabled={friendshipStatus === 'PENDING'}
              >
                {friendshipStatus === 'FRIENDS' ? (
                  <MessageSquare className="h-5 w-5" />
                ) : (
                  <UserPlus className={`h-5 w-5 ${friendshipStatus === 'PENDING' ? 'opacity-50' : ''}`} />
                )}
              </Button>
            )}
          </div>
        </div>

        {isCommentsOpen && (
          <div className="w-full px-4 pb-4 bg-muted/30 animate-in slide-in-from-top-2">
            <div className="space-y-4 pt-4">
              {/* Comment Input */}
              <form
                onSubmit={handleComment}
                className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.photo} />
                  <AvatarFallback>{currentUser?.name?.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="pr-10 h-9 text-sm bg-background/50"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="absolute right-0 top-0 h-9 w-9 text-primary hover:text-primary/80"
                    disabled={!commentText.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {post.comments?.map((comment) => {
                  const commentUser = typeof comment.userId === 'object' ? comment.userId : comment.user;
                  const commentContent = comment.text || comment.content;
                  const commentUserPhoto = commentUser?.photo || commentUser?.image;
                  return (
                    <div key={comment.id || comment._id} className="flex gap-3 group">
                      <Avatar className="h-9 w-9 shrink-0 ring-2 ring-background">
                        <AvatarImage src={commentUserPhoto} />
                        <AvatarFallback className="text-xs">{commentUser?.name?.slice(0, 2) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{commentUser?.name || 'Unknown'}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="bg-muted/50 hover:bg-muted/70 transition-colors p-3 rounded-2xl rounded-tl-md">
                          <p className="text-sm leading-relaxed break-words">{commentContent}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardFooter>

      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="What's on your mind?"
              className="min-h-[150px] resize-none"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value.slice(0, 2200))}
            />
            <div className="flex justify-end">
              <span className="text-xs text-muted-foreground">
                {editContent.length}/2200
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePost}
              disabled={!editContent.trim() || isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
