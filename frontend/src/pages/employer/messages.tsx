import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SendIcon, PaperclipIcon, SearchIcon } from "lucide-react";
import messageService, { Message } from "@/services/messageService";
import authService from "@/services/authService";
import { toast } from "sonner";

interface Conversation {
  userId: number;
  name: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  jobTitle?: string;
}

export default function Messages() {
  const currentUser = authService.getCurrentUser();
  const currentUserId = currentUser?.id as number | undefined;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedContact, setSelectedContact] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const formatTime = (dateString?: string) => {
    if (!dateString) {
      return "";
    }
    return new Date(dateString).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  };

  const loadConversations = async () => {
    if (!currentUserId) {
      return;
    }
    setLoadingConversations(true);
    try {
      const data = await messageService.getMyMessages();
      const allMessages = [...(data.received || []), ...(data.sent || [])];
      const sorted = allMessages.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      const map = new Map<number, Conversation>();
      sorted.forEach((message) => {
        const senderId = message.sender?.id;
        const receiverId = message.receiver?.id;
        if (!senderId || !receiverId) {
          return;
        }
        const otherUser = senderId === currentUserId ? message.receiver : message.sender;
        const otherId = otherUser?.id;
        if (!otherId) {
          return;
        }
        const existing = map.get(otherId);
        const unreadCount = !message.read && receiverId === currentUserId ? 1 : 0;

        if (!existing) {
          map.set(otherId, {
            userId: otherId,
            name: otherUser?.fullName || otherUser?.username || "未知用户",
            unreadCount,
            lastMessage: message.content,
            lastMessageTime: formatTime(message.createdAt),
            jobTitle: message.relatedJob?.title
          });
        } else {
          existing.unreadCount += unreadCount;
        }
      });

      const list = Array.from(map.values());
      setConversations(list);
      if (list.length > 0 && !selectedContact) {
        setSelectedContact(list[0].userId);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadConversation = async (userId: number) => {
    setLoadingMessages(true);
    try {
      const data = await messageService.getConversation(userId);
      const list = Array.isArray(data) ? data : [];
      setMessages(list);
      if (currentUserId) {
        const unreadIds = list
          .filter((msg) => !msg.read && msg.receiver?.id === currentUserId)
          .map((msg) => msg.id)
          .filter(Boolean) as number[];
        if (unreadIds.length > 0) {
          await Promise.all(unreadIds.map((id) => messageService.markAsRead(id)));
          await loadConversations();
        }
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      loadConversation(selectedContact);
    }
  }, [selectedContact]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations;
    }
    return conversations.filter((conversation) =>
      conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const selectedConversation = conversations.find(
    (conversation) => conversation.userId === selectedContact
  );

  const handleSend = async () => {
    if (!selectedContact || !messageText.trim()) {
      return;
    }
    try {
      await messageService.sendMessage({
        receiverId: selectedContact,
        subject: "消息",
        content: messageText.trim()
      });
      setMessageText("");
      await loadConversation(selectedContact);
      await loadConversations();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("发送失败，请稍后再试。");
    }
  };

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">消息</h1>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
        <Card className="md:h-[600px] overflow-hidden">
          <div className="p-4 border-b">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索申请人..."
                className="pl-9"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </div>
          <div className="overflow-auto h-[calc(100%-60px)]">
            {loadingConversations && (
              <div className="p-4 text-sm text-muted-foreground">正在加载对话...</div>
            )}
            {!loadingConversations && filteredConversations.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground">暂无对话</div>
            )}
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.userId}
                className={`flex items-center gap-3 p-3 cursor-pointer border-b ${
                  selectedContact === conversation.userId
                    ? "bg-muted"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedContact(conversation.userId)}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-700 font-medium">
                      {conversation.name.charAt(0)}
                    </span>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="font-medium truncate">{conversation.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {conversation.lastMessageTime}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.jobTitle ? `${conversation.jobTitle} · ` : ""}
                    {conversation.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="md:h-[600px] flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-700 font-medium">
                    {selectedConversation.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{selectedConversation.name}</p>
                  <p className="text-xs text-blue-600">
                    {selectedConversation.jobTitle || "对话中"}
                  </p>
                </div>
              </div>
              <CardContent className="flex-1 overflow-auto p-4 flex flex-col gap-3">
                {loadingMessages && (
                  <div className="text-sm text-muted-foreground">正在加载消息...</div>
                )}
                {!loadingMessages && messages.length === 0 && (
                  <div className="text-sm text-muted-foreground">暂无消息记录</div>
                )}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender?.id === currentUserId ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender?.id === currentUserId
                          ? "bg-blue-600 text-white"
                          : "bg-muted"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender?.id === currentUserId
                            ? "text-blue-100"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <div className="p-4 border-t flex gap-2">
                <Button variant="outline" size="icon">
                  <PaperclipIcon className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="输入消息..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleSend()}
                />
                <Button className="gap-1" onClick={handleSend}>
                  <SendIcon className="h-4 w-4" />
                  发送
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col p-4">
              <p className="text-muted-foreground">选择一个对话开始聊天</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
