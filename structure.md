frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── feed/
│   │   │   └── page.tsx
│   │   ├── chat/
│   │   │   └── page.tsx
│   │   ├── friends/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   │   └── GoogleLoginButton.tsx
│   ├── posts/
│   │   ├── PostCard.tsx
│   │   ├── CreatePost.tsx
│   │   ├── VideoPlayer.tsx
│   │   └── PostActions.tsx
│   ├── chat/
│   │   ├── ChatWindow.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   └── TypingIndicator.tsx
│   ├── friends/
│   │   ├── FriendRequestCard.tsx
│   │   ├── FriendsList.tsx
│   │   └── OnlineStatus.tsx
│   ├── notifications/
│   │   ├── NotificationBell.tsx
│   │   └── NotificationItem.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── Avatar.tsx
├── lib/
│   ├── axios.ts
│   ├── socket.ts
│   ├── firebase.ts
│   └── utils.ts
├── hooks/
│   ├── useSocket.ts
│   ├── usePosts.ts
│   ├── useChat.ts
│   └── useAuth.ts
├── store/
│   ├── authStore.ts
│   ├── chatStore.ts
│   └── notificationStore.ts
├── types/
│   └── index.ts
└── public/
