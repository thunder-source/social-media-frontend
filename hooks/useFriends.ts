"use client";

import { useEffect, useCallback } from "react";
import { useSocket } from "@/components/providers/SocketProvider";
import { User, FriendRequest, FriendshipStatus } from "@/types";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { toast } from "sonner";
import {
  useGetFriendsQuery,
  useGetPendingRequestsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useUnfriendMutation,
} from "@/store/api/friendsApi";

export const useFriends = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { socket } = useSocket();

  // RTK Query hooks - only fetch data when user is authenticated
  const {
    data: friends = [],
    isLoading: isFriendsLoading,
    refetch: refetchFriends,
  } = useGetFriendsQuery(undefined, {
    skip: !user,
  });

  const {
    data: pendingRequests = [],
    isLoading: isRequestsLoading,
    refetch: refetchRequests,
  } = useGetPendingRequestsQuery(undefined, {
    skip: !user,
  });

  const [sendFriendRequestMutation] = useSendFriendRequestMutation();
  const [acceptFriendRequestMutation] = useAcceptFriendRequestMutation();
  const [rejectFriendRequestMutation] = useRejectFriendRequestMutation();
  const [unfriendMutation] = useUnfriendMutation();

  const isLoading = isFriendsLoading || isRequestsLoading;

  const sendFriendRequest = async (
    toUserId: string,
    triggeredFromPostId?: string
  ) => {
    try {
      await sendFriendRequestMutation({
        toUserId,
        triggeredFromPostId,
      }).unwrap();
      toast.success("Friend request sent!");
    } catch (error: any) {
      console.error("Failed to send friend request:", error);
      toast.error(error?.data?.message || "Failed to send friend request");
      throw error;
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      await acceptFriendRequestMutation(requestId).unwrap();
      // toast.success('Friend request accepted!');
    } catch (error: any) {
      console.error("Failed to accept friend request:", error);
      toast.error(error?.data?.message || "Failed to accept friend request");
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      await rejectFriendRequestMutation(requestId).unwrap();
      // toast.success('Friend request rejected');
    } catch (error: any) {
      console.error("Failed to reject friend request:", error);
      toast.error(error?.data?.message || "Failed to reject friend request");
    }
  };

  const unfriend = async (friendId: string) => {
    try {
      await unfriendMutation(friendId).unwrap();
      toast.success("Unfriended user");
    } catch (error: any) {
      console.error("Failed to unfriend:", error);
      toast.error(error?.data?.message || "Failed to unfriend");
    }
  };

  const checkFriendshipStatus = useCallback(
    (userId: string): FriendshipStatus => {
      // Ensure friends is always treated as an array
      if (Array.isArray(friends) && friends.some((f) => f.id === userId))
        return "FRIENDS";
      // This is tricky because pendingRequests usually contains requests RECEIVED
      // We might need to know if we SENT a request too.
      // For now, we'll assume we only check incoming requests or if the API provides status
      // If we need to know if we SENT a request, we need another state or API check.
      // For this MVP, let's assume we only check "FRIENDS" or "NONE" locally,
      // and "PENDING" might need a specific check or we fetch "sent requests" too.

      // However, the requirement says "Pending Requests" tab, which usually implies received.
      // But for PostCard, we need to know if I sent a request.
      // Let's assume the API /api/friends/status/:userId could exist, or we fetch sent requests.
      // For now, returning 'NONE' if not friend.
      return "NONE";
    },
    [friends]
  );

  // Socket event handlers for real-time updates
  useEffect(() => {
    if (!socket) return;

    socket.on("friend:request:received", (newRequest: FriendRequest) => {
      // Refetch pending requests to update the list
      refetchRequests();
      // toast.info(`New friend request from ${newRequest.sender.name}`);
    });

    socket.on("friend:request:accepted", (data: { user: User }) => {
      // Refetch friends list to include the new friend
      refetchFriends();
      // toast.success(`${data.user.name} accepted your friend request!`);
    });

    socket.on("friend:removed", (data: { userId: string }) => {
      // Refetch friends list to remove the unfriended user
      refetchFriends();
    });

    return () => {
      socket.off("friend:request:received");
      socket.off("friend:request:accepted");
      socket.off("friend:removed");
    };
  }, [socket, refetchFriends, refetchRequests]);

  return {
    friends,
    pendingRequests,
    isLoading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    unfriend,
    checkFriendshipStatus,
  };
};
