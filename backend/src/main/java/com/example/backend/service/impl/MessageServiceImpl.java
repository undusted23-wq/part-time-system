package com.example.backend.service.impl;

import com.example.backend.model.Message;
import com.example.backend.model.User;
import com.example.backend.repository.MessageRepository;
import com.example.backend.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MessageServiceImpl implements MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Override
    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    @Override
    public Optional<Message> getMessageById(Long id) {
        return messageRepository.findById(id);
    }

    @Override
    public List<Message> getMessagesBySender(User sender) {
        return messageRepository.findBySenderOrderByCreatedAtDesc(sender);
    }

    @Override
    public List<Message> getMessagesByReceiver(User receiver) {
        return messageRepository.findByReceiverOrderByCreatedAtDesc(receiver);
    }

    @Override
    public List<Message> getUnreadMessages(User receiver) {
        return messageRepository.findByReceiverAndIsReadFalseOrderByCreatedAtDesc(receiver);
    }

    @Override
    public long getUnreadMessageCount(User receiver) {
        return messageRepository.countByReceiverAndIsReadFalse(receiver);
    }

    @Override
    public List<Message> getConversation(User user1, User user2) {
        return messageRepository.findBySenderAndReceiverOrReceiverAndSenderOrderByCreatedAtDesc(
                user1, user2, user1, user2);
    }

    @Override
    public Message sendMessage(Message message) {
        // Ensure creation timestamp is set
        if (message.getCreatedAt() == null) {
            message.setCreatedAt(LocalDateTime.now());
        }
        
        // New messages are always unread
        message.setRead(false);
        
        return messageRepository.save(message);
    }

    @Override
    public Message updateMessage(Message message) {
        return messageRepository.save(message);
    }

    @Override
    public Message markAsRead(Long messageId) {
        Optional<Message> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isPresent()) {
            Message message = messageOpt.get();
            message.setRead(true);
            return messageRepository.save(message);
        }
        return null;
    }

    @Override
    public void deleteMessage(Long id) {
        messageRepository.deleteById(id);
    }
}
