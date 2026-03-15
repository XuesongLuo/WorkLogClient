// src/components/EditorTableComponents/EditableNumberCell.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, TextField } from '@mui/material';

function EditableNumberCell({ value, onChange, disabled = false }) {
  const [draft, setDraft] = useState(value ?? 0);
  const inputRef = useRef(null);

  useEffect(() => {
      setDraft(value ?? '');
  }, [value]);

  return (
    <Box 
      onClick={() => { if (!disabled) inputRef.current?.focus(); }}
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
        type="number"
        variant="standard"
        fullWidth
        value={draft}
        disabled={disabled}
        onChange={e => {
          // 只允许数字或0
          let val = e.target.value;
          if (val === '' || val === null) {
            setDraft('');
            onChange(0);
            return;
          }
          // 保证最多两位小数
          if (!/^\d*(\.\d{0,2})?$/.test(val)) {
            return;
          }
          setDraft(val);
          onChange(Number(val));
        }}
        inputProps={{ style: { textAlign: 'center' } }}
        sx={{
          '& .MuiInputBase-input': {
            fontSize: '12px',
            textAlign: 'center',
            paddingLeft: "4px",
            paddingRight: "4px",
            paddingTop: "12px",
            paddingBottom: "0px"
          },
          // 移除默认的数字上下箭头（spin buttons）
          '& input[type=number]': { MozAppearance: 'textfield' },
          '& input[type=number]::-webkit-outer-spin-button': { WebkitAppearance: 'none', margin: 0},
          '& input[type=number]::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0},
          '& .MuiInput-underline:hover:before': {
            borderBottom: '1px solid #1976d2 !important', // hover时有下划线，可换你想要的颜色
          },
        }}
      />
    </Box>
  );
}

export default React.memo(EditableNumberCell);