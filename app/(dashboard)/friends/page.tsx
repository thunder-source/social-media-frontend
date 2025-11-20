import FriendsList from "@/components/friends/FriendsList";

export default function FriendsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Friends</h1>
      <FriendsList />
    </div>
  );
}
