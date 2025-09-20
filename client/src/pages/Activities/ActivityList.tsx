import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ActivityList: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        活動管理
      </Typography>
      
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1">
          活動管理功能開發中...
        </Typography>
      </Paper>
    </Box>
  );
};

export default ActivityList;

