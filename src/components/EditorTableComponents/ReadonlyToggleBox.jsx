// src/components/EditorTableComponents/ReadonlyToggleBox.jsx
import React from 'react';
import { Box } from '@mui/material';
import ReadonlyGreenCheckbox from './ReadonlyGreenCheckbox';
import dayjs from 'dayjs';


function ReadonlyToggleBox({ section }) {
    return (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          minHeight:'100px',  
          height: '100%',
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          boxSizing: 'border-box'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 5,
            left: 5,
            p: 0,
            m: 0,
          }}
        >
          <ReadonlyGreenCheckbox checked={section?.active} />
        </Box>
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            pointerEvents: 'none',        
          }}
        >
          <span
            style={{
              fontSize: 12,
              height: '1.7em',
              color: section?.active ? '#222' : '#bbb',
              textAlign: 'center'
            }}
          >
            {section?.start_date ? dayjs(section.start_date).format('YYYY-MM-DD') : '--'}
          </span>
        </Box>
      </Box>
    );
  }

export default React.memo(ReadonlyToggleBox);
