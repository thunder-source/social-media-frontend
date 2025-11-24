'use client';

import { useEffect, useState, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import CreatePost from '@/components/posts/CreatePost';
import PostList from '@/components/posts/PostList';
import { usePosts } from '@/hooks/usePosts';
import { VideoPlaybackProvider } from '@/components/providers/VideoPlaybackProvider';

export default function FeedPage() {
  const { posts, loading, hasMore, loadMore, toggleLike, addComment, updatePost, deletePost, refreshPosts } = usePosts();

  // Pull to refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);



  const handleTouchStart = (e: React.TouchEvent) => {
    // Only start pull if at the top of the page
    if (window.scrollY === 0 && !isRefreshing) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;

    const touchY = e.touches[0].clientY;
    const distance = touchY - touchStartY.current;

    // Only allow pulling down
    if (distance > 0 && window.scrollY === 0) {
      // Apply resistance to the pull (diminishing returns)
      const resistedDistance = Math.min(distance * 0.5, 120);
      setPullDistance(resistedDistance);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;

    setIsPulling(false);

    // Trigger refresh if pulled far enough (80px threshold)
    if (pullDistance > 80 && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(80); // Lock at refresh position

      try {
        await refreshPosts();
        // Add a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Failed to refresh:', error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // Snap back if not pulled far enough
      setPullDistance(0);
    }
  };

  return (
    <div
      ref={containerRef}
      className="max-w-2xl w-full mx-auto py-8 px-4 relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-center items-center transition-all duration-200 ease-out"
        style={{
          transform: `translateY(${Math.max(pullDistance - 80, -80)}px)`,
          opacity: Math.min(pullDistance / 80, 1),
          height: '80px',
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <RefreshCw
            className={`w-6 h-6 text-primary ${isRefreshing || pullDistance > 80 ? 'animate-spin' : ''}`}
            style={{
              transform: `rotate(${pullDistance * 3}deg)`,
            }}
          />
          <span className="text-xs text-muted-foreground font-medium">
            {isRefreshing ? 'Refreshing...' : pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* Content with pull offset */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        <CreatePost />

        <VideoPlaybackProvider>
          <PostList
            posts={posts}
            loading={loading}
            hasMore={hasMore}
            loadMore={loadMore}
            onLike={toggleLike}
            onComment={addComment}
            onUpdate={updatePost}
            onDelete={deletePost}
          />
        </VideoPlaybackProvider>
      </div>
    </div>
  );
}
