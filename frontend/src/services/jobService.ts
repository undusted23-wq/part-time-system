import api from './api';

interface Job {
  id?: number;
  title: string;
  description: string;
  location?: string;
  jobType?: string;
  salary?: number;
  salaryPeriod?: string;
  requirements?: string;
  benefits?: string;
  workingHours?: string;
  applicationDeadline?: string;
  company?: {
    id?: number;
    name?: string;
  };
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface JobRequest {
  title: string;
  description: string;
  jobType: string;
  location?: string;
  salary: number;
  salaryPeriod: string;
  requirements?: string;
  benefits?: string;
  workingHours?: string;
  companyId: number;
  applicationDeadline?: string;
}

interface JobSearchParams {
  title?: string;
  location?: string;
  jobType?: string;
  minSalary?: number;
  keyword?: string;
}

interface JobApplicationRequest {
  jobId: number;
  coverLetter?: string;
  resumeUrl?: string;
}

const jobService = {
  getAllJobs: async () => {
    const response = await api.get<Job[]>('/api/jobs');
    return response.data;
  },
  // === 【新增】获取智能推荐职位 ===
  getRecommendedJobs: async () => {
    // 调用我们在 Java 后端写的 /api/recommendations 接口
    const response = await api.get('/api/recommendations');
    return response.data;
  },
  
  getJobById: async (id: number) => {
    const response = await api.get(`/api/jobs/${id}`);
    return response.data;
  },
  
  createJob: async (jobData: JobRequest) => {
    const response = await api.post('/api/jobs', jobData);
    return response.data;
  },
  
  updateJob: async (id: number, jobData: JobRequest) => {
    const response = await api.put(`/api/jobs/${id}`, jobData);
    return response.data;
  },

  updateJobStatus: async (id: number, active: boolean) => {
    const response = await api.put(`/api/jobs/${id}/status`, null, {
      params: { active }
    });
    return response.data;
  },
  
  deleteJob: async (id: number) => {
    return api.delete(`/api/jobs/${id}`);
  },
  
  updateJobDeadline: async (id: number, deadline: string) => {
    const response = await api.put(`/api/jobs/${id}/deadline`, null, {
      params: { deadline }
    });
    return response.data;
  },

  applyForJob: async (applicationData: JobApplicationRequest) => {
    const response = await api.post(`/api/applications`, applicationData);
    return response.data;
  },
  
  getMyApplications: async () => {
    const response = await api.get('/api/applications/my-applications');
    return response.data;
  },
  
  getJobApplications: async (jobId: number) => {
    const response = await api.get(`/api/applications/job/${jobId}`);
    return response.data;
  },
  
  searchJobs: async (params: JobSearchParams) => {
    const response = await api.get('/api/jobs/search', { params });
    return response.data;
  },

  getActiveJobs: async () => {
    const response = await api.get('/api/jobs/active');
    return response.data;
  },

  getJobsByCompany: async (companyId: number) => {
    const response = await api.get(`/api/jobs/company/${companyId}`);
    return response.data;
  },

  // 游客接口 - 获取所有活跃的兼职岗位
  getActiveJobsPublic: async () => {
    const response = await api.get('/api/public/jobs');
    return response.data;
  },
  
  // 游客接口 - 搜索兼职岗位
  searchJobsPublic: async (keyword: string) => {
    const response = await api.get('/api/public/jobs/search', { params: { keyword } });
    return response.data;
  },

  getJobByIdPublic: async (id: number) => {
    const response = await api.get(`/api/public/jobs/${id}`);
    return response.data;
  }
};

export default jobService;
export type { Job, JobRequest, JobSearchParams, JobApplicationRequest };
