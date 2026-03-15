// src/pages/Register.jsx
// 该页面还未启用
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import { fetcher } from '../utils/fetcher';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSuccess(''); setError('');
    try {
      await fetcher('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setSuccess('注册成功，请等待管理员审核。');
    } catch (err) {
      setError(err.message || '注册失败');
    }
  };

  return (
    <Box sx={{ width: '100vw', height: '100vh', bgcolor: '#f7f7f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, borderRadius: 3, minWidth: 340, maxWidth: 400 }}>
        <Typography variant="h5" fontWeight={600} mb={2}>用户注册</Typography>
        <form onSubmit={handleSubmit}>
          <TextField name="username" label="用户名" fullWidth margin="normal" value={form.username} onChange={handleChange} required />
          <TextField name="email" label="邮箱" fullWidth margin="normal" value={form.email} onChange={handleChange} required />
          <TextField name="password" label="密码" fullWidth margin="normal" type="password" value={form.password} onChange={handleChange} required />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>注册</Button>
          {success && <Typography color="success.main">{success}</Typography>}
          {error && <Typography color="error.main">{error}</Typography>}
        </form>
      </Paper>
    </Box>
  );
}
