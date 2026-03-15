// src/components/EditorTableComponents/ReadonlyGreenCheckbox.jsx
import React from 'react';
import Checkbox from '@mui/material/Checkbox';

const GREEN = '#388e3c'; // 深绿色

function ReadonlyGreenCheckbox({ checked }) {
  return (
    <Checkbox
      checked={checked}
      disabled
      size="small"
      disableRipple
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
  );
}

export default React.memo(ReadonlyGreenCheckbox);