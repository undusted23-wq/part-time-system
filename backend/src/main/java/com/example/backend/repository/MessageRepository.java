package com.example.backend.repository;

import com.example.backend.model.Message;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySenderOrderByCreatedAtDesc(User sender);
    List<Message> findByReceiverOrderByCreatedAtDesc(User receiver);
    List<Message> findByReceiverAndIsReadFalseOrderByCreatedAtDesc(User receiver);
    long countByReceiverAndIsReadFalse(User receiver);
    
    // Get conversation between two users
    List<Message> findBySenderAndReceiverOrReceiverAndSenderOrderByCreatedAtDesc(
            User sender1, User receiver1, User sender2, User receiver2);
}
