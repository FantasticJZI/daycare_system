import React from 'react';
import { Box, Typography, Paper, Grid, Chip, Avatar } from '@mui/material';
import { useParams } from 'react-router-dom';

const ElderlyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        長者詳細資料
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar sx={{ width: 100, height: 100, mb: 2 }} />
              <Typography variant="h6">長者姓名</Typography>
              <Typography variant="body2" color="text.secondary">
                身分證字號：A123456789
              </Typography>
              <Chip label="服務中" color="success" sx={{ mt: 1 }} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              基本資料
            </Typography>
            <Typography variant="body2">
              這裡將顯示長者的詳細資料...
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ElderlyDetail;

