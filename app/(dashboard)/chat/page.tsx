import ChatWindow from "@/components/chat/ChatWindow";

export default function ChatPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Messages</h1>
      <ChatWindow />
    </div>
  );
}
