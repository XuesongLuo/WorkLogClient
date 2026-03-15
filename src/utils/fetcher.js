// src/utils/fetcher.js
import { enqueueSnackbar } from 'notistack';

let loadingApi; // 延迟注入，避免循环依赖

export function injectLoading(ctx) { loadingApi = ctx; }


// 可选：登出并跳转到登录页
function forceLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  enqueueSnackbar('Login expired, please log in again', { variant: 'warning' });
  // window.location.href = '/login'; // 或用 react-router
  setTimeout(() => {
    window.location.replace('/login');
  }, 500); // 延迟更丝滑
}


export async function fetcher(url, options = {}) {
  loadingApi?.start();
  try {
    // 1. 获取token
    const token = localStorage.getItem('token');
    // 2. 合并headers
    options.headers = options.headers || {};
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(url, options);
    // === 判断 401，自动登出 ===
    if (res.status === 401) {
      forceLogout();
      throw new Error('Login expired, please log in again');
    }

    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    if (options.method === 'DELETE') return true;
    return res.json();
  } catch (err) {
    enqueueSnackbar(`${err.message}`, { variant: 'error' });
    throw err;
  } finally {
    loadingApi?.end();
  }
}
