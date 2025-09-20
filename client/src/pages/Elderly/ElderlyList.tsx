import React, { useEffect } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchElderly } from '../../store/slices/elderlySlice';

const ElderlyList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { elderly } = useSelector((state: RootState) => state.elderly);
  
  // TODO: 使用loading和pagination狀態
  // const { loading, pagination } = useSelector((state: RootState) => state.elderly);

  useEffect(() => {
    dispatch(fetchElderly({ page: 1, limit: 10 }));
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'waiting': return 'warning';
      case 'suspended': return 'error';
      case 'terminated': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '服務中';
      case 'waiting': return '等待中';
      case 'suspended': return '暫停';
      case 'terminated': return '終止';
      default: return status;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">長者管理</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {/* 新增長者邏輯 */}}
        >
          新增長者
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>姓名</TableCell>
              <TableCell>身分證字號</TableCell>
              <TableCell>年齡</TableCell>
              <TableCell>性別</TableCell>
              <TableCell>服務狀態</TableCell>
              <TableCell>聯絡電話</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {elderly.map((elder) => (
              <TableRow key={elder._id}>
                <TableCell>{elder.name}</TableCell>
                <TableCell>{elder.idNumber}</TableCell>
                <TableCell>{new Date().getFullYear() - new Date(elder.birthDate).getFullYear()}</TableCell>
                <TableCell>{elder.gender === 'male' ? '男' : '女'}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(elder.serviceStatus)}
                    color={getStatusColor(elder.serviceStatus) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{elder.phone}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => {/* 編輯邏輯 */}}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => {/* 刪除邏輯 */}}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ElderlyList;

