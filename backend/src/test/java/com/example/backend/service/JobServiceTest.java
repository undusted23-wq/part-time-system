package com.example.backend.service;

import com.example.backend.model.Job;
import com.example.backend.repository.JobRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @InjectMocks
    private JobService jobService;

    @Test
    void shouldCreateEmployerJobAsPendingReview() {
        Job job = new Job();
        job.setActive(true);

        when(jobRepository.save(job)).thenAnswer(invocation -> invocation.getArgument(0));

        Job saved = jobService.createEmployerJob(job);

        ArgumentCaptor<Job> captor = ArgumentCaptor.forClass(Job.class);
        verify(jobRepository).save(captor.capture());

        assertThat(saved.isActive()).isFalse();
        assertThat(captor.getValue().isActive()).isFalse();
    }

    @Test
    void shouldResetEmployerUpdatedJobToPendingReview() {
        Job job = new Job();
        job.setActive(true);

        when(jobRepository.save(job)).thenAnswer(invocation -> invocation.getArgument(0));

        Job saved = jobService.updateEmployerJob(job);

        ArgumentCaptor<Job> captor = ArgumentCaptor.forClass(Job.class);
        verify(jobRepository).save(captor.capture());

        assertThat(saved.isActive()).isFalse();
        assertThat(captor.getValue().isActive()).isFalse();
    }
}
