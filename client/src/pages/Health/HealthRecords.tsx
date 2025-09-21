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
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tooltip,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  MonitorHeart as HeartIcon,
  LocalHospital as HospitalIcon,
  Medication as MedicationIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { isDemoMode, mockElderly, mockHealthRecords } from '../../utils/mockData';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`health-tabpanel-${index}`}
      aria-labelledby={`health-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const HealthRecords: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedElderly, setSelectedElderly] = useState<string>('');
  const [newRecord, setNewRecord] = useState({
    recordType: 'vital_signs',
    systolic: '',
    diastolic: '',
    heartRate: '',
    temperature: '',
    notes: ''
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewRecord({
      recordType: 'vital_signs',
      systolic: '',
      diastolic: '',
      heartRate: '',
      temperature: '',
      notes: ''
    });
  };

  const handleSubmitRecord = () => {
    console.log('提交健康記錄:', newRecord);
    handleCloseDialog();
  };

  // 獲取健康異常的長者
  const getAbnormalHealth = () => {
    return mockElderly.filter(elderly => {
      // 模擬一些異常情況
      const random = Math.random();
      return random > 0.7; // 30%的長者有異常
    });
  };

  const abnormalElderly = getAbnormalHealth();

  // 獲取今日健康記錄
  const todayRecords = mockHealthRecords;

  // 健康統計
  const healthStats = {
    totalRecords: todayRecords.length,
    normalCount: todayRecords.filter(r => r.recordType === 'vital_signs').length,
    abnormalCount: abnormalElderly.length,
    medicationCount: 5 // 模擬數據
  };

  const getHealthStatusColor = (elderly: any) => {
    const random = Math.random();
    if (random > 0.8) return 'error';
    if (random > 0.6) return 'warning';
    return 'success';
  };

  const getHealthStatusText = (elderly: any) => {
    const random = Math.random();
    if (random > 0.8) return '異常';
    if (random > 0.6) return '注意';
    return '正常';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">健康記錄管理</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          新增記錄
        </Button>
      </Box>

      {/* 健康統計卡片 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <HeartIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary">今日記錄</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {healthStats.totalRecords}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                生命徵象記錄
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography color="textSecondary">正常</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {healthStats.normalCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                健康狀況良好
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography color="textSecondary">需注意</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {healthStats.abnormalCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                需要關注的長者
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MedicationIcon color="info" sx={{ mr: 1 }} />
                <Typography color="textSecondary">用藥記錄</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {healthStats.medicationCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                今日用藥記錄
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 異常警報 */}
      {abnormalElderly.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            ⚠️ 健康異常提醒
          </Typography>
          <Typography variant="body2">
            有 {abnormalElderly.length} 位長者需要特別關注，請及時檢查健康狀況。
          </Typography>
        </Alert>
      )}

      {/* 標籤頁 */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="健康記錄標籤">
          <Tab label="今日記錄" />
          <Tab label="健康監控" />
          <Tab label="異常警報" />
          <Tab label="用藥記錄" />
        </Tabs>

        {/* 今日記錄 */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>長者</TableCell>
                  <TableCell>記錄類型</TableCell>
                  <TableCell>血壓</TableCell>
                  <TableCell>心跳</TableCell>
                  <TableCell>體溫</TableCell>
                  <TableCell>記錄時間</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {todayRecords.map((record) => {
                  const elderly = mockElderly.find(e => e._id === record.elderly);
                  return (
                    <TableRow key={record._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {elderly?.name.charAt(0) || '?'}
                          </Avatar>
                          <Typography variant="subtitle1">
                            {elderly?.name || '未知長者'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label="生命徵象" color="primary" size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {(record.vitalSigns as any)?.bloodPressure?.systolic}/{(record.vitalSigns as any)?.bloodPressure?.diastolic}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {(record.vitalSigns as any)?.heartRate?.value} bpm
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {(record.vitalSigns as any)?.temperature?.value}°C
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(record.recordedAt).toLocaleTimeString('zh-TW')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="查看詳情">
                            <IconButton size="small">
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="編輯">
                            <IconButton size="small">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* 健康監控 */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {mockElderly.map((elderly) => (
              <Grid item xs={12} sm={6} md={4} key={elderly._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        健康狀態
                      </Typography>
                      <Chip
                        label={getHealthStatusText(elderly)}
                        color={getHealthStatusColor(elderly) as any}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          血壓
                        </Typography>
                        <Typography variant="body2">
                          120/80 mmHg
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          心跳
                        </Typography>
                        <Typography variant="body2">
                          72 bpm
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          體溫
                        </Typography>
                        <Typography variant="body2">
                          36.5°C
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          血糖
                        </Typography>
                        <Typography variant="body2">
                          正常
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* 異常警報 */}
        <TabPanel value={tabValue} index={2}>
          {abnormalElderly.length > 0 ? (
            <Grid container spacing={2}>
              {abnormalElderly.map((elderly) => (
                <Grid item xs={12} md={6} key={elderly._id}>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {elderly.name}
                        </Typography>
                        <Typography variant="body2">
                          需要關注健康狀況
                        </Typography>
                      </Box>
                      <Button size="small" variant="outlined">
                        查看詳情
                      </Button>
                    </Box>
                  </Alert>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" color="success.main">
                目前沒有異常警報
              </Typography>
              <Typography variant="body2" color="text.secondary">
                所有長者健康狀況良好
      </Typography>
            </Box>
          )}
        </TabPanel>

        {/* 用藥記錄 */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <MedicationIcon sx={{ fontSize: 64, color: 'info.main', mb: 2 }} />
            <Typography variant="h6" color="info.main">
              用藥記錄功能
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              記錄和管理長者用藥情況
        </Typography>
            <Button variant="outlined" startIcon={<AddIcon />}>
              新增用藥記錄
            </Button>
          </Box>
        </TabPanel>
      </Paper>

      {/* 新增記錄對話框 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>新增健康記錄</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>選擇長者</InputLabel>
                <Select
                  value={selectedElderly}
                  onChange={(e) => setSelectedElderly(e.target.value)}
                  label="選擇長者"
                >
                  {mockElderly.map((elderly) => (
                    <MenuItem key={elderly._id} value={elderly._id}>
                      {elderly.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="收縮壓 (mmHg)"
                value={newRecord.systolic}
                onChange={(e) => setNewRecord({ ...newRecord, systolic: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="舒張壓 (mmHg)"
                value={newRecord.diastolic}
                onChange={(e) => setNewRecord({ ...newRecord, diastolic: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="心跳 (bpm)"
                value={newRecord.heartRate}
                onChange={(e) => setNewRecord({ ...newRecord, heartRate: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="體溫 (°C)"
                value={newRecord.temperature}
                onChange={(e) => setNewRecord({ ...newRecord, temperature: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="備註"
                value={newRecord.notes}
                onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSubmitRecord} variant="contained">儲存記錄</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HealthRecords;