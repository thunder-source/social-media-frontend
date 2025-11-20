import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";

export default function ChatWindow() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-lg border bg-background shadow-sm">
      <div className="flex items-center border-b p-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/placeholder-user.jpg" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="ml-4">
          <p className="text-sm font-medium leading-none">John Doe</p>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="rounded-lg bg-muted p-3 text-sm">
              Hey, how are you doing?
            </div>
          </div>
          <div className="flex items-end justify-end gap-2">
            <div className="rounded-lg bg-primary p-3 text-sm text-primary-foreground">
              I'm doing great! Thanks for asking.
            </div>
            <Avatar className="h-8 w-8">
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
          </div>
           <div className="flex items-end gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="rounded-lg bg-muted p-3 text-sm">
              That's good to hear.
            </div>
          </div>
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <form className="flex gap-4">
          <Input placeholder="Type a message..." className="flex-1" />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
