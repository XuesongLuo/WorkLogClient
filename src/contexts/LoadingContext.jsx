// src/contexts/LoadingContext.jsx
import { createContext, useState, useContext, useCallback } from 'react';
import { LinearProgress } from '@mui/material';

const LoadingContext = createContext({ start: () => {}, end: () => {} });

export const useLoading = () => useContext(LoadingContext);

export function LoadingProvider({ children }) {
  const [pending, setPending] = useState(0);

  const start = useCallback(() => setPending(p => p + 1), []);
  const end   = useCallback(() => setPending(p => Math.max(0, p - 1)), []);

  return (
    <LoadingContext.Provider value={{ start, end }}>
      {pending > 0 && (
        <LinearProgress
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 13000,
            // 主要颜色（进度条本身）
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#f44336',
            },
            // 背景色
            backgroundColor: '#fff7e6',
          }}
        />
      )}
      {children}
    </LoadingContext.Provider>
  );
}
