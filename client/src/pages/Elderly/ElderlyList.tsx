import React, { useEffect } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Avatar, Tooltip } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon, Phone as PhoneIcon, Home as HomeIcon } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchElderly } from '../../store/slices/elderlySlice';
import { isDemoMode, mockElderly } from '../../utils/mockData';

const ElderlyList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { elderly } = useSelector((state: RootState) => state.elderly);

  useEffect(() => {
    dispatch(fetchElderly({ page: 1, limit: 10 }));
  }, [dispatch]);

  // 獲取演示模式的長者數據
  const getElderlyData = () => {
    if (isDemoMode()) return mockElderly;
    return elderly || [];
  };

  const elderlyData = getElderlyData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'waiting': return 'warning';
      case 'suspended': return 'error';
      case 'terminated': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '服務中';
      case 'waiting': return '等待中';
      case 'suspended': return '暫停服務';
      case 'terminated': return '終止';
      default: return status;
    }
  };

  const getCareLevelText = (level: number) => {
    switch (level) {
      case 1: return '輕度';
      case 2: return '中度';
      case 3: return '重度';
      case 4: return '極重度';
      default: return '未評估';
    }
  };

  const getCareLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'success';
      case 2: return 'info';
      case 3: return 'warning';
      case 4: return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">長者管理</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => console.log('新增長者')}
        >
          新增長者
        </Button>
      </Box>

      {/* 統計卡片 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="primary">{elderlyData.length}</Typography>
          <Typography variant="body2" color="text.secondary">總長者數</Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="success.main">
            {isDemoMode() ? mockElderly.filter(e => e.serviceStatus === 'active').length : 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">服務中</Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="warning.main">
            {isDemoMode() ? mockElderly.filter(e => e.serviceStatus === 'waiting').length : 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">等待中</Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="error.main">
            {isDemoMode() ? mockElderly.filter(e => e.serviceStatus === 'suspended').length : 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">暫停服務</Typography>
        </Paper>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>長者資訊</TableCell>
              <TableCell>聯絡方式</TableCell>
              <TableCell>年齡/性別</TableCell>
              <TableCell>服務狀態</TableCell>
              <TableCell>照護等級</TableCell>
              <TableCell>緊急聯絡人</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {elderlyData.map((elder) => (
              <TableRow key={elder._id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {elder.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {elder.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {elder.idNumber}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <PhoneIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2">{elder.phone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <HomeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {elder.address.length > 20 ? `${elder.address.substring(0, 20)}...` : elder.address}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body1">
                    {new Date().getFullYear() - new Date(elder.birthDate).getFullYear()} 歲
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {elder.gender === 'male' ? '男' : '女'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(elder.serviceStatus)}
                    color={getStatusColor(elder.serviceStatus) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={`等級 ${(elder as any).careAssessment?.level || 1} - ${getCareLevelText((elder as any).careAssessment?.level || 1)}`}
                    color={getCareLevelColor((elder as any).careAssessment?.level || 1) as any}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    {elder.emergencyContacts.slice(0, 2).map((contact, index) => (
                      <Box key={index}>
                        <Typography variant="body2" fontWeight="bold">
                          {contact.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {contact.relationship} - {contact.phone}
                        </Typography>
                      </Box>
                    ))}
                    {elder.emergencyContacts.length > 2 && (
                      <Typography variant="caption" color="text.secondary">
                        +{elder.emergencyContacts.length - 2} 更多
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="查看詳情">
                      <IconButton size="small" onClick={() => console.log('查看', elder._id)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="編輯">
                      <IconButton size="small" onClick={() => console.log('編輯', elder._id)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="刪除">
                      <IconButton 
                        size="small" 
                        onClick={() => console.log('刪除', elder._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ElderlyList;