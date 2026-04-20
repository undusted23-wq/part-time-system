package com.example.backend.service;

import com.example.backend.model.Company;
import com.example.backend.model.Review;
import com.example.backend.model.ReviewAuthorType;
import com.example.backend.model.User;
import com.example.backend.repository.ReviewRepository;
import com.example.backend.service.impl.ReviewServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceImplTest {

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    @Test
    void shouldReturnOnlyStudentAuthoredReviewsForCompanyInbox() {
        Company company = new Company();
        Review review = new Review();
        review.setCompany(company);
        review.setReviewerRole(ReviewAuthorType.STUDENT);

        when(reviewRepository.findByCompanyAndReviewerRoleOrderByCreatedAtDesc(company, ReviewAuthorType.STUDENT))
                .thenReturn(List.of(review));

        List<Review> result = reviewService.getReviewsReceivedByCompany(company);

        verify(reviewRepository).findByCompanyAndReviewerRoleOrderByCreatedAtDesc(company, ReviewAuthorType.STUDENT);
        assertThat(result).containsExactly(review);
    }

    @Test
    void shouldReturnOnlyEmployerAuthoredReviewsForStudentInbox() {
        User student = new User();
        Review review = new Review();
        review.setStudent(student);
        review.setReviewerRole(ReviewAuthorType.EMPLOYER);

        when(reviewRepository.findByStudentAndReviewerRoleOrderByCreatedAtDesc(student, ReviewAuthorType.EMPLOYER))
                .thenReturn(List.of(review));

        List<Review> result = reviewService.getReviewsReceivedByStudent(student);

        verify(reviewRepository).findByStudentAndReviewerRoleOrderByCreatedAtDesc(student, ReviewAuthorType.EMPLOYER);
        assertThat(result).containsExactly(review);
    }
}
