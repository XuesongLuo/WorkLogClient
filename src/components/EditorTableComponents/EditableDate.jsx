// src/components/EditorTableComponents/EditableDate.jsx
import React from 'react';
import { TextField } from '@mui/material';

const EditableDate = React.memo(function EditableDate({
  value,
  onChange,
  disabled = false
}) {
  return (
    <TextField
      type="date"
      size="small"
      value={value || ''}
      onChange={e => onChange?.(e.target.value)}
      disabled={disabled}
      fullWidth
      sx={{
        width: "90px",
        '& .MuiInputBase-input': {
          p: '0px 2px',
          fontSize: '12px',
          height: '1.7em',
          textAlign: 'center',
        },
        '& .MuiOutlinedInput-root': {
          pr: 0,
        }
      }}
    />
  );
});

export default EditableDate;