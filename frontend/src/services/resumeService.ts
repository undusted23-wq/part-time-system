import api from './api';

interface Resume {
  id?: number;
  title: string;
  resumeFilePath?: string;
  fileUrl?: string;
  summary?: string;
  skills?: string;
  student?: {
    id: number;
    username: string;
    email: string;
    fullName?: string;
    phoneNumber?: string;
    skills?: string;
  };
  educationList?: Array<{
    id?: number;
    schoolName?: string;
    major?: string;
    degree?: string;
    startDate?: string;
    endDate?: string;
  }>;
  workExperienceList?: Array<{
    id?: number;
    companyName?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  active?: boolean;
  default?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const resumeService = {
  // 获取当前学生的所有简历
  getMyResumes: async () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await api.get<Resume[]>(`/api/resumes/student/${currentUser.id}`);
    return response.data;
  },

  // 获取当前学生的默认简历
  getMyDefaultResume: async () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await api.get<Resume>(`/api/resumes/student/${currentUser.id}/default`);
    return response.data;
  },

  // 获取指定的简历
  getResumeById: async (id: number) => {
    const response = await api.get<Resume>(`/api/resumes/${id}`);
    return response.data;
  },

  // 创建新简历
  createResume: async (resumeData: Resume) => {
    const response = await api.post<Resume>('/api/resumes', resumeData);
    return response.data;
  },

  // 更新简历
  updateResume: async (id: number, resumeData: Resume) => {
    const response = await api.put<Resume>(`/api/resumes/${id}`, resumeData);
    return response.data;
  },

  // 设置默认简历
  setDefaultResume: async (id: number) => {
    const response = await api.put(`/api/resumes/${id}/default`);
    return response.data;
  },

  // 删除简历
  deleteResume: async (id: number) => {
    return api.delete(`/api/resumes/${id}`);
  },

  // ========== Admin Methods ==========

  // 管理员：获取所有简历
  getAllResumes: async () => {
    const response = await api.get<Resume[]>('/api/resumes');
    return response.data;
  },

  // 下载简历文件
  downloadResume: async (id: number) => {
    const response = await api.get(`/api/resumes/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // 上传简历文件
  uploadResumeFile: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/api/resumes/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export default resumeService;
export type { Resume };
