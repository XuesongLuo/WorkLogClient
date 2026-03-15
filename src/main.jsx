if (!window.requestIdleCallback) {
  window.requestIdleCallback = function (cb) {
    return setTimeout(() => {
      const start = Date.now();
      cb({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 50 - (Date.now() - start));
        },
      });
    }, 1);
  };
}
if (!window.cancelIdleCallback) {
  window.cancelIdleCallback = function (id) {
    clearTimeout(id);
  };
}

import { createRoot } from 'react-dom/client'
import { SnackbarProvider } from 'notistack'; 
import { LoadingProvider } from './contexts/LoadingContext';
import { TaskProvider } from './contexts/TaskStore';
import './index.css'
import AppRouter from './router.jsx';
import './i18n';

createRoot(document.getElementById('root')).render(
    <SnackbarProvider
      maxSnack={3}                // 最多同时显示 3 条
      autoHideDuration={3000}     // 3 秒自动收起
      anchorOrigin={{             // 出现位置：右下角
        vertical: 'bottom',
        horizontal: 'right',
      }}
    >
      <LoadingProvider>
        <TaskProvider>
          <AppRouter />
        </TaskProvider>
      </LoadingProvider>
    </SnackbarProvider>
);
