'use client';

import { useState, useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { toggleMuted, initializeAudioState } from '@/store/slices/uiSlice';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export default function VideoPlayer({
  src,
  poster,
  className,
  videoId,
  activeVideoId,
  onPlay
}: VideoPlayerProps & {
  videoId?: string;
  activeVideoId?: string | null;
  onPlay?: (id: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const dispatch = useDispatch();
  const isMuted = useSelector((state: RootState) => state.ui.isMuted);
  const [isLoading, setIsLoading] = useState(true);
  const { ref, inView } = useInView({
    threshold: 0.6, // Play when 60% visible
  });

  // Initialize audio state from localStorage on mount
  useEffect(() => {
    dispatch(initializeAudioState());
  }, [dispatch]);

  // Handle autoplay when in view
  useEffect(() => {
    if (inView) {
      // If we have coordination props, use them
      if (videoId && onPlay) {
        onPlay(videoId);
      }

      videoRef.current?.play().catch(() => {
        // Autoplay might be blocked
        setIsPlaying(false);
      });
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [inView, videoId, onPlay]);

  // Handle pausing when another video becomes active
  useEffect(() => {
    if (activeVideoId && videoId && activeVideoId !== videoId) {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [activeVideoId, videoId]);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        // If we're starting playback, notify parent
        if (videoId && onPlay) {
          onPlay(videoId);
        }
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleMuted());
  };

  const onPlayHandler = () => setIsPlaying(true);
  const onPauseHandler = () => setIsPlaying(false);
  const onWaiting = () => setIsLoading(true);
  const onPlaying = () => setIsLoading(false);

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden bg-black aspect-video group cursor-pointer", className)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
        onPlay={onPlayHandler}
        onPause={onPauseHandler}
        onWaiting={onWaiting}
        onPlaying={onPlaying}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}

      {/* Controls Overlay */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center transition-opacity duration-200 bg-black/20",
        isPlaying && !isLoading ? "opacity-0 group-hover:opacity-100" : "opacity-100"
      )}>
        {!isLoading && (
          <button
            className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
        )}
      </div>

      {/* Mute Button */}
      <button
        onClick={toggleMute}
        className="absolute bottom-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100 duration-200"
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
