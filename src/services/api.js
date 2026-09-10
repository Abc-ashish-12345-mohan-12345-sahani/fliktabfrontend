import axios from 'axios';

// Automatically adapt to relative proxy / backend host
const rawBase = (import.meta.env.VITE_API_BASE_URL || 'https://flicktap-backend.mohanashish708090.workers.dev/api').trim().replace(/\/+$/, '');
const API_BASE_URL = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('flicktap_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for automatic 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token is invalid or user deleted, clear local session
      const isAuthEndpoint = error.config.url?.includes('/auth/login') || error.config.url?.includes('/auth/signup');
      if (!isAuthEndpoint) {
        localStorage.removeItem('flicktap_token');
        localStorage.removeItem('flicktap_user');
      }
    }
    return Promise.reject(error);
  }
);

export const resolveVideoUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://192.168.1.9:5000/videos/')) {
    return url.replace('http://192.168.1.9:5000/videos/', '/videos/');
  }
  if (url.startsWith('https://flicktap-backend.mohanashish708090.workers.dev/videos/')) {
    return url.replace('https://flicktap-backend.mohanashish708090.workers.dev/videos/', '/videos/');
  }
  return url;
};

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
  sendSignupOtp: (data) => api.post('/auth/send-signup-otp', data),
  verifySignupOtp: (data) => api.post('/auth/verify-signup-otp', data),
  sendForgotPasswordOtp: (data) => api.post('/auth/forgot-password/send-otp', data),
  resetPasswordWithOtp: (data) => api.post('/auth/forgot-password/reset', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updateProfile: (data) => api.put('/auth/profile', data),
  deleteAccount: (data) => api.delete('/auth/delete-account', { data }),
  getAllUsers: () => api.get('/auth/users'),
  toggleUserStatus: (id, data) => api.put(`/auth/users/${id}/status`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

export const showsApi = {
  getAll: (params) => api.get('/shows', { params }),
  getById: (id) => api.get(`/shows/${id}`),
  purchase: (id, data) => api.post(`/shows/${id}/purchase`, data),
  uploadLocalVideo: (formData, onProgress) =>
    api.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    }),
  deleteVideoFile: (filename) => api.delete(`/upload/video/${encodeURIComponent(filename)}`),
  deleteShow: (id) => api.delete(`/shows/${id}`),
  getDatabaseStats: () => api.get('/db?format=json'),
};

export const notificationApi = {
  getAll: (userEmail, extraParams = {}) => api.get('/notifications', { params: { userEmail, ...extraParams } }),
  sendNotification: (data) => api.post('/notifications', data),
  markAsRead: (id, userEmail) => api.put(`/notifications/${id}/read`, { userEmail }),
  markAllAsRead: (userEmail) => api.put('/notifications/read-all', { userEmail }),
  clearAll: () => api.delete('/notifications'),
};

export const feedbackApi = {
  getAll: (params) => api.get('/auth/feedback', { params }),
  submit: (data) => api.post('/auth/feedback', data),
  updateStatus: (id, status) => api.put(`/auth/feedback/${id}/status`, { status }),
  delete: (id) => api.delete(`/auth/feedback/${id}`),
};

export const systemApi = {
  checkVersion: () => api.get('/version'),
  checkHealth: () => api.get('/health'),
};


export default api;
