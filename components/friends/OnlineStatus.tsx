"use client";

import { useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";

interface OnlineStatusProps {
  userId: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const OnlineStatus = ({ 
  userId, 
  showLabel = true, 
  size = 'md' 
}: OnlineStatusProps) => {
  const onlineUsers = useAppSelector((state: RootState) => state.auth.onlineUsers);
  const isOnline = onlineUsers.includes(userId);

  // Size mapping for the indicator dot
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
  };

  const dotSize = sizeClasses[size];
  const textSize = textSizeClasses[size];

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative flex items-center justify-center">
        {/* Status indicator dot */}
        <div
          className={`${dotSize} rounded-full transition-all duration-300 ${
            isOnline
              ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
              : 'bg-gray-400 dark:bg-gray-600'
          }`}
          role="status"
          aria-label={isOnline ? "Online" : "Offline"}
        />
        
        {/* Pulse animation for online status */}
        {isOnline && (
          <div
            className={`${dotSize} absolute rounded-full bg-green-500 animate-ping opacity-75`}
          />
        )}
      </div>

      {/* Optional text label */}
      {showLabel && (
        <span className={`${textSize} text-muted-foreground`}>
          {isOnline ? "Online" : "Offline"}
        </span>
      )}
    </div>
  );
};
