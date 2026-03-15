// src/components/EditorTableComponents/ToggleBox.jsx
import React from 'react';
import { Box, Checkbox } from '@mui/material';
import EditableDate from './EditableDate';

const GREEN = '#388e3c'; // 深绿色

const ToggleBox = React.memo(function ToggleBox({value, onToggleActive, onDateChange, disabled}) {
  const { active, start_date } = value || {};

  return (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight:'100px',
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          boxSizing: 'border-box'
        }}
      >
        <Checkbox
          size="small"
          checked={!!active}
          onChange={() => onToggleActive?.(!active)}
          sx={{
            position: 'absolute',
            top: 5,
            left: 5,
            p: 0,
            m: 0,
            color: GREEN,
            '&.Mui-checked': { color: GREEN },
            '& .MuiSvgIcon-root': { fontSize: '1.2rem' }
          }}
        />
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            pointerEvents: 'none',       
          }}
        >
          <Box sx={{ pointerEvents: 'auto' }}>
            <EditableDate
              value={start_date ?? ''}
              onChange={val => onDateChange?.(val)}
              disabled={!active || disabled}
            />
          </Box>
        </Box>
      </Box>
  );
}, 
// 自定义比较函数：只有当 active 状态改变时才重新渲染整个组件
// 日期字段变化不会触发整个 ToggleBox 重渲染
(prev, next) =>
  prev.value?.active === next.value?.active &&
  prev.value?.start_date === next.value?.start_date &&
  prev.disabled === next.disabled
);

export default ToggleBox;
