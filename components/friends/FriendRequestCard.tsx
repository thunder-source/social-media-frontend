'use client';

import { FriendRequest } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Check, X, UserPlus } from 'lucide-react';

interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export default function FriendRequestCard({ request, onAccept, onReject }: FriendRequestCardProps) {
  return (
    <Card className="w-full overflow-hidden border-none shadow-sm bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
      <CardContent className="p-4 flex items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-background">
          <AvatarImage src={request.sender.image} alt={request.sender.name} />
          <AvatarFallback>{request.sender.name[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-sm truncate">{request.sender.name}</h4>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <UserPlus className="h-3 w-3" />
            wants to connect with you
          </p>
          {request.triggeredFromPostId && (
            <p className="text-[10px] text-muted-foreground mt-1 italic">
              via a post you shared
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
            onClick={() => onReject(request.id)}
            title="Reject"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            className="h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onAccept(request.id)}
            title="Accept"
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
