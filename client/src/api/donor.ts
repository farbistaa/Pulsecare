// client/src/api/donor.ts
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Configure axios with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// Donor API functions
export const donorApi = {
  // Get donor profile by ID

  
  getDonorProfile: async (donorId: string) => {
    try {
      const response = await api.get(`/api/donors/${donorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching donor profile:', error);
      throw error;
    }
  },
  // Update donor profile
  updateDonorProfile: async (donorId: string, profileData: any) => {
    try {
      const response = await api.put(`/api/donors/${donorId}`, profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating donor profile:', error);
      throw error;
    }
  },
  // Get donor donation history
  getDonationHistory: async (donorId: string) => {
    try {
      const response = await api.get(`/api/donors/${donorId}/donations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching donation history:', error);
      throw error;
    }
  },
};
// Add this new admin API object
export const adminApi = {
  // Get all users (for admin management)
getAllUsers: async (params?: {
  limit?: string;
  offset?: string;
  search?: string;
  bloodGroup?: string;
  district?: string;
  isVerified?: string;
  isAvailable?: string;
  status?: string;
  lastDonationFrom?: string;
  lastDonationTo?: string;
  sortBy?: string;
  sortOrder?: string;
}) => {
  try {
    // Filter out empty strings and undefined values
    const filteredParams: any = {};
    
    if (params?.limit) filteredParams.limit = params.limit;
    if (params?.offset) filteredParams.offset = params.offset;
    if (params?.search) filteredParams.search = params.search;
    if (params?.bloodGroup) filteredParams.bloodGroup = params.bloodGroup;
    if (params?.district) filteredParams.district = params.district;
    if (params?.isVerified) filteredParams.isVerified = params.isVerified;
    if (params?.isAvailable) filteredParams.isAvailable = params.isAvailable;
    if (params?.status) filteredParams.status = params.status;
    if (params?.lastDonationFrom) filteredParams.lastDonationFrom = params.lastDonationFrom;
    if (params?.lastDonationTo) filteredParams.lastDonationTo = params.lastDonationTo;
    if (params?.sortBy) filteredParams.sortBy = params.sortBy;
    if (params?.sortOrder) filteredParams.sortOrder = params.sortOrder;
    
    console.log('Fetching users with params:', filteredParams);
    const response = await api.get('/api/admin/users', { params: filteredParams });
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
},
  // Get total users count
  getTotalUsersCount: async (): Promise<{ total: number }> => {
    try {
      const response = await api.get('/api/admin/users/total');
      return response.data;
    } catch (error) {
      console.error('Error fetching total users count:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (userId: number, userData: any): Promise<any> => {
    try {
      const response = await api.patch(`/api/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Deactivate user
  deactivateUser: async (userId: number, reason: string, customReason?: string): Promise<any> => {
    try {
      const response = await api.patch(`/api/admin/users/${userId}`, { 
        isAvailable: false,
        status: 'Unavailable',
        deactivationReason: reason,
        customDeactivationReason: customReason
      });
      return response.data;
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId: number): Promise<any> => {
    try {
      const response = await api.delete(`/api/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};
export default donorApi;