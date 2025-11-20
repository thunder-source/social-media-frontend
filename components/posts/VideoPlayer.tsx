'use client';

import { useState, useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export default function VideoPlayer({ src, poster, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { ref,inView } = useInView({
    threshold: 0.6, // Play when 60% visible
  });

  useEffect(() => {
    if (inView) {
      videoRef.current?.play().catch(() => {
        // Autoplay might be blocked
        setIsPlaying(false);
      });
    } else {
      videoRef.current?.pause();
    }
  }, [inView]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const onPlay = () => setIsPlaying(true);
  const onPause = () => setIsPlaying(false);
  const onWaiting = () => setIsLoading(true);
  const onPlaying = () => setIsLoading(false);

  return (
    <div 
      ref={ref} 
      className={cn("relative overflow-hidden rounded-xl bg-black aspect-video group cursor-pointer", className)}
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
        onPlay={onPlay}
        onPause={onPause}
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
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
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
