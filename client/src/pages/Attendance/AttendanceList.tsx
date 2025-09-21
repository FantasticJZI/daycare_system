import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip, 
  IconButton, 
  Avatar,
  Tooltip,
  Alert,
  LinearProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  Login as CheckInIcon,
  Logout as CheckOutIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AccessTime as TimeIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import { isDemoMode, mockElderly, mockAttendance } from '../../utils/mockData';

const AttendanceList: React.FC = () => {
  // 獲取今日出勤統計
  const getTodayStats = () => {
    const totalElderly = mockElderly.length;
    const checkedIn = mockAttendance.length;
    const checkedOut = 0;
    const attendanceRate = totalElderly > 0 ? Math.round((checkedIn / totalElderly) * 100) : 0;
    
    return {
      total: totalElderly,
      checkedIn,
      checkedOut,
      attendanceRate,
      late: Math.floor(checkedIn * 0.1),
      absent: totalElderly - checkedIn
    };
  };

  const todayStats = getTodayStats();

  // 獲取出勤狀態
  const getAttendanceStatus = (elderlyId: string) => {
    const attendance = mockAttendance.find(a => a.elderly === elderlyId);
    if (attendance) {
      return attendance.checkOutTime ? 'checked_out' : 'checked_in';
    }
    return 'absent';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked_in': return 'success';
      case 'checked_out': return 'info';
      case 'late': return 'warning';
      case 'absent': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'checked_in': return '已入場';
      case 'checked_out': return '已離場';
      case 'late': return '遲到';
      case 'absent': return '未到';
      default: return '未知';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">出勤管理</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<QrCodeIcon />}
            onClick={() => console.log('QR掃描')}
          >
            QR掃描
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => console.log('手動打卡')}
          >
            手動打卡
          </Button>
        </Box>
      </Box>

      {/* 出勤統計卡片 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary">總人數</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {todayStats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography color="textSecondary">已入場</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {todayStats.checkedIn}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimeIcon color="info" sx={{ mr: 1 }} />
                <Typography color="textSecondary">已離場</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {todayStats.checkedOut}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography color="textSecondary">遲到</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {todayStats.late}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon color="error" sx={{ mr: 1 }} />
                <Typography color="textSecondary">缺席</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {todayStats.absent}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary">出勤率</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {todayStats.attendanceRate}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={todayStats.attendanceRate} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 出勤提醒 */}
      {todayStats.absent > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            ⚠️ 出勤提醒
          </Typography>
          <Typography variant="body2">
            有 {todayStats.absent} 位長者尚未到場，請確認是否請假或聯繫家屬。
      </Typography>
        </Alert>
      )}

      {/* 出勤列表 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>長者資訊</TableCell>
              <TableCell>入場時間</TableCell>
              <TableCell>離場時間</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockElderly.map((elderly) => {
              const status = getAttendanceStatus(elderly._id);
              const attendance = mockAttendance.find(a => a.elderly === elderly._id);
              
              return (
                <TableRow key={elderly._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {elderly.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {elderly.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {elderly.gender === 'male' ? '男' : '女'} • {new Date().getFullYear() - new Date(elderly.birthDate).getFullYear()}歲
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {attendance ? new Date(attendance.checkInTime).toLocaleTimeString('zh-TW') : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {attendance?.checkOutTime ? new Date(attendance.checkOutTime).toLocaleTimeString('zh-TW') : '-'}
        </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(status)}
                      color={getStatusColor(status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {status === 'absent' && (
                        <Tooltip title="打卡入場">
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => console.log('打卡入場', elderly._id)}
                          >
                            <CheckInIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {status === 'checked_in' && (
                        <Tooltip title="打卡離場">
                          <IconButton 
                            size="small" 
                            color="info"
                            onClick={() => console.log('打卡離場', elderly._id)}
                          >
                            <CheckOutIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AttendanceList;

