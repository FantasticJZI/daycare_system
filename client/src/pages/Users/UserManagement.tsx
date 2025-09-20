import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const UserManagement: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        用戶管理
      </Typography>
      
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1">
          用戶管理功能開發中...
        </Typography>
      </Paper>
    </Box>
  );
};

export default UserManagement;

