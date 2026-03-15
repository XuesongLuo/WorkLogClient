// src/components/EditorTableComponents/EditableTextfield.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField } from '@mui/material';

function EditableCell({ value, onChange, disabled = false }) {
  const [draft, setDraft] = useState(value ?? '');
  const inputRef = useRef(null);

  // 当 props.value 改变时，同步更新本地 draft
  useEffect(() => {
      setDraft(value ?? '');
  }, [value]);

  return (
    <Box
      onClick={() => { 
        // 若需要点击单元格时聚焦输入框：
        if (!disabled) inputRef.current?.focus();
      }} 
      sx={{ 
        p: 0,
        m: 0,
        display: 'flex',
        alignItems: 'center',     
        justifyContent: 'center', 
        width: "100%", 
        height: "100%"
      }}  
    >
      <TextField
        inputRef={inputRef}
        variant="standard"
        fullWidth
        multiline  
        maxRows={10}
        value={draft}
        disabled={disabled}
        onChange={e => {
          if (!disabled) onChange(e.target.value);
        }}
        sx={{
          '& .MuiInputBase-input': {
            fontSize: '12px',
            textAlign: 'center',
            p: 0
          },
          '& .MuiInput-underline:before': {
            borderBottom: 'none !important', // 常规状态无下划线
          },
          '& .MuiInput-underline:hover:before': {
            borderBottom: '1px solid #1976d2 !important', // hover时有下划线，可换你想要的颜色
          },
        }}
      />
    </Box>
  );
}

export default React.memo(EditableCell);