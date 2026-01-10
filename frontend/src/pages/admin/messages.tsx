import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  CheckIcon, 
  MessageSquareIcon, 
  SearchIcon, 
  TrashIcon 
} from "lucide-react";
import { useEffect, useState } from "react";
import messageService, { Message } from "@/services/messageService";

export default function MessageManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await messageService.getAllMessagesForAdmin();
        setMessages(data);
      } catch (error) {
        console.error("Failed to load messages:", error);
        setErrorMessage("加载留言列表失败，请稍后再试。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const isMessageRead = (message: Message) => Boolean(message.read);

  const getDisplayName = (user?: Message["sender"]) => {
    if (!user) {
      return "未知用户";
    }
    return user.fullName || user.username || "未知用户";
  };
  
  // 前端过滤，服务端已返回全量留言数据
  const filteredMessages = messages.filter(message => {
    const readStatus = isMessageRead(message) ? "read" : "unread";
    // 状态筛选
    if (statusFilter !== "all" && readStatus !== statusFilter) {
      return false;
    }
    
    // 搜索查询
    if (
      searchQuery &&
      !message.content.includes(searchQuery) &&
      !message.subject.includes(searchQuery) &&
      !getDisplayName(message.sender).includes(searchQuery) &&
      !getDisplayName(message.receiver).includes(searchQuery)
    ) {
      return false;
    }
    
    return true;
  });

  const handleMarkAsRead = async (message: Message) => {
    if (!message.id) {
      return;
    }
    try {
      const updated = await messageService.markAsRead(message.id);
      setMessages((prev) =>
        prev.map((item) => (item.id === message.id ? { ...message, ...updated } : item))
      );
    } catch (error) {
      console.error("Failed to mark message as read:", error);
      setErrorMessage("更新留言状态失败，请稍后再试。");
    }
  };

  const handleDeleteMessage = async (message: Message) => {
    if (!message.id) {
      return;
    }
    const confirmed = window.confirm("确认删除这条留言吗？");
    if (!confirmed) {
      return;
    }
    try {
      await messageService.deleteMessage(message.id);
      setMessages((prev) => prev.filter((item) => item.id !== message.id));
    } catch (error) {
      console.error("Failed to delete message:", error);
      setErrorMessage("删除留言失败，请稍后再试。");
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">留言板管理</h1>
      </div>
      
      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="搜索消息内容或用户..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="h-10 rounded-md border border-input bg-background px-3 py-1"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">所有状态</option>
          <option value="read">已读</option>
          <option value="unread">未读</option>
        </select>
      </div>
      
      <Card>
        <CardHeader className="p-4">
          <CardTitle>留言列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <Card key={message.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isMessageRead(message) ? "bg-green-100" : "bg-blue-100"
                          }`}>
                            <MessageSquareIcon className={`h-4 w-4 ${
                              isMessageRead(message) ? "text-green-600" : "text-blue-600"
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium flex items-center gap-1">
                              {getDisplayName(message.sender)} 
                              {!isMessageRead(message) && (
                                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {message.createdAt ? new Date(message.createdAt).toLocaleString() : "-"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isMessageRead(message) ? "bg-green-100 text-green-800" : 
                            "bg-blue-100 text-blue-800"
                          }`}>
                            {isMessageRead(message) ? "已读" : "未读"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm font-medium">{message.subject}</p>
                        <p className="text-sm mt-1">{message.content}</p>
                        {message.receiver && (
                          <p className="text-xs text-muted-foreground mt-1">
                            接收者: {getDisplayName(message.receiver)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex md:flex-col justify-end gap-2">
                      {!isMessageRead(message) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-green-600"
                          onClick={() => handleMarkAsRead(message)}
                        >
                          <CheckIcon className="h-4 w-4" />
                          标为已读
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-red-600"
                        onClick={() => handleDeleteMessage(message)}
                      >
                        <TrashIcon className="h-4 w-4" />
                        删除
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-center text-muted-foreground">正在加载留言列表...</p>
            </div>
          )}

          {errorMessage && (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-center text-red-500">{errorMessage}</p>
            </div>
          )}

          {!isLoading && !errorMessage && filteredMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-center text-muted-foreground">没有找到符合条件的留言</p>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              显示 {filteredMessages.length} 条记录，共 {messages.length} 条
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>上一页</Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">下一页</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">总留言数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-xs text-muted-foreground">当前系统消息总量</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">未读留言</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {messages.filter(m => !isMessageRead(m)).length}
            </div>
            <p className="text-xs text-muted-foreground">需要处理</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">近7天新增</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {messages.filter(m => {
                if (!m.createdAt) {
                  return false;
                }
                const createdAt = new Date(m.createdAt).getTime();
                const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                return createdAt >= sevenDaysAgo;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">最近一周新增</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">今日新增</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {messages.filter(m => {
                if (!m.createdAt) {
                  return false;
                }
                const createdAt = new Date(m.createdAt).getTime();
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return createdAt >= today.getTime();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">今日新增数量</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
