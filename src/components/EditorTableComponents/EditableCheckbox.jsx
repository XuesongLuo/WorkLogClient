// src/components/EditorTableComponents/EditableCheckbox.jsx
import React from 'react';
import { Box, Checkbox } from '@mui/material';

const GREEN = '#388e3c'; // 深绿色

const EditableCheckbox = React.memo(function EditableCheckbox({ 
  value, 
  onChange, 
  disabled = false 
}) {
  return (
    <Box>
      <Checkbox 
        checked={value || false}
        disabled={disabled}
        onChange={onChange}
        size="small"
        sx={{
          p: 0, 
          m: 0,   
          color: GREEN,
          '&.Mui-checked': {
            color: GREEN, 
          },
          '& .MuiSvgIcon-root': { fontSize: '1.2rem' }
        }}
      />
    </Box>
  );
});

export default EditableCheckbox;