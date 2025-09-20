import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const HealthRecords: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        健康記錄管理
      </Typography>
      
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1">
          健康記錄管理功能開發中...
        </Typography>
      </Paper>
    </Box>
  );
};

export default HealthRecords;

