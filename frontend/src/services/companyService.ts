import api from './api';

interface Company {
  id?: number;
  name: string;
  description?: string;
  industry?: string;
  location?: string;
  website?: string;
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  isVerified?: boolean;
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const companyService = {
  resolveLogoUrl: (logoUrl?: string) => {
    if (!logoUrl) {
      return "";
    }

    if (/^https?:\/\//i.test(logoUrl)) {
      return logoUrl;
    }

    const baseUrl = (api.defaults.baseURL || "").replace(/\/$/, "");
    const normalizedPath = logoUrl.startsWith("/") ? logoUrl : `/${logoUrl}`;
    return `${baseUrl}${normalizedPath}`;
  },

  // 获取所有企业（游客接口 - 仅已认证企业）
  getAllCompanies: async () => {
    const response = await api.get<Company[]>('/api/public/companies');
    return response.data;
  },

  // 获取企业详情（游客接口）
  getCompanyById: async (id: number) => {
    const response = await api.get<Company>(`/api/public/companies/${id}`);
    return response.data;
  },

  // 搜索企业（游客接口）
  searchCompanies: async (params: { name?: string; industry?: string }) => {
    const response = await api.get<Company[]>('/api/public/companies/search', { params });
    return response.data;
  },

  // 获取所有企业（需要认证）
  getAllCompaniesAuth: async () => {
    const response = await api.get<Company[]>('/api/companies');
    return response.data;
  },

  // 获取已认证企业（需要认证）
  getVerifiedCompanies: async () => {
    const response = await api.get<Company[]>('/api/companies/verified');
    return response.data;
  },

  // 创建企业（需要认证）
  createCompany: async (companyData: Company) => {
    const response = await api.post<Company>('/api/companies', companyData);
    return response.data;
  },

  // 更新企业（需要认证）
  updateCompany: async (id: number, companyData: Company) => {
    const response = await api.put<Company>(`/api/companies/${id}`, companyData);
    return response.data;
  },

  uploadCompanyLogo: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<Company>(`/api/companies/${id}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // 删除企业（需要认证）
  deleteCompany: async (id: number) => {
    return api.delete(`/api/companies/${id}`);
  },

  // 管理员认证/取消认证企业
  verifyCompany: async (id: number, verified: boolean) => {
    const response = await api.put<Company>(`/api/companies/${id}/verify`, null, {
      params: { verified }
    });
    return response.data;
  },

  // 获取当前雇主的公司列表
  getEmployerCompanies: async () => {
    const response = await api.get<Company[]>('/api/companies/employer');
    return response.data;
  },
};

export default companyService;
export type { Company };
