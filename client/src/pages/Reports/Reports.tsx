import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Reports: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        報表統計
      </Typography>
      
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1">
          報表統計功能開發中...
        </Typography>
      </Paper>
    </Box>
  );
};

export default Reports;

