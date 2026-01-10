import api from './api';
import { Job } from './jobService';

interface SavedJob {
  id?: number;
  job: Job;
  notes?: string;
  savedAt?: string;
}

const savedJobService = {
  // 获取当前学生的所有收藏职位
  getMySavedJobs: async () => {
    const response = await api.get<SavedJob[]>('/api/saved-jobs');
    return response.data;
  },
  
  // 检查职位是否已被当前用户收藏
  isJobSaved: async (jobId: number) => {
    const response = await api.get<{ saved: boolean }>(`/api/saved-jobs/job/${jobId}`);
    return response.data.saved;
  },
  
  // 收藏职位
  saveJob: async (jobId: number, notes?: string) => {
    const payload = notes ? { notes } : {};
    const response = await api.post<SavedJob>(`/api/saved-jobs/job/${jobId}`, payload);
    return response.data;
  },
  
  // 更新收藏职位笔记
  updateNotes: async (id: number, notes: string) => {
    const response = await api.put<SavedJob>(`/api/saved-jobs/${id}`, { notes });
    return response.data;
  },
  
  // 取消收藏职位
  unsaveJob: async (jobId: number) => {
    return api.delete(`/api/saved-jobs/job/${jobId}`);
  },
  
  // 删除收藏记录
  deleteSavedJob: async (id: number) => {
    return api.delete(`/api/saved-jobs/${id}`);
  }
};

export default savedJobService;
export type { SavedJob };
