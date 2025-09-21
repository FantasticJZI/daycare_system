import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  IconButton, 
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as ViewIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { isDemoMode, mockElderly, mockActivities } from '../../utils/mockData';

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
      id={`activity-tabpanel-${index}`}
      aria-labelledby={`activity-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ActivityList: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // 活動統計
  const activityStats = {
    total: mockActivities.length,
    active: mockActivities.filter(a => a.status === 'active').length,
    completed: mockActivities.filter(a => a.status === 'completed').length,
    totalParticipants: mockActivities.reduce((sum, a) => sum + a.currentParticipants, 0)
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'physical': return 'primary';
      case 'creative': return 'secondary';
      case 'social': return 'success';
      case 'educational': return 'info';
      default: return 'default';
    }
  };

  const getActivityTypeText = (type: string) => {
    switch (type) {
      case 'physical': return '體能活動';
      case 'creative': return '創意活動';
      case 'social': return '社交活動';
      case 'educational': return '教育活動';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '進行中';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return status;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">活動管理</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          新增活動
        </Button>
      </Box>

      {/* 活動統計卡片 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EventIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary">總活動數</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {activityStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                本週活動
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PlayIcon color="success" sx={{ mr: 1 }} />
                <Typography color="textSecondary">進行中</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {activityStats.active}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                正在進行
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon color="info" sx={{ mr: 1 }} />
                <Typography color="textSecondary">已完成</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {activityStats.completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                已完成活動
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon color="warning" sx={{ mr: 1 }} />
                <Typography color="textSecondary">參與人數</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {activityStats.totalParticipants}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                總參與人次
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 標籤頁 */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="活動管理標籤">
          <Tab label="今日活動" />
          <Tab label="活動列表" />
          <Tab label="參與統計" />
          <Tab label="活動規劃" />
        </Tabs>

        {/* 今日活動 */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {mockActivities.map((activity) => (
              <Grid item xs={12} md={6} key={activity._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {activity.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activity.description}
                        </Typography>
                      </Box>
                      <Chip
                        label={getStatusText(activity.status)}
                        color={getStatusColor(activity.status) as any}
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={getActivityTypeText(activity.type)}
                        color={getActivityTypeColor(activity.type) as any}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          時間
                        </Typography>
                        <Typography variant="body2">
                          {activity.startTime} - {activity.endTime}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          地點
                        </Typography>
                        <Typography variant="body2">
                          {activity.location}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          參與人數
                        </Typography>
                        <Typography variant="caption">
                          {activity.currentParticipants}/{activity.maxParticipants}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(activity.currentParticipants / activity.maxParticipants) * 100}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        variant="outlined"
                      >
                        查看詳情
                      </Button>
                      {activity.status === 'active' && (
                        <Button
                          size="small"
                          startIcon={<StopIcon />}
                          variant="contained"
                          color="warning"
                        >
                          結束活動
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* 活動列表 */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={2}>
            {mockActivities.map((activity) => (
              <Grid item xs={12} key={activity._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <EventIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {activity.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {activity.startTime} - {activity.endTime} • {activity.location}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={getActivityTypeText(activity.type)}
                          color={getActivityTypeColor(activity.type) as any}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={getStatusText(activity.status)}
                          color={getStatusColor(activity.status) as any}
                          size="small"
                        />
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
                          <Tooltip title="刪除">
                            <IconButton size="small" color="error">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* 參與統計 */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {mockActivities.map((activity) => (
              <Grid item xs={12} md={6} key={activity._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {activity.name}
      </Typography>
      
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          參與率
                        </Typography>
                        <Typography variant="body2">
                          {Math.round((activity.currentParticipants / activity.maxParticipants) * 100)}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(activity.currentParticipants / activity.maxParticipants) * 100}
                      />
                    </Box>
                    
                    <List dense>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.main' }}>
                            <PeopleIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="參與人數"
                          secondary={`${activity.currentParticipants} 人`}
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'info.main' }}>
                            <TrendingUpIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="容納上限"
                          secondary={`${activity.maxParticipants} 人`}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* 活動規劃 */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <EventIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" color="primary.main">
              活動規劃功能
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              規劃和管理長期活動安排
        </Typography>
            <Button variant="outlined" startIcon={<AddIcon />}>
              新增活動規劃
            </Button>
          </Box>
        </TabPanel>
      </Paper>

      {/* 新增活動對話框 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>新增活動</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="活動名稱"
                placeholder="輸入活動名稱"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="活動描述"
                placeholder="描述活動內容和目的"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>活動類型</InputLabel>
                <Select label="活動類型">
                  <MenuItem value="physical">體能活動</MenuItem>
                  <MenuItem value="creative">創意活動</MenuItem>
                  <MenuItem value="social">社交活動</MenuItem>
                  <MenuItem value="educational">教育活動</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="地點"
                placeholder="活動地點"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="開始時間"
                type="time"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="結束時間"
                type="time"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="最大參與人數"
                type="number"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleCloseDialog} variant="contained">儲存活動</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActivityList;

