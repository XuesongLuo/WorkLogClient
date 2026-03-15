// src/pages/AdminUserAudit.jsx
// 该页面还未启用
import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Paper, Stack } from '@mui/material';
import { fetcher } from '../utils/fetcher';

export default function AdminUserAudit() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      const data = await fetcher('/api/users?status=pending');
      setUsers(data);
    } catch (err) {
      setError('加载待审核用户失败');
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleAction = async (id, status) => {
    try {
      await fetcher(`/api/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      loadUsers();
    } catch (err) {
      setError('操作失败');
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={600} mb={2}>待审核用户</Typography>
      {error && <Typography color="error">{error}</Typography>}
      {users.map(u => (
        <Paper key={u.id} sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography>用户名：{u.username}</Typography>
              <Typography>邮箱：{u.email}</Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button color="success" variant="contained" onClick={() => handleAction(u.id, 'active')}>通过</Button>
              <Button color="error" variant="outlined" onClick={() => handleAction(u.id, 'rejected')}>拒绝</Button>
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}
