import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const FamilyElderlyDetail: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        長者詳細資料
      </Typography>
      
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1">
          家屬查看長者詳細資料功能開發中...
        </Typography>
      </Paper>
    </Box>
  );
};

export default FamilyElderlyDetail;

