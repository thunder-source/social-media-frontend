'use client';

import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Image as ImageIcon, Video, X, Loader2, Send, PenSquare } from 'lucide-react';
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
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';

export default function CreatePost() {
  const { createNewPost } = usePosts();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [media, setMedia] = useState<{ file: File; preview: string; type: 'image' | 'video' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fabPosition, setFabPosition] = useState<'left' | 'right'>('right');
  const { user, isLoading: isAuthLoaing } = useAuth();

  // Intersection Observer to track visibility
  const { ref: createPostRef, inView } = useInView({
    threshold: 0,
    rootMargin: '-80px 0px 0px 0px', // Trigger when 80px from top
  });

  const MAX_CHARS = 2200;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const type = file.type.startsWith('video/') ? 'video' : 'image';
    const preview = URL.createObjectURL(file);
    setMedia({ file, preview, type });
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      // In a real app, upload media first then get URL
      const attachments = media ? {
        id: `att-${Date.now()}`,
        type: media.type,
        url: media.preview, // Using preview URL for demo
      } : null;

      await createNewPost(content, media?.type || 'null', media?.file);

      setIsOpen(false);
      setContent('');
      setMedia(null);
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle drag end to snap to nearest corner
  const handleDragEnd = (event: any, info: any) => {
    const windowWidth = window.innerWidth;
    const threshold = windowWidth / 2;

    // Check if dragged position is closer to left or right
    if (info.point.x < threshold) {
      setFabPosition('left');
    } else {
      setFabPosition('right');
    }
  };

  // Handle modal close without scrolling
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Don't reset content/media on close, only on successful post
  };

  return (
    <>
      <div ref={createPostRef} className="w-full mb-8 bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50 shadow-sm">
        <div className="flex gap-4 items-center">
          <Avatar>
            <AvatarImage src={user?.photo} />
            <AvatarFallback>{user?.name?.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <Dialog open={isOpen} onOpenChange={handleOpenChange} modal={true}>
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
                    <AvatarImage src={user?.photo} />
                    <AvatarFallback>{user?.name?.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <span className="font-semibold text-sm block">{user?.name}</span>
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
                  disabled={!content.trim() || isLoading}
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

      {/* Draggable Floating Action Button */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {!inView && (
            <motion.div
              drag
              dragConstraints={{
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}
              dragElastic={1}
              dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
              onDragEnd={handleDragEnd}
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
                x: fabPosition === 'right' ? 0 : 0,
                left: fabPosition === 'left' ? '1.5rem' : 'auto',
                right: fabPosition === 'right' ? '1.5rem' : 'auto',
              }}
              exit={{ scale: 0, opacity: 0, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className="fixed bottom-6 z-50 cursor-grab active:cursor-grabbing select-none"
              style={{
                touchAction: 'none',
              }}
            >
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(true);
                }}
                size="lg"
                className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 group pointer-events-auto"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PenSquare className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </motion.div>
                <span className="sr-only">Create Post</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
