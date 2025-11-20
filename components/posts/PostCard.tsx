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
import { Input } from '@/components/ui/input';
import VideoPlayer from './VideoPlayer';
import { useAppDispatch } from '@/store/hooks';
import { likePost } from '@/store/slices/postsSlice';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const dispatch = useAppDispatch();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleLike = () => {
    dispatch(likePost(post.id));
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    // Dispatch comment action here (to be implemented)
    setCommentText('');
  };

  const isLiked = post.likes.includes('user-1'); // Mock current user check

  return (
    <Card className="w-full mb-6 overflow-hidden border-none shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Avatar className="cursor-pointer">
          <AvatarImage src={post.user.image} alt={post.user.name} />
          <AvatarFallback>{post.user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1">
          <span className="font-semibold text-sm cursor-pointer hover:underline">
            {post.user.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit Post</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete Post</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="p-0">
        {post.content && (
          <p className="px-4 pb-4 text-sm whitespace-pre-wrap">{post.content}</p>
        )}

        {post.attachments.length > 0 && (
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
                  <VideoPlayer src={attachment.url} />
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
              <span className="text-xs font-medium">{post._count?.likes || 0}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 px-2 text-muted-foreground"
              onClick={() => setIsCommentsOpen(!isCommentsOpen)}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs font-medium">{post._count?.comments || 0}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 px-2 text-muted-foreground">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {isCommentsOpen && (
          <div className="w-full px-4 pb-4 bg-muted/30 animate-in slide-in-from-top-2">
            <div className="space-y-4 pt-4">
              {/* Comment Input */}
              <form onSubmit={handleComment} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>ME</AvatarFallback>
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

              {/* Comments List (Mock) */}
              <div className="space-y-3 pl-11">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex flex-col gap-1">
                    <div className="bg-background/50 p-3 rounded-lg rounded-tl-none text-sm">
                      <span className="font-semibold mr-2">{comment.user.name}</span>
                      {comment.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground pl-1">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
