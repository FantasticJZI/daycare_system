import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const AttendanceList: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        出勤管理
      </Typography>
      
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1">
          出勤管理功能開發中...
        </Typography>
      </Paper>
    </Box>
  );
};

export default AttendanceList;

