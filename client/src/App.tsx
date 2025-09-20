import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store/store';
import { setToken } from './store/slices/authSlice';
import { isDemoMode } from './utils/mockData';
import { mockUsers } from './utils/mockData';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import ElderlyList from './pages/Elderly/ElderlyList';
import ElderlyDetail from './pages/Elderly/ElderlyDetail';
import HealthRecords from './pages/Health/HealthRecords';
import AttendanceList from './pages/Attendance/AttendanceList';
import ActivityList from './pages/Activities/ActivityList';
import UserManagement from './pages/Users/UserManagement';
import Reports from './pages/Reports/Reports';
import FamilyDashboard from './pages/Family/FamilyDashboard';
import FamilyElderlyDetail from './pages/Family/FamilyElderlyDetail';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // 在演示模式下自動設置認證狀態
    if (isDemoMode() && !isAuthenticated) {
      localStorage.setItem('token', 'demo-token-12345');
      localStorage.setItem('user', JSON.stringify(mockUsers.admin));
      dispatch(setToken('demo-token-12345'));
    }
  }, [dispatch, isAuthenticated]);

  // 在演示模式下，如果已經有token就直接進入系統
  if (!isAuthenticated && !isDemoMode()) {
    return <Login />;
  }

  // 演示模式下的特殊處理
  if (isDemoMode() && localStorage.getItem('token')) {
    return (
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/elderly" element={<ElderlyList />} />
            <Route path="/elderly/:id" element={<ElderlyDetail />} />
            <Route path="/health" element={<HealthRecords />} />
            <Route path="/attendance" element={<AttendanceList />} />
            <Route path="/activities" element={<ActivityList />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* 長者管理 */}
          <Route path="/elderly" element={<ElderlyList />} />
          <Route path="/elderly/:id" element={<ElderlyDetail />} />
          
          {/* 健康管理 */}
          <Route path="/health" element={<HealthRecords />} />
          
          {/* 出勤管理 */}
          <Route path="/attendance" element={<AttendanceList />} />
          
          {/* 活動管理 */}
          <Route path="/activities" element={<ActivityList />} />
          
          {/* 用戶管理 */}
          {user?.role === 'admin' && (
            <Route path="/users" element={<UserManagement />} />
          )}
          
          {/* 報表 */}
          {(user?.role === 'admin' || user?.role === 'nurse') && (
            <Route path="/reports" element={<Reports />} />
          )}
          
          {/* 家屬專區 */}
          {user?.role === 'family' && (
            <>
              <Route path="/family" element={<FamilyDashboard />} />
              <Route path="/family/elderly/:id" element={<FamilyElderlyDetail />} />
            </>
          )}
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Box>
  );
};

export default App;

