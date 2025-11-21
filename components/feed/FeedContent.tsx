'use client';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import CreatePost from '@/components/posts/CreatePost';
import PostCard from '@/components/posts/PostCard';
import { usePosts } from '@/hooks/usePosts';

export default function FeedContent() {
    const { posts, loading, hasMore, loadMore } = usePosts();
    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasMore && !loading) {
            loadMore();
        }
    }, [inView, hasMore, loading, loadMore]);

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <CreatePost />

            <div className="space-y-6">
                {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>

            {/* Loading Sentinel */}
            <div ref={ref} className="flex justify-center py-8">
                {loading && <Loader2 className="w-8 h-8 animate-spin text-primary" />}
                {!hasMore && posts.length > 0 && (
                    <p className="text-muted-foreground text-sm">No more posts to load</p>
                )}
            </div>
        </div>
    );
}
