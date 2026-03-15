// src/hooks/useTaskDetailState.js
import { useState } from 'react'

/**
 * 自定义 Hook：统一管理任务详情、编辑、新增状态。
 * 用于 Home.jsx 中简化 selectedTask、showDetail 和切换逻辑。
 */
export default function useTaskDetailState(onReload) {
  const [selectedTask, setSelectedTask] = useState(null);  // { id?, mode: 'view' | 'edit' | 'new' } | null
  const [showDetail, setShowDetail] = useState(false);

  // 打开任务详情（只读模式）
  const openTaskDetail = (_id) => {
    setSelectedTask({ _id, mode: 'view' });
    setShowDetail(true);
  };

  // 打开任务编辑
  const openTaskEdit = (_id, task) => { setSelectedTask(task ? { ...task, _id, mode: 'edit' } : { _id, mode: 'edit' });
    setShowDetail(true);
  };

  // 打开任务创建
  const openTaskCreate = () => {
    setSelectedTask({ mode: 'edit' });
    setShowDetail(true);
  };

  // 只关闭，不处理任何副作用
  const handleTaskClose = () => {
    setShowDetail(false);
    setSelectedTask(null);
  };

  return {
    selectedTask,
    showDetail,
    openTaskDetail,
    openTaskEdit,
    openTaskCreate,
    handleTaskClose,
    setSelectedTask,
  };
}
