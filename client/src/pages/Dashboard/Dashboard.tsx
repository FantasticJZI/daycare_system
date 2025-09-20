import React, { useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Paper, Chip, List, ListItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import { 
  People as PeopleIcon, 
  LocalHospital as HealthIcon, 
  Schedule as ScheduleIcon, 
  Event as EventIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchElderlyStats } from '../../store/slices/elderlySlice';
import { isDemoMode, mockElderly, mockActivities, mockAttendance } from '../../utils/mockData';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats } = useSelector((state: RootState) => state.elderly);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'nurse') {
      dispatch(fetchElderlyStats());
    }
  }, [dispatch, user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早安';
    if (hour < 18) return '午安';
    return '晚安';
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  // 獲取演示模式的統計數據
  const getDemoStats = () => {
    if (!isDemoMode()) return stats;
    return {
      total: mockElderly.length,
      active: mockElderly.filter(e => e.serviceStatus === 'active').length,
      waiting: mockElderly.filter(e => e.serviceStatus === 'waiting').length,
      suspended: mockElderly.filter(e => e.serviceStatus === 'suspended').length
    };
  };

  const currentStats = getDemoStats();

  // 今日出勤統計
  const todayAttendance = mockAttendance.length;
  const totalElderly = mockElderly.length;
  const attendanceRate = totalElderly > 0 ? Math.round((todayAttendance / totalElderly) * 100) : 0;

  // 今日活動
  const todayActivities = mockActivities.slice(0, 3);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {getGreeting()}，{user?.name}！
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {getCurrentDate()}
        </Typography>
        {isDemoMode() && (
          <Chip 
            label="演示模式" 
            color="info" 
            size="small" 
            sx={{ mt: 1 }}
          />
        )}
      </Box>
      
      <Grid container spacing={3}>
        {/* 統計卡片 */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  總長者數
                </Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {currentStats?.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                註冊長者總數
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  服務中
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {currentStats?.active || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                正在接受服務
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimeIcon color="warning" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  今日出勤
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {todayAttendance}/{totalElderly}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                出勤率 {attendanceRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EventIcon color="info" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  今日活動
                </Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {todayActivities.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                進行中的活動
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 今日活動列表 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <EventIcon sx={{ mr: 1 }} />
                今日活動安排
              </Typography>
              <List>
                {todayActivities.map((activity, index) => (
                  <React.Fragment key={activity._id}>
                    <ListItem>
                      <ListItemIcon>
                        <ScheduleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.name}
                        secondary={`${activity.startTime} - ${activity.endTime} | ${activity.location}`}
                      />
                      <Chip 
                        label={`${activity.currentParticipants}/${activity.maxParticipants}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </ListItem>
                    {index < todayActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 系統狀態 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                系統狀態
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="資料庫連接"
                    secondary="正常運作"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="系統服務"
                    secondary="所有服務正常"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="等待審核"
                    secondary={`${currentStats?.waiting || 0} 位長者等待服務`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 快速操作 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Typography variant="h6" gutterBottom>
              🚀 快速操作
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                  <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle1">長者管理</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    管理長者資料和服務狀態
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                  <HealthIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle1">健康記錄</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    記錄和追蹤健康數據
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                  <ScheduleIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle1">出勤管理</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    管理打卡和出勤統計
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                  <EventIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle1">活動規劃</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    安排和管理各項活動
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

