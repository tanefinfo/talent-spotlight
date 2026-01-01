import axios from 'axios';

// Configure your Laravel backend URL here
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/admin/login', { email, password }),
  logout: () => api.post('/admin/logout'),
};

// Casting calls endpoints
export const castingCallsApi = {
  getAll: () => api.get('/admin/casting-calls'),
  getOne: (id: number) => api.get(`/admin/casting-calls/${id}`),
  create: (data: CastingCallInput) => api.post('/admin/casting-calls', data),
  update: (id: number, data: Partial<CastingCallInput>) =>
    api.put(`/admin/casting-calls/${id}`, data),
  delete: (id: number) => api.delete(`/admin/casting-calls/${id}`),
};

// Applications endpoints
export const applicationsApi = {
  getAll: () => api.get('/admin/applications'),
  getOne: (id: number) => api.get(`/admin/applications/${id}`),
  updateStatus: (id: number, status: ApplicationStatus) =>
    api.patch(`/admin/applications/${id}/status`, { status }),
  shortlist: (id: number) => api.patch(`/admin/applications/${id}/status`, { status: 'shortlisted' }),
  hire: (id: number) => api.patch(`/admin/applications/${id}/status`, { status: 'hired' }),
  reject: (id: number) => api.patch(`/admin/applications/${id}/status`, { status: 'rejected' }),
};

// Types
export interface CastingCall {
  id: number;
  title: string;
  description: string;
  requirements: string | null;
  deadline: string | null;
  status: 'open' | 'closed';
  created_by: number;
  created_at: string;
  updated_at: string;
  applications?: CastingApplication[];
}

export interface CastingCallInput {
  title: string;
  description: string;
  requirements?: string;
  deadline?: string;
  status?: 'open' | 'closed';
}

export type ApplicationStatus = 'pending' | 'shortlisted' | 'hired' | 'rejected';

export interface CastingApplication {
  id: number;
  casting_call_id: number;
  full_name: string;
  address: string;
  phone: string;
  email: string | null;
  gender: 'male' | 'female' | 'other';
  experience_story: string;
  image_path: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  casting_call?: CastingCall;
  videos?: ApplicationVideo[];
}

export interface ApplicationVideo {
  id: number;
  casting_application_id: number;
  video_path: string;
  video_url?: string;
}

export default api;
