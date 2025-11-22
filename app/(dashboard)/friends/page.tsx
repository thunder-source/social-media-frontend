'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FriendsList from '@/components/friends/FriendsList';
import FriendRequestCard from '@/components/friends/FriendRequestCard';
import { useFriends } from '@/hooks/useFriends';
import { Loader2 } from 'lucide-react';

export default function FriendsPage() {
  const {
    friends,
    pendingRequests,
    isLoading,
    acceptFriendRequest,
    rejectFriendRequest,
    unfriend
  } = useFriends();

  // Safely handle arrays with defaults
  const safeFriends = Array.isArray(friends) ? friends : [];
  const safePendingRequests = Array.isArray(pendingRequests) ? pendingRequests : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl space-y-8 p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Friends</h1>
        <p className="text-muted-foreground">
          Manage your friendships and connection requests.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="all">All Friends ({safeFriends.length})</TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {safePendingRequests.length > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {safePendingRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <FriendsList friends={safeFriends} onUnfriend={unfriend} />
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          {safePendingRequests.length === 0 ? (
            <div className="text-center py-12 border rounded-lg border-dashed">
              <p className="text-muted-foreground">No pending friend requests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safePendingRequests.map((request) => (
                <FriendRequestCard
                  key={request.id}
                  request={request}
                  onAccept={acceptFriendRequest}
                  onReject={rejectFriendRequest}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
