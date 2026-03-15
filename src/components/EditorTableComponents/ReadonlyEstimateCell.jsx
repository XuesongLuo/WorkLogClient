// src/components/EditorTableComponents/ReadonlyEstimateCell.jsx
import React from 'react';
import { Divider, Box } from '@mui/material';
import ReadonlyGreenCheckbox from './ReadonlyGreenCheckbox';

function ReadonlyEstimateCell({ checked, amount, disabled }) {
  return (
    <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', }}
    >
      <ReadonlyGreenCheckbox checked={!!checked} />
      <Divider sx={{ width: '100%', my: 0.5 }} />
      <span
        style={{
          fontSize: 12,
          color: disabled ? '#bbb' : '#222',
          width: '100%',
          textAlign: 'center',
          minHeight: 18, 
          letterSpacing: 0.5,
          paddingTop: 12,      
          paddingBottom: 0,    
          boxSizing: 'border-box',
          display: 'block'
        }}
      >
        ${amount !== undefined && amount !== null && amount !== '' ? amount : 0}
      </span>
    </div>
  );
}

export default React.memo(ReadonlyEstimateCell);
