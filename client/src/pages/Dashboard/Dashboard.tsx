import React, { useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Paper } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchElderlyStats } from '../../store/slices/elderlySlice';

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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {getGreeting()}，{user?.name}！
      </Typography>
      
      <Grid container spacing={3}>
        {stats && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    總長者數
                  </Typography>
                  <Typography variant="h4">
                    {stats.total || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    服務中
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats.active || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    等待中
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stats.waiting || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    暫停服務
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {stats.suspended || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              快速操作
            </Typography>
            <Typography variant="body2" color="text.secondary">
              歡迎使用日照系統！您可以透過左側選單進行各項管理操作。
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

