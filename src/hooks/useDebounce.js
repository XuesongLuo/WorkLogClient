// src/hooks/useDebounce.js
import { useCallback, useEffect, useRef } from 'react';

/**
 * useDebounce
 * @param  {Function} callback  需要被防抖的函数
 * @param  {number}   delay     间隔，毫秒
 * @param  {Object}   options   { leading?: boolean } 是否先执行一次
 */

export const useDebounce = (callback, delay = 300, { leading = false } = {}) => {
  // 始终用最新的 callback，避免闭包过时
  const cbRef = useRef(callback);
  useEffect(() => { cbRef.current = callback; }, [callback]);

  const timerRef = useRef(null);
  const lastArgs = useRef([]);

  // 返回的 debounced 函数在整个组件生命周期内稳定
  const debounced = useCallback((...args) => {
    lastArgs.current = args;

    // 首次调用且设为 leading，立即触发一次
    if (leading && !timerRef.current) {
      cbRef.current(...args);
    }

    // 重置计时器
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!leading) {
        cbRef.current(...lastArgs.current);
      }
      timerRef.current = null; // 归零，便于下次 leading 触发
    }, delay);
  }, [delay, leading]);

  /**
  * * 立即触发尚未执行的回调，并清空定时器
  */
  debounced.flush = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      cbRef.current(...lastArgs.current);
      timerRef.current = null;
    }
  };

  /**
  * 取消等待中的回调
  */
  debounced.cancel = () => {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  // 3 组件卸载时清理定时器
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return debounced;
};

