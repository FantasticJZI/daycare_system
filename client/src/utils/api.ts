import axios from 'axios';
import { demoApi, setupDemoMode } from './demoApi';
import { isDemoMode } from './mockData';

// 檢查是否在GitHub Pages環境中
const isGitHubPages = window.location.hostname === 'fantasticjzi.github.io';
const API_BASE_URL = isGitHubPages ? '/api' : (process.env.REACT_APP_API_URL || 'http://localhost:5000/api');

// 設置演示模式
if (isDemoMode()) {
  setupDemoMode();
}

// 建立 axios 實例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器 - 添加認證 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器 - 處理錯誤
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 認證 API
export const authAPI = {
  login: (credentials: { email: string; password: string }) => {
    if (isDemoMode()) {
      return demoApi.auth.login(credentials);
    }
    return api.post('/auth/login', credentials);
  },
  
  register: (userData: any) =>
    api.post('/auth/register', userData),
  
  getProfile: () => {
    if (isDemoMode()) {
      return demoApi.auth.getProfile();
    }
    return api.get('/auth/profile');
  },
  
  updateProfile: (userData: any) =>
    api.put('/auth/profile', userData),
  
  changePassword: (passwordData: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', passwordData),
  
  logout: () => {
    if (isDemoMode()) {
      return demoApi.auth.logout();
    }
    return api.post('/auth/logout');
  },
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
};

// 長者 API
export const elderlyAPI = {
  getAll: (params?: any) => {
    if (isDemoMode()) {
      return demoApi.elderly.getAll();
    }
    return api.get('/elderly', { params });
  },
  
  getById: (id: string) =>
    api.get(`/elderly/${id}`),
  
  create: (elderlyData: any) =>
    api.post('/elderly', elderlyData),
  
  update: (id: string, elderlyData: any) =>
    api.put(`/elderly/${id}`, elderlyData),
  
  delete: (id: string) =>
    api.delete(`/elderly/${id}`),
  
  getStats: () => {
    if (isDemoMode()) {
      return demoApi.elderly.getStats();
    }
    return api.get('/elderly/stats');
  },
  
  addFamilyMember: (elderlyId: string, memberData: any) =>
    api.post(`/elderly/${elderlyId}/family`, memberData),
  
  removeFamilyMember: (elderlyId: string, memberId: string) =>
    api.delete(`/elderly/${elderlyId}/family/${memberId}`),
  
  updateCareAssessment: (id: string, assessmentData: any) =>
    api.put(`/elderly/${id}/care-assessment`, assessmentData),
};

// 健康記錄 API
export const healthAPI = {
  getByElderly: (elderlyId: string, params?: any) =>
    api.get(`/health/elderly/${elderlyId}`, { params }),
  
  getById: (id: string) =>
    api.get(`/health/${id}`),
  
  create: (healthData: any) =>
    api.post('/health', healthData),
  
  update: (id: string, healthData: any) =>
    api.put(`/health/${id}`, healthData),
  
  delete: (id: string) =>
    api.delete(`/health/${id}`),
  
  getStats: (elderlyId: string, params?: any) =>
    api.get(`/health/elderly/${elderlyId}/stats`, { params }),
  
  getAbnormal: (params?: any) =>
    api.get('/health/abnormal', { params }),
  
  review: (id: string, reviewData: any) =>
    api.put(`/health/${id}/review`, reviewData),
};

// 出勤 API
export const attendanceAPI = {
  getAll: (params?: any) =>
    api.get('/attendance', { params }),
  
  getById: (id: string) =>
    api.get(`/attendance/${id}`),
  
  create: (attendanceData: any) =>
    api.post('/attendance', attendanceData),
  
  update: (id: string, attendanceData: any) =>
    api.put(`/attendance/${id}`, attendanceData),
  
  delete: (id: string) =>
    api.delete(`/attendance/${id}`),
  
  checkIn: (elderlyId: string, checkInData: any) =>
    api.post('/attendance/check-in', { elderlyId, ...checkInData }),
  
  checkOut: (elderlyId: string, checkOutData: any) =>
    api.post('/attendance/check-out', { elderlyId, ...checkOutData }),
  
  getStats: (params?: any) =>
    api.get('/attendance/stats/overview', { params }),
};

// 活動 API
export const activityAPI = {
  getAll: (params?: any) =>
    api.get('/activities', { params }),
  
  getById: (id: string) =>
    api.get(`/activities/${id}`),
  
  create: (activityData: any) =>
    api.post('/activities', activityData),
  
  update: (id: string, activityData: any) =>
    api.put(`/activities/${id}`, activityData),
  
  delete: (id: string) =>
    api.delete(`/activities/${id}`),
  
  register: (id: string, registrationData: any) =>
    api.post(`/activities/${id}/register`, registrationData),
  
  unregister: (id: string, participantId: string) =>
    api.delete(`/activities/${id}/register/${participantId}`),
  
  updateParticipant: (id: string, participantId: string, participantData: any) =>
    api.put(`/activities/${id}/participants/${participantId}`, participantData),
  
  start: (id: string) =>
    api.put(`/activities/${id}/start`),
  
  end: (id: string, endData: any) =>
    api.put(`/activities/${id}/end`, endData),
  
  evaluate: (id: string, evaluationData: any) =>
    api.post(`/activities/${id}/evaluation`, evaluationData),
  
  getStats: (params?: any) =>
    api.get('/activities/stats/overview', { params }),
};

// 照護 API
export const careAPI = {
  getRecords: (params?: any) =>
    api.get('/care/records', { params }),
  
  createRecord: (recordData: any) =>
    api.post('/care/records', recordData),
  
  getMedications: (params?: any) =>
    api.get('/care/medications', { params }),
  
  recordMedication: (medicationData: any) =>
    api.post('/care/medications', medicationData),
  
  getIncidents: (params?: any) =>
    api.get('/care/incidents', { params }),
  
  recordIncident: (incidentData: any) =>
    api.post('/care/incidents', incidentData),
  
  getStats: (params?: any) =>
    api.get('/care/stats/overview', { params }),
};

// 家屬 API
export const familyAPI = {
  getElderly: () =>
    api.get('/family/elderly'),
  
  getElderlyById: (elderlyId: string) =>
    api.get(`/family/elderly/${elderlyId}`),
  
  getElderlyHealth: (elderlyId: string, params?: any) =>
    api.get(`/family/elderly/${elderlyId}/health`, { params }),
  
  getElderlyAttendance: (elderlyId: string, params?: any) =>
    api.get(`/family/elderly/${elderlyId}/attendance`, { params }),
  
  getElderlyActivities: (elderlyId: string, params?: any) =>
    api.get(`/family/elderly/${elderlyId}/activities`, { params }),
  
  sendMessage: (elderlyId: string, messageData: any) =>
    api.post(`/family/elderly/${elderlyId}/message`, messageData),
  
  getNotificationSettings: () =>
    api.get('/family/notification-settings'),
  
  updateNotificationSettings: (settings: any) =>
    api.put('/family/notification-settings', settings),
  
  registerPushToken: (tokenData: any) =>
    api.post('/family/push-token', tokenData),
  
  removePushToken: (token: string) =>
    api.delete(`/family/push-token/${token}`),
};

// 用戶 API
export const userAPI = {
  getAll: (params?: any) =>
    api.get('/users', { params }),
  
  getById: (id: string) =>
    api.get(`/users/${id}`),
  
  create: (userData: any) =>
    api.post('/users', userData),
  
  update: (id: string, userData: any) =>
    api.put(`/users/${id}`, userData),
  
  toggleStatus: (id: string) =>
    api.put(`/users/${id}/toggle-status`),
  
  delete: (id: string) =>
    api.delete(`/users/${id}`),
};

// 通知 API
export const notificationAPI = {
  getAll: (params?: any) =>
    api.get('/notifications', { params }),
  
  markAsRead: (id: string) =>
    api.put(`/notifications/${id}/read`),
  
  markAllAsRead: () =>
    api.put('/notifications/read-all'),
  
  delete: (id: string) =>
    api.delete(`/notifications/${id}`),
  
  getUnreadCount: () =>
    api.get('/notifications/unread-count'),
};

// 報表 API
export const reportAPI = {
  getLongTermCare: (params?: any) =>
    api.get('/reports/long-term-care', { params }),
  
  getAttendance: (params?: any) =>
    api.get('/reports/attendance', { params }),
  
  getHealth: (params?: any) =>
    api.get('/reports/health', { params }),
  
  getActivities: (params?: any) =>
    api.get('/reports/activities', { params }),
  
  getFinancial: (params?: any) =>
    api.get('/reports/financial', { params }),
  
  export: (exportData: any) =>
    api.post('/reports/export', exportData),
};

export default api;

