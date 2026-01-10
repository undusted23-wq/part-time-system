import api from './api';

interface MessageUser {
  id?: number;
  username?: string;
  fullName?: string;
  email?: string;
}

interface MessageJob {
  id?: number;
  title?: string;
}

interface MessageApplication {
  id?: number;
}

interface Message {
  id?: number;
  subject: string;
  content: string;
  createdAt?: string;
  read?: boolean;
  sender?: MessageUser;
  receiver?: MessageUser;
  relatedJob?: MessageJob;
  relatedApplication?: MessageApplication;
}

interface MessageResponse {
  received: Message[];
  sent: Message[];
}

interface MessageRequest {
  subject: string;
  content: string;
  receiverId: number;
  relatedJobId?: number;
  relatedApplicationId?: number;
}

interface MessageUpdateRequest {
  subject: string;
  content: string;
  relatedJobId?: number | null;
  relatedApplicationId?: number | null;
}

const messageService = {
  // 获取当前用户的所有消息
  getMyMessages: async () => {
    const response = await api.get<MessageResponse>('/api/messages');
    return response.data;
  },
  
  // 获取当前用户的未读消息
  getUnreadMessages: async () => {
    const response = await api.get<Message[]>('/api/messages/unread');
    return response.data;
  },
  
  // 获取当前用户未读消息数量
  getUnreadCount: async () => {
    const response = await api.get<{ count: number }>('/api/messages/unread/count');
    return response.data.count;
  },
  
  // 获取指定消息
  getMessageById: async (id: number) => {
    const response = await api.get<Message>(`/api/messages/${id}`);
    return response.data;
  },
  
  // 获取与指定用户的对话
  getConversation: async (userId: number) => {
    const response = await api.get<Message[]>(`/api/messages/conversation/${userId}`);
    return response.data;
  },
  
  // 发送新消息
  sendMessage: async (messageData: MessageRequest) => {
    const response = await api.post<Message>('/api/messages', messageData);
    return response.data;
  },
  
  // 标记消息为已读
  markAsRead: async (id: number) => {
    const response = await api.put<Message>(`/api/messages/${id}/read`);
    return response.data;
  },

  // 更新消息内容
  updateMessage: async (id: number, payload: MessageUpdateRequest) => {
    const response = await api.put<Message>(`/api/messages/${id}`, payload);
    return response.data;
  },

  // 管理员：获取全部消息
  getAllMessagesForAdmin: async () => {
    const response = await api.get<Message[]>('/api/messages/admin');
    return response.data;
  },
  
  // 删除消息
  deleteMessage: async (id: number) => {
    return api.delete(`/api/messages/${id}`);
  }
};

export default messageService;
export type { Message, MessageResponse, MessageRequest, MessageUpdateRequest };
