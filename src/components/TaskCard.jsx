// src/components/TaskCard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  IconButton,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTasks } from '../contexts/TaskStore';

export default function TaskCard({ task, onClose }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { api } = useTasks();
  const [desc, setDesc] = useState('');
  const [descLoading, setDescLoading] = useState(true);
  const [descError, setDescError] = useState(false);

  // 仅在弹窗打开后才加载富文本
  useEffect(() => {
    let unmounted = false;
    if (!task || !task._id) return;
    setDescLoading(true);
    setDescError(false);
    api.getTaskDescription(task._id)
      .then(res => {
        if (!unmounted) {
          setDesc(res.description);
          setDescLoading(false);
        }
      })
      .catch(() => {
        if (!unmounted) {
          setDescError(true);
          setDescLoading(false);
        }
      });
    return () => { unmounted = true; };
  }, [task, api]);

  if (!task) {
    return (
      <Box sx={{ minWidth: 350, p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">{t('viewPro.unknown')}</Typography>
      </Box>
    );
  }

  const address = [
    task.address || '',
    task.city || '',
    task.zipcode || ''
  ].filter(Boolean).join(', ');

  return (
    <Box sx={{ position: 'relative', p: 0 }}>
      <Paper sx={{ p: 4, maxWidth: '60vw', margin: '0 auto', minWidth: 350, position: 'relative' }}>
        {/* 关闭按钮和编辑按钮 */}
        {onClose && (
          <>
            <IconButton
              aria-label="关闭"
              onClick={onClose}
              sx={{ position: 'absolute', top: 10, right: 10 }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
            <IconButton
              aria-label="编辑"
              color="primary"
              onClick={() => {
                onClose?.(); // 可选：弹窗先关闭
                navigate(`/task/edit/${task._id}`, { state: { task } });
              }}
              sx={{ position: 'absolute', top: 10, right: 48 }}
              size="small"
            >
              <EditIcon />
            </IconButton>
          </>
        )}

        <Typography variant="h5" gutterBottom>
          {task.title || 'PROJECT INFO'}
        </Typography>
        <Divider sx={{ mb: 2 }} />
         {/* 第一行：地址 */}
         <Box sx={{ mb: 1 }}>
          <Typography>
            <strong>{t('viewPro.location')}</strong>
            {address || '--'}
          </Typography>
        </Box>

        {/* 第二行：年份、保险公司、项目类型 */}
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid item xs={4}>
            <Typography>
              <strong>{t('viewPro.year')}</strong>{task.year || '--'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography>
              <strong>{t('viewPro.insurance')}</strong>{task.insurance || '--'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography>
              <strong>{t('viewPro.type')}</strong>{task.type || '--'}
            </Typography>
          </Grid>
        </Grid>

        {/* 第三行：项目管理人、项目推荐人、公司 */}
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid item xs={4}>
            <Typography>
              <strong>{t('viewPro.manager')}</strong>{task.manager || '--'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography>
              <strong>{t('viewPro.referrer')}</strong>{task.referrer || task.applicant || '--'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography>
              <strong>{t('viewPro.company')}</strong>{task.company || '--'}
            </Typography>
          </Grid>
        </Grid>

        {/* 第四行：开始日期、结束日期 */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography>
              <strong>{t('viewPro.startDate')}</strong>
              {task.start ? new Date(task.start).toLocaleDateString() : '--'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <strong>{t('viewPro.endDate')}</strong>
              {task.end ? new Date(task.end).toLocaleDateString() : '--'}
            </Typography>
          </Grid>
        </Grid>

         {/* 第五行：详细描述 */}
        <Typography sx={{ mb: 1 }}>
          <strong>{t('viewPro.editorTitle')}</strong>
        </Typography>
        <Box
          sx={{
            border: '1px solid #eee',
            borderRadius: 1,
            p: 2,
            background: '#fafbfc',
            minHeight: 100,
            maxHeight: 240,
            overflowY: 'auto',
            fontSize: 14,
            whiteSpace: 'pre-line',
            wordBreak: 'break-all',
            resize: 'vertical' // 支持用户手动拉伸
          }}
        >
          {descLoading ? (
            <Box sx={{ color: '#aaa', textAlign: 'center', mt: 2 }}>
              <CircularProgress size={22} />{t('viewPro.editorLoading')}
            </Box>
          ) : descError ? (
            <span style={{ color: 'red' }}>{t('viewPro.editorLoadingfailed')}</span>
          ) : (
            <span dangerouslySetInnerHTML={{
              __html: desc || '<span style="color:#aaa;">No description</span>'
            }} />
          )}
        </Box>
        
      </Paper>
    </Box>
  );
}
