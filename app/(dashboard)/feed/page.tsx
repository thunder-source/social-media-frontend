import CreatePost from "@/components/posts/CreatePost";
import PostCard from "@/components/posts/PostCard";

export default function FeedPage() {
  return (
    <div className="flex flex-col gap-6">
      <CreatePost />
      <div className="flex flex-col gap-4">
        <PostCard
          username="John Doe"
          content="This is a sample post content. It's a beautiful day!"
          timestamp="2 hours ago"
          likes={12}
          comments={4}
        />
        <PostCard
          username="Jane Smith"
          content="Just checking out this new social app. Looks cool!"
          timestamp="5 hours ago"
          likes={24}
          comments={8}
        />
        <PostCard
          username="Bob Johnson"
          content="Anyone up for a game tonight?"
          timestamp="1 day ago"
          likes={5}
          comments={1}
        />
      </div>
    </div>
  );
}
