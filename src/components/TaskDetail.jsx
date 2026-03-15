// src/components/TaskDetail.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Stack,
  IconButton,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useSnackbar } from 'notistack';
import Editor from './Editor';
import TaskPane from './TaskPane';
import { useTasks } from '../contexts/TaskStore';
import { useTranslation } from 'react-i18next';

export default function TaskDetail({ _id: propId, embedded = false, onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editorReady, setEditorReady] = useState(false);
  const { taskMap, api: taskApi } = useTasks();
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const routeTask = location.state?.task;


  const { _id: routeId } = useParams();
  // 最终 ID：优先使用 props 传入，其次是路由参数
  const _id = propId ?? routeTask?._id ?? routeId;

  useEffect(() => {
    // 先看缓存（taskMap），再决定是否要远程加载
    const cachedTask = taskMap[_id];
    if (cachedTask) {
      setTask({ ...cachedTask });
      setLoading(false);
      setTimeout(() => setEditorReady(true), 150);
      taskApi.getTaskDescription(_id).then(descData => {
        setTask(prev => ({ ...prev, description: descData.description }));
      });
    } else {
      setLoading(true);
      Promise.all([
        taskApi.getTask(_id),
        taskApi.getTaskDescription(_id),
      ])
      .then(([taskData, descData]) => {
        setTask({ ...taskData, description: descData.description });
        setLoading(false);
        setTimeout(() => setEditorReady(true), 150);
      })
      .catch(err => {
        console.error('获取任务失败', err);
        setLoading(false);
        if (embedded && onClose) onClose();
      });
    }
  }, [_id, taskMap, taskApi]);

  const handleEditClick = () => {
    if (!task) return;
    const { description, ...taskWithoutDescription } = task;
    // 使用 requestAnimationFrame 延迟执行，避免阻塞当前事件循环
    requestAnimationFrame(() => {
      if (embedded) {
        setTimeout(() => {
          onClose?.({ _id: task._id, mode: 'edit', task: taskWithoutDescription });   // 通知父组件切换到编辑表单
        }, 0);
      } else {
        setTimeout(() => {
          navigate(`/task/edit/${task._id}`, { state: { task: taskWithoutDescription } });     // 常规页面跳转
        }, 0);      
      }
    });
  };

  const handleDelete = () => {
    const doDelete = async () => {       // 删除函数
      try {
        await taskApi.remove(_id);
        enqueueSnackbar(t('viewPro.alreadyDel'), { variant: 'success' });
      } catch (err) {
        enqueueSnackbar(t('viewPro.delFailed&Rec'), { variant: 'error' });
      }
    };
    
    if (embedded) {
      onClose?.(doDelete);               // 1 先关闭；2 把 doDelete 交给 Home
    } else {
      doDelete().then(() => navigate('/'));
    }
  };

  function hashDesc(desc) {
    if (!desc) return 'empty';
    return `${desc.length}-${desc.slice(0, 16)}-${desc.slice(-16)}`;
  }


  if (loading) {
    return embedded ? null : <Typography sx={{ mt: 4, textAlign: 'center' }}>{t('viewPro.loading')}</Typography>;
  }
  if (!task) {
    return embedded ? null : <Typography sx={{ mt: 4, textAlign: 'center' }}>{t('viewPro.unknown')}</Typography>;
  }
  return (
    <TaskPane embedded={embedded}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'auto', 
        width: embedded ? '100%' : '80%',
        maxWidth: embedded ? 'none' : '100vw',
        minWidth: 0,
        justifyContent: embedded ? 'flex-start' : 'flex-start', 
        overflow: 'hidden',
        mx: embedded ? 0 : 'auto',
        mt: 0,       
        mb: embedded ? 0 : 2, 
        pt: 0,
       }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5" textAlign="center" gutterBottom={false} sx={{ mb: 0 }}>
            {t('viewPro.proDetail')}
            {embedded && (
              <IconButton onClick={() => navigate(`/task/${task._id}`, { state: { task } } )}>
                <OpenInNewIcon />
              </IconButton>
            )}
          </Typography>
          <Stack direction="row" spacing={1}>
            {embedded && (
              <IconButton color="error" onClick={() => setConfirmDeleteOpen(true)}>
                <DeleteIcon />
              </IconButton>
            )}
            {embedded && ( 
              <IconButton color="primary" onClick={handleEditClick}>
                <EditIcon />
              </IconButton>
            )}
            {embedded && (  
              <IconButton onClick={
              () => {onClose?.()}
              }>
                <CancelIcon />
              </IconButton>
            )}
          </Stack>

        </Box>
        <Divider sx={{ mb: 2 }} />

        <Grid 
          container
          spacing={2}
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(6, 1fr)',
              md: 'repeat(8, 1fr)',
              lg: 'repeat(12, 1fr)',
            },
          }}
        >
          {/* 第一行：地址-城市-州-邮编  项目类型 */}
          <Grid item sx={{ gridColumn: { xs: 'span 1', sm: 'span 12', md: 'span 12', lg: 'span 8' } }}>
            <Typography>
              <strong>{t('viewPro.location')}</strong>
              {`${task.address ?? ''}, ${task.city ?? ''}, ${task.state ?? ''}, ${task.zipcode ?? ''}`}
            </Typography>
          </Grid>
          <Grid item sx={{ gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 2', lg: 'span 4' }, textAlign: 'right' }}>
            <Typography><strong>{t('viewPro.type')}</strong>{task.type}</Typography>
          </Grid>
          {/* 第二行：房屋年份 保险公司 */}
          <Grid item sx={{ gridColumn: { xs: 'span 1', sm: 'span 3', md: 'span 3', lg: 'span 6' } }}>
            <Typography><strong>{t('viewPro.year')}</strong>{task.year ?? t('viewPro.notFilled')}</Typography>
          </Grid>
          <Grid item sx={{ gridColumn: { xs: 'span 1', sm: 'span 3', md: 'span 3', lg: 'span 6' }, textAlign: 'right' }}>
            <Typography><strong>{t('viewPro.insurance')}</strong>{task.insurance ?? t('viewPro.notFilled')}</Typography>
          </Grid>
          {/* 第三行：项目推荐人 项目负责人 公司 */}
          <Grid item sx={{ gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 2', lg: 'span 4' } }}>
            <Typography><strong>{t('viewPro.manager')}</strong>{task.manager}</Typography>
          </Grid>
          <Grid item sx={{ gridColumn: { xs: 'span 1', sm: 'span 3', md: 'span 2', lg: 'span 4' }, textAlign: 'center' }}>
            <Typography><strong>{t('viewPro.referrer')}</strong>{task.referrer}</Typography>
          </Grid>
          <Grid item sx={{ gridColumn: { xs: 'span 1', sm: 'span 3', md: 'span 3', lg: 'span 4' }, textAlign: 'right' }}>
            <Typography><strong>{t('viewPro.company')}</strong>{task.company ?? t('viewPro.notFilled')}</Typography>
          </Grid>
          {/* 第四行：开始日期 结束日期 */}
          <Grid item sx={{ gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 6', lg: 'span 6' } }}>
            <Typography><strong>{t('viewPro.startDate')}</strong>{task.start ? new Date(task.start).toLocaleDateString() : t('viewPro.notFilled')}</Typography>
          </Grid>
          <Grid item sx={{ gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 6', lg: 'span 6' }, textAlign: 'right' }}>
            <Typography><strong>{t('viewPro.endDate')}</strong>{task.end ? new Date(task.end).toLocaleDateString() : t('viewPro.notFilled')}</Typography>
          </Grid>
        </Grid>
          
        <Divider sx={{ my: 2 }} />
        <Typography gutterBottom>
        <strong>{t('viewPro.editorTitle')}</strong>
        </Typography>
        <Box sx={{ mt: 2 }}>
          {(task && typeof task.description === 'string' && editorReady) ? (
            <Editor 
              key={_id + '-' + hashDesc(task.description)} 
              value={task.description} 
              readOnly 
              hideToolbar 
              maxHeightOffset={embedded ? 40 : 100}
            />
          ) : (
            <Typography variant="body2" sx={{ color: '#aaa' }}>{t('viewPro.editorLoading')}</Typography>
          )}
        </Box>

        {!embedded && (
          <Stack direction="row" spacing={2} mt="auto" pt={1} justifyContent="center">
            <Button 
              variant={embedded ? 'outlined' : 'text'}
              size={embedded ? 'medium' : 'large'} 
              onClick={handleEditClick}
            >
              {t('viewPro.edit')}
            </Button>
            <Button
              variant={embedded ? 'outlined' : 'text'}
              size={embedded ? 'medium' : 'large'} 
              color="error"
              onClick={() => setConfirmDeleteOpen(true)}
            >
              {t('viewPro.delete')}
            </Button>
          </Stack>
        )}
      </Box>

      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle> {t('viewPro.deleteCheck')}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>{t('viewPro.cancel')}</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            {t('viewPro.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </TaskPane>       
  );
}