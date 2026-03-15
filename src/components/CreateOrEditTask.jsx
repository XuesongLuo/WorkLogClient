// src/pages/CreateOrEditTask.jsx
import React, { useEffect, useState, useCallback, useRef, lazy, Suspense } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  IconButton,
  Grid,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogActions
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker }      from '@mui/x-date-pickers';
import { AdapterDateFns }      from '@mui/x-date-pickers/AdapterDateFns';
import { useSnackbar } from 'notistack';
import { useLoading } from '../contexts/LoadingContext';
import { useTasks } from '../contexts/TaskStore';
import { typeApi } from '../contexts/TypeStore';
import TaskPane from './TaskPane';
import { useTranslation } from 'react-i18next';

const LazyEditor = lazy(() => 
  import('./Editor').then(module => ({
    default: React.memo(module.default)
  }))
);

function formatDateToYMD(date) {
  if (!date) return null;
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const types = ['室外工程', '室内工程', '后院施工', '除霉处理'];

export default function CreateOrEditTask({ _id: propId, task: propTask, embedded = false, onClose, onSuccess }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const editorRef = useRef();
  const { start: startLoading, end: endLoading } = useLoading();
  const [types, setTypes] = useState([]);
  const taskFromRoute = location.state?.task;

  const { _id: routeId } = useParams();
  // 最终 ID：优先使用 props 传入，其次是路由参数
  const _id = propId ?? taskFromRoute?._id ?? (routeId !== 'new' ? routeId : undefined);
  // 判断是否是“新建”任务
  const isCreateMode = routeId === 'new' || (embedded && !_id);
  // 编辑模式 = 非创建模式，且 _id 存在
  const isEdit = Boolean(_id) && !isCreateMode;
  
  const [form, setForm] = useState({
    address: '',
    city: '',
    state: '',
    zipcode: '',
    year: '',
    insurance: '',
    type: '',
    company: '',
    manager: '',
    referrer: '',
    start: new Date(),
    end: new Date(),
  });
  const [desc, setDesc] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const { taskMap, api: taskApi } = useTasks();
  const { enqueueSnackbar } = useSnackbar();
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    if (!isEdit || !_id) return;
    const cachedTask = propTask ?? taskFromRoute ?? taskMap[_id];
    if (cachedTask) {
      const { mode, ...cleanTask } = cachedTask;
      const parsedTask = {
        ...cleanTask,
        start: new Date(cleanTask.start),
        end: new Date(cleanTask.end),
      };
      setForm(parsedTask);
      taskApi.getTaskDescription(_id)
        .then(descData => {
          setDesc(descData.description || '');
          // 等富文本内容准备好后，再延迟加载 Editor
          requestIdleCallback(() => setEditorReady(true));
        })
        .catch(err => console.error('加载描述失败', err));
    } else {
      // 完全从接口获取所有数据
      Promise.all([
        taskApi.getTask(_id),
        taskApi.getTaskDescription(_id),
      ])
      .then(([taskData, descData]) => {
        setForm(taskData);
        setDesc(descData.description || '');
        requestIdleCallback(() => setEditorReady(true));
      })
      .catch(err => console.error('加载任务失败', err));
    }
  }, [_id, isEdit, propTask, taskFromRoute]);

  useEffect(() => {
    if (!isEdit) {
      setDesc('');
      // 新建模式直接准备好编辑器
      requestIdleCallback(() => setEditorReady(true));
    }
  }, [isEdit]);

  useEffect(() => {
    typeApi.getTypes().then(setTypes);
  }, []);

  // 使用 useCallback 优化 handleChange
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);
  // 使用 useCallback 优化日期更改
  const handleStartDateChange = useCallback((newValue) => {
    setForm(prev => {
      let newEnd = prev.end;
      if (newValue && newEnd && new Date(newValue) > new Date(newEnd)) {
        newEnd = newValue;
      }
      return { ...prev, start: newValue, end: newEnd };
    });
  }, []);
  
  const handleEndDateChange = useCallback((newValue) => {
    setForm(prev => ({ ...prev, end: newValue }));
  }, []);

  // 使用 useCallback 优化描述更改
  const handleDescriptionChange = useCallback((val) => setDesc(val), []);
  

  const handleSubmit = async () => {
    const { address, city, state, zipcode } = form;
    if (!address.trim() || !city.trim() || !state.trim() || !zipcode.trim()) {
      enqueueSnackbar(t('EditPro.submitWarn'), { variant: 'error' });
      return;
    }
    const description = editorRef.current?.getHTML?.() || '';   // 单独提取 description
    const { start, end, ...mainData } = form;
    const finalData = {
      ...mainData,
      start: formatDateToYMD(start),
      end: formatDateToYMD(end)
    };
    setSaving(true);
    startLoading();
    try {
      if (isEdit) {
        await Promise.all([
          taskApi.update(_id, finalData),
          taskApi.updateDesc(_id, description),
        ]);
      } else {
        const newTask = await taskApi.create(finalData);   // 乐观插入已完成
        let projectId = newTask._id;
        await taskApi.updateDesc(projectId, description);    // 才写描述
      }
      enqueueSnackbar(t('EditPro.saveSuccess'), { variant: 'success' });
      if (onSuccess) {
        onSuccess();       // ← 独立页面用这个
      } else if (onClose) {
        onClose(isEdit ? 'reload-current' : 'reload-first'); // ← 嵌入式用这个
      }
    } catch (e) {
      /* fetcher 已有全局报错，若要局部提示可加 enqueueSnackbar */
      enqueueSnackbar(e.message ||  t('EditPro.saveFailed'), { variant: 'error' });
    } finally {
      setSaving(false);
      endLoading();
    }
  };

  const handleDelete = () => {
    const doDelete = async () => {       // 删除逻辑
      try {
        await taskApi.remove(_id);
        enqueueSnackbar( t('EditPro.alreadyDel'), { variant: 'success' });
      } catch (err) {
        enqueueSnackbar( t('EditPro.delFailed&Rec'), { variant: 'error' });
      }
    };
    if (embedded) {
      onClose?.(doDelete);               // 1) 先关闭；2) 把 doDelete 交给 Home
    } else {
      doDelete().then(() => navigate('/'));
    }
  };

  const handleCancel = () => {
    onClose?.('close');
  };

  return (
    <TaskPane embedded={embedded}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        width: embedded ? '100%' : '80%',
        maxWidth: embedded ? 'none' : '100vw',
        minWidth: 0, // 防止内容撑开容器
        justifyContent: 'flex-start',
        overflowX: 'hidden', // 防止溢出
        overflowY: 'auto', 
        mx: embedded ? 0 : 'auto',
        mt: 0,
        mb: embedded ? 0 : 4,
        pt: 0,
       }}>
        {/* 任务创建类型 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5" gutterBottom sx={{ m: 0 }}>
            {isCreateMode ?  t('EditPro.createProject') : t('EditPro.editProject')}
            {embedded && (
              <IconButton onClick={() => navigate(isEdit ? `/task/edit/${_id}` : '/task/new', { state: { task: form } } )}>
                <OpenInNewIcon />
              </IconButton>
            )}
          </Typography>
          <Stack direction="row" spacing={1}>
            {embedded && (
            <>
              {isEdit && (
                <IconButton color="error" onClick={() => setConfirmDeleteOpen(true)}>
                  <DeleteIcon />
                </IconButton>
              )}
              <IconButton color="primary" onClick={handleSubmit} disabled={saving}>
                <SaveIcon />
              </IconButton>
              <IconButton 
                onClick={handleCancel}
              >
                <CancelIcon />
              </IconButton>
            </>
          )}
          </Stack>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Grid 
          container 
          spacing={2} 
          columns={24} 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(6, 1fr)',
              md: 'repeat(8, 1fr)',
              lg: 'repeat(24, 1fr)',
            }, 
          }}>
          {/* 第1行：地址、城市、邮政编码 */}
          <Grid item sx={{ gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 6', lg: 'span 12' } }}>
            <TextField 
              name="address" 
              label={t('EditPro.address')}
              size="small" 
              fullWidth 
              value={form.address} 
              onChange={handleChange}
              required
              error={!form.address.trim() && form.address !== undefined}
            />
          </Grid>
          <Grid item sx={{ gridColumn: { xs: 'span 1', sm: 'span 3', md: 'span 1', lg: 'span 5' } }}>
            <TextField 
              name="city" 
              label={t('EditPro.city')} 
              size="small" 
              fullWidth 
              value={form.city} 
              onChange={handleChange}
              required
              error={!form.city.trim() && form.city !== undefined}
            />
          </Grid>
          <Grid item sx={{ gridColumn: { xs: 'span 1', sm: 'span 3', md: 'span 1', lg: 'span 3' } }}>
            <TextField 
              name="state" 
              label={t('EditPro.state')} 
              size="small" 
              fullWidth 
              value={form.state} 
              onChange={handleChange}
              required
              error={!form.state.trim() && form.state !== undefined}
            />
          </Grid>
          <Grid item sx={{ gridColumn: { xs: 'span 1', sm: 'span 3', md: 'span 1', lg: 'span 4' } }}>
            <TextField 
              name="zipcode" 
              label={t('EditPro.zip')} 
              size="small" 
              fullWidth 
              value={form.zipcode || ''} 
              onChange={handleChange}
              required
              error={!form.zipcode.trim() && form.zipcode !== undefined} 
            />
          </Grid>
          {/* 第2行：房子年份、保险公司、项目类型选择*/}
          <Grid item sx={{ gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 6', lg: 'span 4' } }}>
            <TextField 
              name="year" 
              label={t('EditPro.year')} 
              size="small" 
              fullWidth 
              value={form.year} 
              onChange={handleChange} 
            />
          </Grid>
          <Grid item sx={{ gridColumn: { xs: 'span 1', sm: 'span 3', md: 'span 1', lg: 'span 12' } }}>
            <TextField 
              name="insurance" 
              label={t('EditPro.insurance')} 
              size="small" 
              fullWidth 
              value={form.insurance} 
              onChange={handleChange} 
            />
          </Grid>
          <Grid item sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 2', lg: 'span 8' } }}>
            <FormControl fullWidth size="small">
              <InputLabel id="type-label">{t('EditPro.type')}</InputLabel>
              <Select
                labelId="type-label"
                name="type"
                value={form.type}
                onChange={handleChange}
                label={t('EditPro.type')}
                sx={{ minWidth: 120 }}
              >
                {(!types.length && form.type) ? (
                  <MenuItem key={form.type} value={form.type}>
                    {form.type}
                  </MenuItem>
                ) : null}
                {types.map((option) => (
                  <MenuItem key={option._id} value={option.name}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* 第3行：公司、项目推荐人、项目负责人 */}
          <Grid item sx={{ gridColumn: { xs: 'span 1', sm: 'span 3', md: 'span 2', lg: 'span 6' } }}>
            <TextField 
              name="manager" 
              label={t('EditPro.manager')}  
              size="small" 
              fullWidth 
              value={form.manager} 
              onChange={handleChange} 
            />
          </Grid>
          <Grid item sx={{ gridColumn: { xs: 'span 1', sm: 'span 3', md: 'span 2', lg: 'span 6' } }}>
            <TextField 
              name="referrer" 
              label={t('EditPro.referrer')} 
              size="small" 
              fullWidth 
              value={form.referrer} 
              onChange={handleChange} 
            />
          </Grid>
          <Grid item sx={{ gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 4', lg: 'span 12' } }}>
            <TextField 
              name="company" 
              label={t('EditPro.company')}  
              size="small" 
              fullWidth 
              value={form.company} 
              onChange={handleChange} 
            />
          </Grid>
          
          {/* 第4行：开始日期、结束日期 */}
          <Grid item sx={{ gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 4', lg: 'span 12' } }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label={t('EditPro.startDate')} 
                value={form.start}
                onChange={handleStartDateChange}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item sx={{ gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 4', lg: 'span 12' } }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label={t('EditPro.endDate')} 
                value={form.end}
                minDate={form.start}
                onChange={handleEndDateChange}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid 
            item 
            sx={{ gridColumn: '1 / -1' }}
          >
            <Typography gutterBottom>
              <strong>{t('EditPro.editorTitle')}</strong>
            </Typography>
            {editorReady ? (
              <Suspense fallback={<Typography variant="body2">{t('EditPro.editorLoading')}</Typography>}>
                <LazyEditor
                  ref={editorRef}
                  key={_id ?? 'new'}
                  value={desc}
                  onChange={handleDescriptionChange}
                  maxHeightOffset={embedded ? 40 : 100}
                />
              </Suspense>
            ) : (
              <Typography variant="body2" sx={{ color: '#aaa' }}>{t('EditPro.waitingLoading')}</Typography>
            )}
          </Grid>
        </Grid>

      {/* ---------- 按钮区 ---------- */}
      {!embedded && (
        <Stack direction="row" spacing={2} mt="auto" pt={1} justifyContent="center">
          <Button
            disabled={saving}
            onClick={handleSubmit}
          >
            {isEdit ? t('EditPro.save') : t('EditPro.create')}
          </Button>
          {isEdit &&(
            <Button variant='text' color="error" onClick={() => setConfirmDeleteOpen(true)}>{t('EditPro.delete')}</Button>
          )}
        </Stack>

      )}
      </Box>

      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>{t('EditPro.deleteCheck')}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>{t('EditPro.cancel')}</Button>
          <Button onClick={handleDelete} color="error" variant="contained">{t('EditPro.confirm')}</Button>
        </DialogActions>
      </Dialog>
    </TaskPane>
  )
}
