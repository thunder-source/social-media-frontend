import { apiSlice } from './apiSlice';
import { Chat, Message } from '@/types';

export const chatsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChats: builder.query<Chat[], void>({
      query: () => '/chats',
      transformResponse: (response: any[]) => {
        return response.map((chat) => ({
          id: chat.id || chat._id,
          participants: chat.participants.map((p: any) => ({
            id: p.id || p._id,
            name: p.name,
            email: p.email,
            image: p.image || p.photo,
            friendsCount: p.friendsCount,
          })),
          lastMessage: chat.lastMessage ? {
            id: chat.lastMessage.id || chat.lastMessage._id,
            chatId: chat.lastMessage.chatId,
            senderId: typeof chat.lastMessage.senderId === 'object' 
              ? (chat.lastMessage.senderId.id || chat.lastMessage.senderId._id) 
              : chat.lastMessage.senderId,
            content: chat.lastMessage.text || chat.lastMessage.content,
            createdAt: chat.lastMessage.createdAt,
            readBy: chat.lastMessage.readBy,
            sender: typeof chat.lastMessage.senderId === 'object' ? chat.lastMessage.senderId : undefined,
          } : undefined,
          unreadCount: chat.unreadCount || 0,
          updatedAt: chat.updatedAt,
        }));
      },
      providesTags: ['Chats'],
    }),
    createChat: builder.mutation<Chat, { partnerId: string }>({
      query: (body) => ({
        url: '/chats',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Chats'],
    }),
    getMessages: builder.query<Message[], string>({
      query: (chatId) => `/chats/${chatId}/messages`,
      transformResponse: (response: { messages: any[]; pagination: any }) => {
        return response.messages.map((msg) => ({
          id: msg.id || msg._id,
          chatId: msg.chatId,
          senderId: msg.senderId.id || msg.senderId._id,
          content: msg.text,
          createdAt: msg.createdAt,
          readBy: msg.readBy.map((u: any) => u.id || u._id),
          sender: msg.senderId,
        }));
      },
      providesTags: (result, error, chatId) => [{ type: 'Messages', id: chatId }],
    }),
    sendMessage: builder.mutation<Message, { chatId: string; text: string }>({
      query: ({ chatId, text }) => ({
        url: `/chats/${chatId}/messages`,
        method: 'POST',
        body: { text },
      }),
      transformResponse: (msg: any) => ({
        id: msg.id || msg._id,
        chatId: msg.chatId,
        senderId: typeof msg.senderId === 'object' ? (msg.senderId._id || msg.senderId.id) : msg.senderId,
        content: msg.text,
        createdAt: msg.createdAt,
        readBy: Array.isArray(msg.readBy) ? msg.readBy.map((u: any) => (typeof u === 'object' ? (u._id || u.id) : u)) : [],
        sender: typeof msg.senderId === 'object' ? msg.senderId : undefined,
      }),
      invalidatesTags: (result, error, { chatId }) => [
        { type: 'Messages', id: chatId },
        'Chats',
      ],
    }),
    markMessageAsRead: builder.mutation<void, string>({
      query: (messageId) => ({
        url: `/messages/${messageId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, messageId) => [
        { type: 'Messages', id: messageId }, // Ideally we invalidate the specific message or the list
        'Chats', // Update unread counts in chat list
      ],
      // Optimistic update could be added here but invalidation is safer for now
    }),
  }),
});

export const {
  useGetChatsQuery,
  useCreateChatMutation,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useSendMessageMutation,
  useMarkMessageAsReadMutation,
} = chatsApi;
