import api from './api';

interface Review {
  id?: number;
  title: string;
  content: string;
  rating: number;
  pros?: string;
  cons?: string;
  workPeriod?: string;
  jobTitle?: string;
  anonymous: boolean;
  verified?: boolean;
  createdAt?: string;
  companyId?: number;
  jobId?: number;
  company?: {
    id?: number;
    name?: string;
  };
  student?: {
    id?: number;
    username?: string;
    fullName?: string;
  };
  job?: {
    id?: number;
    title?: string;
  };
}

interface CompanyReviewsResponse {
  reviews: Review[];
  averageRating: number;
  count: number;
}

const reviewService = {
  // 获取所有评价
  getAllReviews: async () => {
    const response = await api.get<Review[]>('/api/reviews');
    return response.data;
  },
  
  // 获取指定的评价
  getReviewById: async (id: number) => {
    const response = await api.get<Review>(`/api/reviews/${id}`);
    return response.data;
  },
  
  // 获取公司所有评价及统计信息
  getCompanyReviews: async (companyId: number) => {
    const response = await api.get<CompanyReviewsResponse>(`/api/reviews/company/${companyId}`);
    return response.data;
  },
  
  // 获取特定工作的评价
  getJobReviews: async (jobId: number) => {
    const response = await api.get<Review[]>(`/api/reviews/job/${jobId}`);
    return response.data;
  },
  
  // 获取当前学生的所有评价
  getMyReviews: async () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await api.get<Review[]>(`/api/reviews/student/${currentUser.id}`);
    return response.data;
  },
  
  // 创建新评价
  createReview: async (reviewData: Review) => {
    const payload: any = { ...reviewData };
    if (reviewData.companyId && !reviewData.company) {
      payload.company = { id: reviewData.companyId };
    }
    if (reviewData.jobId && !reviewData.job) {
      payload.job = { id: reviewData.jobId };
    }
    delete payload.companyId;
    delete payload.jobId;
    const response = await api.post<Review>('/api/reviews', payload);
    return response.data;
  },
  
  // 更新评价
  updateReview: async (id: number, reviewData: Review) => {
    const payload: any = { ...reviewData };
    delete payload.companyId;
    delete payload.jobId;
    const response = await api.put<Review>(`/api/reviews/${id}`, payload);
    return response.data;
  },
  
  // 删除评价
  deleteReview: async (id: number) => {
    return api.delete(`/api/reviews/${id}`);
  },

  // 管理员：审核通过评价
  verifyReview: async (id: number) => {
    return api.put(`/api/reviews/${id}/verify`);
  },
  
  // 游客接口 - 获取所有评价
  getAllReviewsPublic: async () => {
    const response = await api.get<Review[]>('/api/public/reviews');
    return response.data;
  }
};

export default reviewService;
export type { Review, CompanyReviewsResponse };
