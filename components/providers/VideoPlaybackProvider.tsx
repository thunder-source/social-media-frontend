'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

interface VideoEntry {
    id: string;
    element: HTMLElement;
    ratio: number;
}

interface VideoPlaybackContextType {
    registerVideo: (id: string, element: HTMLElement) => void;
    unregisterVideo: (id: string) => void;
    activeVideoId: string | null;
    manualPause: (id: string) => void;
    manualPlay: (id: string) => void;
}

const VideoPlaybackContext = createContext<VideoPlaybackContextType | undefined>(undefined);

export function VideoPlaybackProvider({ children }: { children: React.ReactNode }) {
    const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
    const videosRef = useRef<Map<string, HTMLElement>>(new Map());
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Track user intent - if user manually paused a video, don't auto-play it again until it goes out of view and comes back
    const userPausedVideosRef = useRef<Set<string>>(new Set());

    // Track which video the user manually played, to override auto-selection
    const userPlayedVideoIdRef = useRef<string | null>(null);

    const calculateActiveVideo = useCallback(() => {
        // If user manually played a video and it's still valid (in view), keep it active
        // But for now, let's stick to the "most visible" rule unless strictly overridden.
        // Actually, Instagram logic: if you scroll, the most visible one takes over. 
        // If you click play, that one plays. If you scroll away, it pauses and new one plays.

        let maxRatio = 0;
        let bestVideoId: string | null = null;

        // We need to check current intersection ratios. 
        // Since IntersectionObserver callback gives us entries, we can store the latest ratios there.
        // But standard IO callback only fires on change. 
        // So we'll maintain a map of current ratios.
    }, []);

    // We need a way to store ratios.
    const ratiosRef = useRef<Map<string, number>>(new Map());

    const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('data-video-id');
            if (id) {
                ratiosRef.current.set(id, entry.intersectionRatio);

                // If a video goes completely out of view, reset its "user paused" state
                if (entry.intersectionRatio === 0) {
                    userPausedVideosRef.current.delete(id);
                    if (userPlayedVideoIdRef.current === id) {
                        userPlayedVideoIdRef.current = null;
                    }
                }
            }
        });

        // Find the best video
        let maxRatio = 0;
        let bestVideoId: string | null = null;

        ratiosRef.current.forEach((ratio, id) => {
            // Must be at least 50% visible
            if (ratio > 0.5) {
                if (ratio > maxRatio) {
                    maxRatio = ratio;
                    bestVideoId = id;
                }
            }
        });

        // If there's a user-played video that is still visible (even if not MOST visible, but let's say > 0.5), 
        // we might want to prefer it? 
        // Standard behavior: The most visible one wins. 
        // Exception: If I just clicked play on one, I expect it to keep playing until I scroll it away.
        // So:
        if (userPlayedVideoIdRef.current) {
            const userPlayedRatio = ratiosRef.current.get(userPlayedVideoIdRef.current) || 0;
            if (userPlayedRatio > 0.5) {
                bestVideoId = userPlayedVideoIdRef.current;
            } else {
                // It scrolled away, so release the lock
                userPlayedVideoIdRef.current = null;
            }
        }

        // If the best video was manually paused by user, don't auto-play it
        if (bestVideoId && userPausedVideosRef.current.has(bestVideoId)) {
            // If the best candidate is paused by user, do we play the second best? 
            // Usually no, silence is golden.
            bestVideoId = null;
        }

        setActiveVideoId(bestVideoId);
    }, []);

    useEffect(() => {
        observerRef.current = new IntersectionObserver(handleIntersection, {
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
            rootMargin: '0px'
        });

        return () => {
            observerRef.current?.disconnect();
        };
    }, [handleIntersection]);

    const registerVideo = useCallback((id: string, element: HTMLElement) => {
        videosRef.current.set(id, element);
        element.setAttribute('data-video-id', id);
        observerRef.current?.observe(element);
    }, []);

    const unregisterVideo = useCallback((id: string) => {
        const element = videosRef.current.get(id);
        if (element) {
            observerRef.current?.unobserve(element);
            videosRef.current.delete(id);
            ratiosRef.current.delete(id);
        }
        if (activeVideoId === id) {
            setActiveVideoId(null);
        }
    }, [activeVideoId]);

    const manualPause = useCallback((id: string) => {
        userPausedVideosRef.current.add(id);
        if (activeVideoId === id) {
            setActiveVideoId(null);
        }
        if (userPlayedVideoIdRef.current === id) {
            userPlayedVideoIdRef.current = null;
        }
    }, [activeVideoId]);

    const manualPlay = useCallback((id: string) => {
        userPausedVideosRef.current.delete(id);
        userPlayedVideoIdRef.current = id;
        setActiveVideoId(id);
    }, []);

    // Handle tab visibility
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // When tab is hidden, we don't clear activeVideoId immediately in state 
                // because we want it to resume when tab comes back.
                // But the VideoPlayer component handles the actual HTML5 video pause.
                // However, if we want to be strict, we could set a temporary "global pause" state.
                // For now, let's rely on the individual players checking document.hidden or 
                // the fact that browsers auto-pause background videos often.
                // But to be safe/correct:
                // We can just let the players handle it via their own effect, 
                // OR we can clear activeVideoId here. 
                // If we clear it, we lose state of what was playing.
                // Let's NOT clear it here, but rely on the players to pause themselves.
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    return (
        <VideoPlaybackContext.Provider value={{
            registerVideo,
            unregisterVideo,
            activeVideoId,
            manualPause,
            manualPlay
        }}>
            {children}
        </VideoPlaybackContext.Provider>
    );
}

export function useVideoPlayback() {
    const context = useContext(VideoPlaybackContext);
    if (!context) {
        throw new Error('useVideoPlayback must be used within a VideoPlaybackProvider');
    }
    return context;
}
