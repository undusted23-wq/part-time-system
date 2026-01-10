package com.example.backend.service;

import com.example.backend.model.Message;
import com.example.backend.model.User;

import java.util.List;
import java.util.Optional;

public interface MessageService {
    List<Message> getAllMessages();
    Optional<Message> getMessageById(Long id);
    List<Message> getMessagesBySender(User sender);
    List<Message> getMessagesByReceiver(User receiver);
    List<Message> getUnreadMessages(User receiver);
    long getUnreadMessageCount(User receiver);
    List<Message> getConversation(User user1, User user2);
    Message sendMessage(Message message);
    Message updateMessage(Message message);
    Message markAsRead(Long messageId);
    void deleteMessage(Long id);
}
