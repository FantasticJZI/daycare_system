// 演示模式API - 模擬後端響應
import { mockUsers, mockElderly, mockHealthRecords, mockActivities, mockAttendance, isDemoMode } from './mockData';

// 模擬API延遲
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 演示模式API
export const demoApi = {
  // 認證API
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      await delay(1000);
      if (credentials.email === 'admin@daycare.com' && credentials.password === 'admin123') {
        return {
          data: {
            user: mockUsers.admin,
            token: 'demo-token-12345'
          }
        };
      }
      throw new Error('登入失敗');
    },
    
    getProfile: async () => {
      await delay(500);
      return { data: { user: mockUsers.admin } };
    },
    
    logout: async () => {
      await delay(300);
      return { data: { message: '登出成功' } };
    }
  },
  
  // 長者API
  elderly: {
    getAll: async () => {
      await delay(800);
      return { data: { elderly: mockElderly, total: mockElderly.length } };
    },
    
    getStats: async () => {
      await delay(500);
      return {
        data: {
          total: mockElderly.length,
          active: mockElderly.filter(e => e.serviceStatus === 'active').length,
          waiting: mockElderly.filter(e => e.serviceStatus === 'waiting').length,
          suspended: mockElderly.filter(e => e.serviceStatus === 'suspended').length
        }
      };
    }
  },
  
  // 健康記錄API
  health: {
    getByElderly: async (elderlyId: string) => {
      await delay(600);
      const records = mockHealthRecords.filter(record => record.elderly === elderlyId);
      return { data: { records, total: records.length } };
    }
  },
  
  // 活動API
  activities: {
    getAll: async () => {
      await delay(700);
      return { data: { activities: mockActivities, total: mockActivities.length } };
    }
  },
  
  // 出勤API
  attendance: {
    getAll: async () => {
      await delay(600);
      return { data: { attendance: mockAttendance, total: mockAttendance.length } };
    }
  }
};

// 創建演示模式的axios攔截器
export const setupDemoMode = () => {
  if (!isDemoMode()) return;
  
  // 重寫localStorage以支持演示模式
  const originalGetItem = localStorage.getItem;
  localStorage.getItem = (key: string) => {
    if (key === 'token') {
      return 'demo-token-12345';
    }
    return originalGetItem.call(localStorage, key);
  };
  
  // 設置演示用戶到localStorage
  localStorage.setItem('user', JSON.stringify(mockUsers.admin));
};
