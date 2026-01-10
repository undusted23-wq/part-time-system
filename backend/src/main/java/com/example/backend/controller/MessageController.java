package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.MessageRequest;
import com.example.backend.dto.MessageUpdateRequest;
import com.example.backend.model.Message;
import com.example.backend.model.User;
import com.example.backend.security.UserDetailsImpl;
import com.example.backend.service.JobApplicationService;
import com.example.backend.service.JobService;
import com.example.backend.service.MessageService;
import com.example.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserService userService;

    @Autowired
    private JobService jobService;

    @Autowired
    private JobApplicationService applicationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'EMPLOYER', 'ADMIN')")
    public ResponseEntity<?> getUserMessages() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User currentUser = userService.getUserById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Message> received = messageService.getMessagesByReceiver(currentUser);
        List<Message> sent = messageService.getMessagesBySender(currentUser);
        
        Map<String, Object> response = new HashMap<>();
        response.put("received", received);
        response.put("sent", sent);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread")
    @PreAuthorize("hasAnyRole('STUDENT', 'EMPLOYER', 'ADMIN')")
    public ResponseEntity<?> getUnreadMessages() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User currentUser = userService.getUserById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Message> unreadMessages = messageService.getUnreadMessages(currentUser);
        return ResponseEntity.ok(unreadMessages);
    }

    @GetMapping("/unread/count")
    @PreAuthorize("hasAnyRole('STUDENT', 'EMPLOYER', 'ADMIN')")
    public ResponseEntity<?> getUnreadMessageCount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User currentUser = userService.getUserById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        long count = messageService.getUnreadMessageCount(currentUser);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Message>> getAllMessagesForAdmin() {
        return ResponseEntity.ok(messageService.getAllMessages());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'EMPLOYER', 'ADMIN')")
    public ResponseEntity<?> getMessageById(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        return messageService.getMessageById(id)
                .map(message -> {
                    // Only allow sender, receiver, or admin to view the message
                    boolean isAdmin = authentication.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                    boolean isSender = message.getSender().getId().equals(userDetails.getId());
                    boolean isReceiver = message.getReceiver().getId().equals(userDetails.getId());
                    
                    if (isAdmin || isSender || isReceiver) {
                        return ResponseEntity.ok(message);
                    } else {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(new ApiResponse(false, "You don't have permission to view this message"));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/conversation/{userId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'EMPLOYER', 'ADMIN')")
    public ResponseEntity<?> getConversation(@PathVariable Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User currentUser = userService.getUserById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        User otherUser = userService.getUserById(userId)
                .orElseThrow(() -> new RuntimeException("Other user not found"));
        
        List<Message> conversation = messageService.getConversation(currentUser, otherUser);
        return ResponseEntity.ok(conversation);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'EMPLOYER', 'ADMIN')")
    public ResponseEntity<?> sendMessage(@Valid @RequestBody MessageRequest messageRequest) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            User sender = userService.getUserById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("Sender not found"));
            
            User receiver = userService.getUserById(messageRequest.getReceiverId())
                    .orElseThrow(() -> new RuntimeException("Receiver not found"));
            
            Message message = new Message();
            message.setSender(sender);
            message.setReceiver(receiver);
            message.setSubject(messageRequest.getSubject());
            message.setContent(messageRequest.getContent());

            if (messageRequest.getRelatedJobId() != null) {
                message.setRelatedJob(jobService.getJobById(messageRequest.getRelatedJobId())
                        .orElseThrow(() -> new RuntimeException("Job not found")));
            }

            if (messageRequest.getRelatedApplicationId() != null) {
                message.setRelatedApplication(applicationService.getApplicationById(messageRequest.getRelatedApplicationId())
                        .orElseThrow(() -> new RuntimeException("Application not found")));
            }
            
            Message sentMessage = messageService.sendMessage(message);
            return ResponseEntity.status(HttpStatus.CREATED).body(sentMessage);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to send message: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('STUDENT', 'EMPLOYER', 'ADMIN')")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        return messageService.getMessageById(id)
                .map(message -> {
                    // Only allow receiver or admin to mark as read
                    boolean isAdmin = authentication.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                    boolean isReceiver = message.getReceiver().getId().equals(userDetails.getId());
                    
                    if (isAdmin || isReceiver) {
                        Message updatedMessage = messageService.markAsRead(id);
                        return ResponseEntity.ok(updatedMessage);
                    } else {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(new ApiResponse(false, "You don't have permission to mark this message as read"));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'EMPLOYER', 'ADMIN')")
    public ResponseEntity<?> updateMessage(@PathVariable Long id, @Valid @RequestBody MessageUpdateRequest updateRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return messageService.getMessageById(id)
                .map(message -> {
                    boolean isAdmin = authentication.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                    boolean isSender = message.getSender().getId().equals(userDetails.getId());

                    if (!isAdmin && !isSender) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(new ApiResponse(false, "You don't have permission to update this message"));
                    }

                    message.setSubject(updateRequest.getSubject());
                    message.setContent(updateRequest.getContent());

                    if (updateRequest.getRelatedJobId() != null) {
                        message.setRelatedJob(jobService.getJobById(updateRequest.getRelatedJobId())
                                .orElseThrow(() -> new RuntimeException("Job not found")));
                    } else {
                        message.setRelatedJob(null);
                    }

                    if (updateRequest.getRelatedApplicationId() != null) {
                        message.setRelatedApplication(applicationService.getApplicationById(updateRequest.getRelatedApplicationId())
                                .orElseThrow(() -> new RuntimeException("Application not found")));
                    } else {
                        message.setRelatedApplication(null);
                    }

                    return ResponseEntity.ok(messageService.updateMessage(message));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isMessageParticipant(#id, authentication.name)")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id) {
        return messageService.getMessageById(id)
                .map(message -> {
                    messageService.deleteMessage(id);
                    return ResponseEntity.ok(new ApiResponse(true, "Message deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
