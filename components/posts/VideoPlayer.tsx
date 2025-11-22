'use client';

import { useState, useRef, useEffect } from 'react';
import { useVideoPlayback } from '@/components/providers/VideoPlaybackProvider';
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
}: VideoPlayerProps & {
  videoId?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const dispatch = useDispatch();
  const isMuted = useSelector((state: RootState) => state.ui.isMuted);
  const [isLoading, setIsLoading] = useState(true);

  // Use global video context
  const { registerVideo, unregisterVideo, activeVideoId, manualPause, manualPlay } = useVideoPlayback();

  // Generate a unique ID if none provided
  const idRef = useRef(videoId || Math.random().toString(36).substr(2, 9));
  const id = idRef.current;

  // Track if video was auto-paused due to tab visibility change
  const wasAutoPausedRef = useRef(false);

  // Initialize audio state from localStorage on mount
  useEffect(() => {
    dispatch(initializeAudioState());
  }, [dispatch]);

  // Register with context
  useEffect(() => {
    if (containerRef.current) {
      registerVideo(id, containerRef.current);
    }
    return () => {
      unregisterVideo(id);
    };
  }, [id, registerVideo, unregisterVideo]);

  // React to active video changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (activeVideoId === id) {
      // We are the chosen one!
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error("Autoplay prevented:", error);
            setIsPlaying(false);
          });
      }
    } else {
      // We are not the chosen one
      if (!video.paused) {
        video.pause();
        setIsPlaying(false);
      }
    }
  }, [activeVideoId, id]);

  // Handle pausing/resuming when tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden - pause video if it's playing
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
          wasAutoPausedRef.current = true; // Mark as auto-paused
        }
      } else {
        // Tab is visible again - resume video if it was auto-paused AND we are still the active video
        if (wasAutoPausedRef.current && videoRef.current && activeVideoId === id) {
          videoRef.current.play().catch(() => {
            setIsPlaying(false);
          });
          setIsPlaying(true);
          wasAutoPausedRef.current = false; // Reset flag
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeVideoId, id]);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        manualPause(id);
        wasAutoPausedRef.current = false;
      } else {
        manualPlay(id);
        videoRef.current.play();
        wasAutoPausedRef.current = false;
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
      ref={containerRef}
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
