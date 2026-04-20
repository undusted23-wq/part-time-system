package com.example.backend.controller;

import com.example.backend.model.Review;
import com.example.backend.model.User;
import com.example.backend.model.UserRole;
import com.example.backend.security.UserDetailsImpl;
import com.example.backend.service.CompanyService;
import com.example.backend.service.JobService;
import com.example.backend.service.ReviewService;
import com.example.backend.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewControllerTest {

    @Mock
    private ReviewService reviewService;

    @Mock
    private UserService userService;

    @Mock
    private CompanyService companyService;

    @Mock
    private JobService jobService;

    @InjectMocks
    private ReviewController reviewController;

    @Test
    void getMyReviewsShouldUseAuthenticatedStudentInsteadOfClientSuppliedId() {
        User student = new User();
        student.setId(7L);
        student.setUsername("student7");
        student.setRole(UserRole.STUDENT);

        UserDetailsImpl principal = UserDetailsImpl.build(student);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                principal,
                null,
                principal.getAuthorities()
        );

        List<Review> expected = List.of(new Review());

        when(userService.getUserById(7L)).thenReturn(Optional.of(student));
        when(reviewService.getReviewsByStudent(student)).thenReturn(expected);

        ResponseEntity<?> response = reviewController.getMyReviews(authentication);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isEqualTo(expected);
        verify(userService).getUserById(7L);
        verify(reviewService).getReviewsByStudent(student);
    }

    @Test
    void getMyReceivedReviewsShouldUseAuthenticatedStudentInsteadOfClientSuppliedId() {
        User student = new User();
        student.setId(7L);
        student.setUsername("student7");
        student.setRole(UserRole.STUDENT);

        UserDetailsImpl principal = UserDetailsImpl.build(student);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                principal,
                null,
                principal.getAuthorities()
        );

        List<Review> expected = List.of(new Review());

        when(userService.getUserById(7L)).thenReturn(Optional.of(student));
        when(reviewService.getReviewsReceivedByStudent(student)).thenReturn(expected);

        ResponseEntity<?> response = reviewController.getMyReceivedReviews(authentication);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isEqualTo(expected);
        verify(userService).getUserById(7L);
        verify(reviewService).getReviewsReceivedByStudent(student);
    }
}
