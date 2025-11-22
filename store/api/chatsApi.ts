import { apiSlice } from './apiSlice';
import { Chat, Message } from '@/types';

export const chatsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChats: builder.query<Chat[], void>({
      query: () => '/chats',
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
  }),
});

export const {
  useGetChatsQuery,
  useCreateChatMutation,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useSendMessageMutation,
} = chatsApi;
