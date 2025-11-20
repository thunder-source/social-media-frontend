import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FriendsList() {
  const friends = [
    { name: "Alice Wonderland", status: "Online" },
    { name: "Bob Builder", status: "Offline" },
    { name: "Charlie Chaplin", status: "Online" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Friends</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        {friends.map((friend, index) => (
          <div key={index} className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>{friend.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{friend.name}</p>
                <p className="text-sm text-muted-foreground">{friend.status}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Message</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
