// src/pages/Home.jsx
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography, Box, Button, Stack, Grid, Container, Slide} from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
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
  const { t } = useTranslation();
  const { tasks, api, loaded, page, setPage, hasMore, loading } = useTasks(); 
  const events = useNormalizedEvents(tasks);
  const [viewMode, setViewMode] = useState('list'); // 'calendar' | 'list'
  const navigate = useNavigate();
  const [showPanelContent, setShowPanelContent] = useState(false);
  const containerOuterRef = useRef(null);
  const location = useLocation();

  const {
    selectedTask,
    showDetail,
    openTaskDetail,
    openTaskEdit,
    openTaskCreate,
    handleTaskClose,
    setSelectedTask
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

  // 日历和列表组件切换
  const toggleView = () =>
    setViewMode(prev => (prev === 'calendar' ? 'list' : 'calendar'));

  // 新的关闭&刷新逻辑
  const handlePanelClose = (payload) => {
    // 1. 如果是编辑payload，切换到编辑模式
    if (payload && typeof payload === 'object' && payload.mode === 'edit') {
      openTaskEdit(payload._id, payload.task);
      return;
    }
    // 关闭面板
    handleTaskClose();
    // 如果是删除等传递过来的函数
    if (typeof payload === 'function') {
      payload();
      return;
    }
    // 如果 payload === 'reload-first'， 从第一页开始刷新
    if (payload === 'reload-first') {
      api.loadPage(1);
      setPage(1);
    }
    // 如果 payload === 'reload-current'， 从当前页开始刷新
    if (payload === 'reload-current') {
      api.loadPage(page);
    }
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
            {viewMode === 'list' ? (
              <TaskList
                tasks={tasks}
                onSelectTask={(task) => openTaskDetail(task._id)}
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
            <Slide 
              direction="left" 
              in={!!selectedTask} 
              mountOnEnter 
              unmountOnExit
              onEntered={() => {
                setShowPanelContent(true);     // 动画后加载内容
              }}
              onExit={() => setShowPanelContent(false)} // 动画开始卸载内容
              onExited={() => {                         // 动画完全收起 → 执行回调
                setSelectedTask(null);
              }}
            >
              <div style={{ height: '100%' }}>
                  <SlideContent
                    selectedTask={selectedTask}
                    handleTaskClose={handlePanelClose}
                  />
              </div>
              </Slide>
            </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
