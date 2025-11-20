'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Image as ImageIcon, Video, X, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppDispatch } from '@/store/hooks';
import { createPost } from '@/store/slices/postsSlice';

export default function CreatePost() {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [media, setMedia] = useState<{ file: File; preview: string; type: 'image' | 'video' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_CHARS = 2200;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const type = file.type.startsWith('video/') ? 'video' : 'image';
    const preview = URL.createObjectURL(file);
    setMedia({ file, preview, type });
  };

  const handleSubmit = async () => {
    if (!content.trim() && !media) return;

    setIsLoading(true);
    try {
      // In a real app, upload media first then get URL
      const attachments = media ? [{
        id: `att-${Date.now()}`,
        type: media.type,
        url: media.preview, // Using preview URL for demo
      }] : [];

      await dispatch(createPost({ content, attachments })).unwrap();
      
      setIsOpen(false);
      setContent('');
      setMedia(null);
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mb-8 bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50 shadow-sm">
      <div className="flex gap-4 items-center">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>ME</AvatarFallback>
        </Avatar>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="flex-1 text-left px-4 py-3 rounded-full bg-muted/50 hover:bg-muted transition-colors text-muted-foreground text-sm">
              What's on your mind?
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
            <DialogHeader className="p-4 border-b border-border/50">
              <DialogTitle className="text-center">Create Post</DialogTitle>
            </DialogHeader>
            
            <div className="p-4 space-y-4">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>ME</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <span className="font-semibold text-sm block">John Doe</span>
                  <span className="text-xs text-muted-foreground">Public</span>
                </div>
              </div>

              <Textarea
                placeholder="What's on your mind?"
                className="min-h-[150px] border-none resize-none focus-visible:ring-0 p-0 text-base"
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
              />

              {media && (
                <div className="relative rounded-xl overflow-hidden border border-border/50 bg-black/5">
                  <button
                    onClick={() => setMedia(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {media.type === 'image' ? (
                    <img src={media.preview} alt="Preview" className="w-full max-h-[400px] object-contain" />
                  ) : (
                    <video src={media.preview} controls className="w-full max-h-[400px]" />
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Photo/Video
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground">
                  {content.length}/{MAX_CHARS}
                </span>
              </div>
            </div>

            <DialogFooter className="p-4 border-t border-border/50">
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={(!content.trim() && !media) || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Post
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
