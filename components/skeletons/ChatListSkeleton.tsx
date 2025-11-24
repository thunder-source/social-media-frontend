import { Skeleton } from "@/components/ui/skeleton";

export function ChatListSkeleton() {
    return (
        <div className="p-2 space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="w-full p-3 rounded-lg flex items-center gap-3"
                >
                    {/* Avatar Skeleton */}
                    <Skeleton className="h-12 w-12 rounded-full shrink-0" />

                    {/* Chat Info Skeleton */}
                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-12" />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-5 w-5 rounded-full" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
