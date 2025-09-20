import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const FamilyDashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        家屬專區
      </Typography>
      
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1">
          家屬專區功能開發中...
        </Typography>
      </Paper>
    </Box>
  );
};

export default FamilyDashboard;

