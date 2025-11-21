"use client";

import { Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import PostCard from "./PostCard";
import { Post } from "@/types";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import SectionErrorBoundary from "@/components/providers/SectionErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { FileImage } from "lucide-react";

interface PostListProps {
    posts: Post[];
    loading: boolean;
    hasMore: boolean;
    loadMore: () => void;
    onLike: (postId: string) => void;
    onComment: (postId: string, text: string) => Promise<void>;
    onUpdate: (postId: string, text: string, media?: 'image' | 'video' | 'null') => Promise<void>;
    onDelete: (postId: string) => Promise<void>;
    activeVideoId: string | null;
    onPlayVideo: (id: string) => void;
    error?: string;
    onRetry?: () => void;
}

export default function PostList({
    posts,
    loading,
    hasMore,
    loadMore,
    onLike,
    onComment,
    onUpdate,
    onDelete,
    activeVideoId,
    onPlayVideo,
    error,
    onRetry,
}: PostListProps) {
    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasMore && !loading) {
            loadMore();
        }
    }, [inView, hasMore, loading, loadMore]);

    if (error && posts.length === 0) {
        return (
            <ErrorState
                title="Failed to load posts"
                message={error}
                onRetry={onRetry}
            />
        );
    }

    if (!loading && posts.length === 0) {
        return (
            <EmptyState
                icon={FileImage}
                title="No posts yet"
                description="Be the first to share something with your friends!"
            />
        );
    }

    return (
        <div className="space-y-6">
            {posts.map((post) => (
                <SectionErrorBoundary
                    key={post.id}
                    fallbackMessage="Failed to load this post"
                >
                    <PostCard
                        post={post}
                        onLike={onLike}
                        onComment={onComment}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        activeVideoId={activeVideoId}
                        onPlayVideo={onPlayVideo}
                    />
                </SectionErrorBoundary>
            ))}

            <div ref={ref} className="flex flex-col items-center justify-center py-8 gap-4">
                {loading && (
                    <div className="w-full space-y-6">
                        {[1, 2].map((i) => (
                            <div key={i} className="space-y-4 p-4 border rounded-lg bg-card/50">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-[200px]" />
                                        <Skeleton className="h-4 w-[150px]" />
                                    </div>
                                </div>
                                <Skeleton className="h-[200px] w-full rounded-lg" />
                                <div className="flex gap-4">
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!hasMore && posts.length > 0 && (
                    <p className="text-muted-foreground text-sm">No more posts to load</p>
                )}
            </div>
        </div>
    );
}
