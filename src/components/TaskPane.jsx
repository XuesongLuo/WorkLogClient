// src/components/TaskPane.jsx
import { forwardRef } from 'react';
import { Paper } from '@mui/material';

/**
 * 统一的右侧面板外壳
 * 用 forwardRef，让父级动画组件 拿到 DOM
 */
const TaskPane = forwardRef(function TaskPane({ children, embedded = true }, ref) {
  return (
      <Paper
        ref={ref} 
        elevation={embedded ? 1 : 0}  
        sx={{
          flex: 1,
          width: '100%',
          height: '100%',
          minWidth: 0, 
          p: 0,   
          display: 'flex',
          alignItems: embedded ? 'stretch' : 'center',
          maxWidth: embedded ? 'none' : '1920px',
          flexDirection: 'column',
          overflow: 'auto',
          boxSizing: 'border-box',
          border: 'none',
          boxShadow: embedded ? undefined : 'none', 
          backgroundColor: embedded ? 'background.paper' : 'transparent',
        }}
      >
        {children}
      </Paper>
  );
});

export default TaskPane;
