// src/pages/Home.jsx
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  Chip,
  Collapse,
  Stack,
  Grid,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enUS, zhCN, es } from 'date-fns/locale';
import ViewListIcon from '@mui/icons-material/ViewList';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TuneIcon from '@mui/icons-material/Tune';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TopAppBar from '../components/TopAppBar';
import TaskList from '../components/TaskList'; 
import CalendarView from '../components/CalendarView';
import TaskDetail from '../components/TaskDetail';
import CreateOrEditTask from '../components/CreateOrEditTask';
import useTaskDetailState from '../hooks/useTaskDetailState';
import { useTasks } from '../contexts/TaskStore';
import { useTranslation } from 'react-i18next';

const SlideContent = React.memo(
  ({ selectedTask, handleTaskClose }) => (
    <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
      {selectedTask?.mode === 'edit' && (
        <CreateOrEditTask
          key={selectedTask?._id ? selectedTask._id : 'new'}
          embedded
          _id={selectedTask?._id}
          task={selectedTask}
          onClose={handleTaskClose}
        />
      )}
      {selectedTask?.mode === 'view' && (
        <TaskDetail
          _id={selectedTask._id}
          embedded
          onClose={handleTaskClose}
        />
      )}
    </Box>
  ),
  (prevProps, nextProps) =>
    prevProps.selectedTask?._id === nextProps.selectedTask?._id &&
    prevProps.selectedTask?.mode === nextProps.selectedTask?.mode &&
    prevProps.handleTaskClose === nextProps.handleTaskClose
);

const useNormalizedEvents = (tasks) => useMemo(() => {
  return tasks.map(t => ({
    ...t,
    id   : t._id,
    start: t.start instanceof Date ? t.start : new Date(t.start),
    end  : t.end   instanceof Date ? t.end   : new Date(t.end),
    title: `${t.address ?? ''}, ${t.city ?? ''}, ${t.state ?? ''}, ${t.zipcode ?? ''}`,
  }));
}, [tasks]);

export default function Home() {
  const { t, i18n } = useTranslation();
  const { tasks, api, loaded, page, setPage, hasMore, loading } = useTasks(); 
  const [viewMode, setViewMode] = useState('list'); // 'calendar' | 'list'
  const [filters, setFilters] = useState({
    contractStatus: '',
    type: '',
    city: '',
    state: '',
    startDateFrom: null,
    startDateTo: null,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const navigate = useNavigate();
  const containerOuterRef = useRef(null);
  const location = useLocation();

  const {
    selectedTask,
    showDetail,
    openTaskDetail,
    openTaskEdit,
    openTaskCreate,
    handleTaskClose,
  } = useTaskDetailState(() => api.loadPage(page));

  // 使用 useMemo 优化计算
  const gridStyles = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    width: showDetail ? '50%' : '100%',
    maxWidth: showDetail ? '50%' : '100%',
    flexBasis: showDetail ? '50%' : '100%',
    pl: 0,
    pr: showDetail ? 2 : 'auto',
    ml: showDetail ? 0 : 'auto',
    mr: showDetail ? 0 : 'auto',
    height: '100%',
    transition: 'width 0.3s cubic-bezier(.4,1,.4,1), max-width 0.3s cubic-bezier(.4,1,.4,1), flex-basis 0.3s cubic-bezier(.4,1,.4,1)',
  }), [showDetail]);

  const rightPanelStyles = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: showDetail ? 1 : 0,
    width: showDetail ? '50%' : 0,
    maxWidth: showDetail ? '50%' : 0,
    flexBasis: showDetail ? '50%' : 0,
    opacity: showDetail ? 1 : 0,
    pl: showDetail ? 2 : 0,
    borderLeft: showDetail ? '1px solid #ddd' : 'none',
    height: '100%',
    overflow: 'hidden',
  }), [showDetail]);

  const filterOptions = useMemo(() => {
    const uniqueSorted = (values) =>
      [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));

    return {
      types: uniqueSorted(tasks.map(task => task.type)),
      cities: uniqueSorted(tasks.map(task => task.city)),
      states: uniqueSorted(tasks.map(task => task.state)),
    };
  }, [tasks]);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(Boolean).length,
    [filters]
  );

  const dateLocale = useMemo(() => {
    if (i18n.language?.startsWith('zh')) return zhCN;
    if (i18n.language?.startsWith('es')) return es;
    return enUS;
  }, [i18n.language]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.contractStatus && (task.contractStatus || 'unsigned') !== filters.contractStatus) {
        return false;
      }
      if (filters.type && task.type !== filters.type) {
        return false;
      }
      if (filters.city && task.city !== filters.city) {
        return false;
      }
      if (filters.state && task.state !== filters.state) {
        return false;
      }

      const taskStart = task.start ? new Date(task.start) : null;
      if (filters.startDateFrom && taskStart) {
        const fromDate = new Date(filters.startDateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (taskStart < fromDate) {
          return false;
        }
      }
      if (filters.startDateFrom && !taskStart) {
        return false;
      }

      if (filters.startDateTo && taskStart) {
        const toDate = new Date(filters.startDateTo);
        toDate.setHours(23, 59, 59, 999);
        if (taskStart > toDate) {
          return false;
        }
      }
      if (filters.startDateTo && !taskStart) {
        return false;
      }

      return true;
    });
  }, [tasks, filters]);

  const events = useNormalizedEvents(filteredTasks);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDateFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      contractStatus: '',
      type: '',
      city: '',
      state: '',
      startDateFrom: null,
      startDateTo: null,
    });
  };

  // 日历和列表组件切换
  const toggleView = () =>
    setViewMode(prev => (prev === 'calendar' ? 'list' : 'calendar'));

  // 新的关闭&刷新逻辑
  const handlePanelClose = (payload) => {
    // 1. 切到编辑模式
    if (payload && typeof payload === 'object' && payload.mode === 'edit') {
      openTaskEdit(payload._id, payload.task);
      return;
    }
    // 2. 如果传的是函数，先执行函数，再关闭
    if (typeof payload === 'function') {
      payload();
      handleTaskClose();
      return;
    }
    // 3. 如果需要刷新，先刷新，再关闭
    if (payload === 'reload-first') {
      api.loadPage(1);
      setPage(1);
      handleTaskClose();
      return;
    }
    if (payload === 'reload-current') {
      api.loadPage(page);
      handleTaskClose();
      return;
    }
    // 4. 默认关闭
    handleTaskClose();
  };

  // 从后端加载任务列表
  useEffect(() => {
    if (!loaded) {
      api.loadPage(1);
      setPage(1);
    }
  }, [loaded]);

  // 监听并 reload
  useEffect(() => {
    if (location.state?.reload) {
      api.loadPage(1);
      setPage(1);
      // 清空 reload 标记（防止反复 reload）
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh' }}>
      <TopAppBar /> 
      <Container
        ref={containerOuterRef}
        maxWidth={false}
        disableGutters
        sx={{ 
          py: 3,
          height: 'calc(100vh - 64px)',
          overflowX: 'hidden',
          width: '80vw',          
          minWidth: 0,
          maxWidth: 'none',
          mx: 'auto',             
        }}
      >
        <Grid
          container
          sx={{
            height: '100%',
            width: '100%',
            alignItems: 'flex-start',
            justifyContent: selectedTask ? 'space-between' : 'center',
            flexWrap: 'nowrap',
          }}
        >
          {/* 日历或列表 列 */}
          <Grid sx={gridStyles}>
            <Stack direction="row" justifyContent="space-between" mb={2}>
              <Button
                  variant="outlined"
                  startIcon={viewMode === 'list' ? <CalendarMonthIcon /> : <ViewListIcon />}
                  onClick={toggleView}
                >
                  {viewMode === 'list' ? t('Home.calendarView') : t('Home.listView')}
              </Button>
              <Typography variant="h5">
                {viewMode === 'list' ? t('Home.listTitle') : t('Home.calendarTitle')}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" color="secondary" onClick={openTaskCreate}>
                  {t('Home.createProject')}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/project-table')}
                >
                  {t('Home.progressTableEditor')}
                </Button>
              </Stack>
            </Stack>
            {viewMode === 'list' && (
              <Box
                sx={{
                  mb: 2,
                  p: 2.25,
                  border: '1px solid #dde5ee',
                  borderRadius: 3,
                  background: 'linear-gradient(180deg, #fbfcfd 0%, #f6f9fb 100%)',
                  boxShadow: '0 10px 24px rgba(34, 55, 80, 0.04)',
                }}
              >
                <Stack
                  direction={{ xs: 'column', lg: 'row' }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: 'stretch', lg: 'center' }}
                  sx={{ mb: filtersOpen ? 2 : 0 }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#223750' }}>
                      List Filters
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#60758a', mt: 0.5 }}>
                      {filteredTasks.length} of {tasks.length} projects shown
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Button
                      variant={filtersOpen ? 'contained' : 'outlined'}
                      color="primary"
                      startIcon={<TuneIcon />}
                      endIcon={
                        <ExpandMoreIcon
                          sx={{
                            transform: filtersOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                          }}
                        />
                      }
                      onClick={() => setFiltersOpen(prev => !prev)}
                    >
                      {filtersOpen ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                    <Chip
                      label={activeFilterCount ? `${activeFilterCount} active filters` : 'No active filters'}
                      size="small"
                      sx={{
                        background: activeFilterCount ? '#e8f1fb' : '#eef3f7',
                        color: activeFilterCount ? '#245b8f' : '#60758a',
                        fontWeight: 600,
                      }}
                    />
                    <Button variant="text" onClick={resetFilters} disabled={!activeFilterCount}>
                      Reset
                    </Button>
                  </Stack>
                </Stack>

                <Collapse in={filtersOpen}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    useFlexGap
                    flexWrap="wrap"
                    alignItems={{ xs: 'stretch', md: 'center' }}
                  >
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel id="contract-filter-label">Contract</InputLabel>
                      <Select
                        labelId="contract-filter-label"
                        name="contractStatus"
                        value={filters.contractStatus}
                        label="Contract"
                        onChange={handleFilterChange}
                        sx={{ background: '#fff', borderRadius: 2 }}
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="signed">{t('common.contractSigned', { defaultValue: 'Signed' })}</MenuItem>
                        <MenuItem value="unsigned">{t('common.contractUnsigned', { defaultValue: 'Unsigned' })}</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 180 }}>
                      <InputLabel id="type-filter-label">Type</InputLabel>
                      <Select
                        labelId="type-filter-label"
                        name="type"
                        value={filters.type}
                        label="Type"
                        onChange={handleFilterChange}
                        sx={{ background: '#fff', borderRadius: 2 }}
                      >
                        <MenuItem value="">All</MenuItem>
                        {filterOptions.types.map(option => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 180 }}>
                      <InputLabel id="city-filter-label">City</InputLabel>
                      <Select
                        labelId="city-filter-label"
                        name="city"
                        value={filters.city}
                        label="City"
                        onChange={handleFilterChange}
                        sx={{ background: '#fff', borderRadius: 2 }}
                      >
                        <MenuItem value="">All</MenuItem>
                        {filterOptions.cities.map(option => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <InputLabel id="state-filter-label">State</InputLabel>
                      <Select
                        labelId="state-filter-label"
                        name="state"
                        value={filters.state}
                        label="State"
                        onChange={handleFilterChange}
                        sx={{ background: '#fff', borderRadius: 2 }}
                      >
                        <MenuItem value="">All</MenuItem>
                        {filterOptions.states.map(option => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateLocale}>
                      <DatePicker
                        label="Start From"
                        value={filters.startDateFrom}
                        onChange={(value) => handleDateFilterChange('startDateFrom', value)}
                        slotProps={{
                          textField: {
                            size: 'small',
                            sx: {
                              minWidth: 168,
                              '& .MuiOutlinedInput-root': {
                                background: '#fff',
                                borderRadius: 2,
                              },
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>

                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateLocale}>
                      <DatePicker
                        label="Start To"
                        value={filters.startDateTo}
                        onChange={(value) => handleDateFilterChange('startDateTo', value)}
                        slotProps={{
                          textField: {
                            size: 'small',
                            sx: {
                              minWidth: 168,
                              '& .MuiOutlinedInput-root': {
                                background: '#fff',
                                borderRadius: 2,
                              },
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Stack>
                </Collapse>
              </Box>
            )}
            {viewMode === 'list' ? (
              <TaskList
                tasks={filteredTasks}
                onSelectTask={(task) => openTaskDetail(task._id)}
                selectedTaskId={selectedTask?._id}
                sx={{ height: '100%' }} 
                loading={loading}           
                hasMore={hasMore}           
                onLoadMore={() => {
                  if (!loading && hasMore) {
                    api.loadPage(page + 1);
                  }
                }}
              />
            ) : (
              <CalendarView
                events={events}
                style={{ height: '100%', width: '100%' }}
                onSelectEvent={(event) => openTaskDetail(event._id)}
              />
            )}
  
          </Grid>
          {/* 右侧面板：详情 / 新建 / 编辑 */}
          <Grid sx={rightPanelStyles}>
            <Box
              sx={{
                height: '100%',
                width: '100%',
                transform: selectedTask ? 'translateX(0)' : 'translateX(20px)',
                opacity: selectedTask ? 1 : 0,
                transition: 'transform 220ms ease, opacity 220ms ease',
                pointerEvents: selectedTask ? 'auto' : 'none',
                overflow: 'hidden',
              }}
            >
              {selectedTask && (
                <SlideContent
                  selectedTask={selectedTask}
                  handleTaskClose={handlePanelClose}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
