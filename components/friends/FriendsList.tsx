'use client';

import { useState } from 'react';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, UserMinus, Search, MoreVertical } from 'lucide-react';
import { OnlineStatus } from './OnlineStatus';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface FriendsListProps {
  friends: User[];
  onUnfriend: (id: string) => void;
}

export default function FriendsList({ friends, onUnfriend }: FriendsListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-background/50"
        />
      </div>

      {filteredFriends.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery ? 'No friends found matching your search.' : 'No friends yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFriends.map((friend) => (
            <Card key={friend.id} className="overflow-hidden border-none shadow-sm bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={friend.image} alt={friend.name} />
                  <AvatarFallback>{friend.name[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{friend.name}</h4>
                  <OnlineStatus userId={friend.id} />
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    title="Message"
                  >
                    <Link href={`/chat?userId=${friend.id}`}>
                      <MessageCircle className="h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => onUnfriend(friend.id)}
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Unfriend
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
