import api from './api';

interface UserProfile {
  id?: number;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  skills?: string;
  role: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface UpdateProfileData {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  skills?: string;
}

const userService = {
  getAllUsers: async () => {
    const response = await api.get<UserProfile[]>('/api/users');
    return response.data;
  },

  getProfile: async () => {
    // Get current user ID from localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw new Error('User not logged in');
    }
    const user = JSON.parse(userStr);
    if (!user.id) {
      throw new Error('User ID not found');
    }
    const response = await api.get<UserProfile>(`/api/users/${user.id}`);
    return response.data;
  },

  updateProfile: async (id: number, data: UserProfile) => {
    const response = await api.put<UserProfile>(`/api/users/${id}`, data);
    return response.data;
  },

  updateCurrentUser: async (data: UpdateProfileData) => {
    const current = await userService.getProfile();
    if (!current.id) {
      throw new Error("Missing current user id");
    }
    const payload: UserProfile = {
      ...current,
      ...data
    };
    const response = await api.put<UserProfile>(`/api/users/${current.id}`, payload);
    return response.data;
  },

  changePassword: async (id: number, newPassword: string) => {
    return api.post(`/api/users/${id}/change-password`, newPassword, {
      headers: { 'Content-Type': 'text/plain' }
    });
  },

  // 管理员：按角色获取用户列表
  getUsersByRole: async (role: string) => {
    const response = await api.get<UserProfile[]>(`/api/users/role/${role}`);
    return response.data;
  },

  // 管理员：更新用户信息/状态
  updateUser: async (id: number, data: UserProfile) => {
    const response = await api.put<UserProfile>(`/api/users/${id}`, data);
    return response.data;
  },

  // 管理员：删除用户
  deleteUser: async (id: number) => {
    return api.delete(`/api/users/${id}`);
  }
};

export default userService;
export type { UserProfile, UpdateProfileData };
