import api from './api';

interface JobApplication {
  id?: number;
  appliedAt?: string;
  updatedAt?: string;
  status: string;
  coverLetter?: string;
  resumeUrl?: string;
  employerNotes?: string;
  applicant?: {
    id?: number;
    username?: string;
    fullName?: string;
  };
  job?: {
    id?: number;
    title?: string;
    company?: {
      id?: number;
      name?: string;
    };
  };
}

interface JobApplicationRequest {
  jobId: number;
  coverLetter?: string;
  resumeUrl?: string;
}

interface JobApplicationUpdateRequest {
  coverLetter?: string;
  resumeUrl?: string;
}

const applicationService = {
  getAllApplications: async () => {
    const response = await api.get<JobApplication[]>('/api/applications');
    return response.data;
  },

  getMyApplications: async () => {
    const response = await api.get<JobApplication[]>('/api/applications/my-applications');
    return response.data;
  },

  getApplicationById: async (id: number) => {
    const response = await api.get<JobApplication>(`/api/applications/${id}`);
    return response.data;
  },

  getApplicationsByJob: async (jobId: number) => {
    const response = await api.get<JobApplication[]>(`/api/applications/job/${jobId}`);
    return response.data;
  },

  getApplicationsByStatus: async (status: string) => {
    const response = await api.get<JobApplication[]>(`/api/applications/status/${status}`);
    return response.data;
  },

  getApplicationsByJobAndStatus: async (jobId: number, status: string) => {
    const response = await api.get<JobApplication[]>(`/api/applications/job/${jobId}/status/${status}`);
    return response.data;
  },

  applyForJob: async (payload: JobApplicationRequest) => {
    const response = await api.post<JobApplication>('/api/applications', payload);
    return response.data;
  },

  updateApplicationDetails: async (id: number, payload: JobApplicationUpdateRequest) => {
    const response = await api.put<JobApplication>(`/api/applications/${id}`, payload);
    return response.data;
  },

  updateApplicationStatus: async (id: number, status: string) => {
    const response = await api.put<JobApplication>(`/api/applications/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  addEmployerNotes: async (id: number, notes: string) => {
    const response = await api.put<JobApplication>(`/api/applications/${id}/notes`, notes, {
      headers: { 'Content-Type': 'text/plain' }
    });
    return response.data;
  },

  deleteApplication: async (id: number) => {
    return api.delete(`/api/applications/${id}`);
  }
};

export default applicationService;
export type { JobApplication, JobApplicationRequest, JobApplicationUpdateRequest };
