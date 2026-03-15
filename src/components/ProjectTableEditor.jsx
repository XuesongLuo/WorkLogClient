// src/components/ProjectTableEditor.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import _ from 'lodash';
import { Box } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { useSnackbar } from 'notistack';
import { useTasks } from '../contexts/TaskStore';
import { useLoading } from '../contexts/LoadingContext';
import ProgressTableRow from './EditorTableComponents/ProgressTableRow';
import TaskCard from './TaskCard';
import { useTranslation } from 'react-i18next';
import './EditorTableComponents/ProgressTable.css';

function updateIn(obj, path, val) {
    if (path.length === 1) return { ...obj, [path[0]]: val };
    const [head, ...rest] = path;
    return { ...obj, [head]: updateIn(obj?.[head] || {}, rest, val) };
}

function diffObject(orig, edited) {
    let diff = {};
    for (const key in edited) {
        if (typeof edited[key] === 'object' && edited[key] !== null && orig[key]) {
        const subDiff = diffObject(orig[key], edited[key]);
        if (Object.keys(subDiff).length) diff[key] = subDiff;
        } else if (!_.isEqual(orig[key], edited[key])) {
        diff[key] = edited[key];
        }
    }
    return diff;
}

export default function ProjectTableEditor() {
  const { t } = useTranslation();
  const { progress, api, progressHasMore, progressLoading, progressPage } = useTasks();
  const { enqueueSnackbar } = useSnackbar();
  const { start: startLoading, end: endLoading } = useLoading();
  const rows = progress;
  const [taskDetail, setTaskDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editRowData, setEditRowData] = useState(null);
  const apiRef = useRef(api);
  const tableRef = useRef(null); 
  const editingRowRef = useRef(null);
  const containerRef = useRef(null); // 滚动容器ref

  const handleShowDetail = useCallback(async (_id) => {
    setDialogOpen(true);
    setLoading(true);
    try {
      const task = await apiRef.current.getTask(_id);
      setTaskDetail(task); 
    } finally {
      setLoading(false);
    }
  }, []);

  const tryEditRow = useCallback((rowId) => {
    const row = rows.find(r => r._id === rowId);
    setEditRowData({ ...row });
    setEditingRowId(rowId);
  }, [rows]);

  const handleCellChange = useCallback((path, val) => {
    setEditRowData(data => updateIn(data, path, val));
  }, []);

  const exitEditAndSave = useCallback(() => {
    if (!editingRowId || !editRowData) return;
    const orig = rows.find(r => r._id === editingRowId);
    const changedFields = diffObject(orig, editRowData);
    if (orig && Object.keys(changedFields).length > 0) {
      startLoading();
      apiRef.current.mergeProgress(editRowData._id, changedFields);
      apiRef.current.saveCell(editRowData._id, changedFields)
        .then(() => {
          enqueueSnackbar(t('ProProgress.saveSuccess'), { variant: 'success' });
        })
        .catch(() => {
          enqueueSnackbar(t('ProProgress.saveFailed'), { variant: 'error' });
          apiRef.current.mergeProgress(editRowData._id, orig);
        })
        .finally(() => {
          endLoading();
        });
    }
    setEditingRowId(null);
    setEditRowData(null);
  }, [editingRowId, editRowData, rows, enqueueSnackbar]);


  useEffect(() => { apiRef.current = api; }, [api]);


  // 重点：修正为“只在表格外点击时才关闭”
  useEffect(() => {
    if (!editingRowId) return;
    const handleClickOutside = (e) => {
      // 如果有 ref 并且点击在该行上，不处理
      if (editingRowRef.current && editingRowRef.current.contains(e.target)) {
        return;
      }
      exitEditAndSave();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingRowId, exitEditAndSave]);

  
  // 滚动监听，加载更多
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function handleScroll() {
      if (progressLoading || !progressHasMore) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
        api.loadProgressPage(progressPage + 1);
      }
    }
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [progressLoading, progressHasMore, progressPage, api]);


  useEffect(() => {
    apiRef.current.loadProgressPage(1);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        height: 'calc(100vh - 120px)', 
        overflow: 'auto',
        width: '100%',
        background: '#fff',
        marginTop: '20px',
      }}
    >
    <table 
       ref={tableRef} 
       className="table-bordered sticky-table" 
       style={{ 
         width: '100%', 
         tableLayout: 'fixed',
         borderSpacing: 0, 
         borderCollapse: 'separate' 
       }}
    >
      <colgroup>
        
        <col style={{ width: '5%' }} />   
        <col style={{ width: '3%' }} />    
        <col style={{ width: '3%' }} />   
        <col style={{ width: '3%' }} />    
        <col style={{ width: '3%' }} />    
        
        <col style={{ width: '5%' }} />    
        <col style={{ width: '3%' }} />    
        <col style={{ width: '3%' }} />    
        <col style={{ width: '4%' }} />    
        <col style={{ width: '4%' }} />    
        <col style={{ width: '4%' }} />    
         
        <col style={{ width: '5%' }} />    
        <col style={{ width: '3%' }} />    
        <col style={{ width: '3%' }} />    
        <col style={{ width: '3%' }} />    
        <col style={{ width: '3%' }} />    
        <col style={{ width: '3%' }} />    
        <col style={{ width: '4%' }} />    
        <col style={{ width: '4%' }} />    
        <col style={{ width: '4%' }} />    

        <col style={{ width: '5%' }} />    
        <col style={{ width: '3%' }} />    
        <col style={{ width: '4%' }} />    
        <col style={{ width: '4%' }} />    
        <col style={{ width: '4%' }} />    
        
        <col style={{ width: '4%' }} />    
        <col style={{ width: '4%' }} />    
      </colgroup>
    <thead>
        <tr>
            <th rowSpan={2}>LOCATION</th>
            <th rowSpan={2}>YEAR</th>
            <th rowSpan={2}>INSURANCE</th>
            <th rowSpan={2}>AROL</th>
            <th rowSpan={2}>TEST</th>
            
            <th rowSpan={2}>PAK</th>
            <th rowSpan={2}>POUT</th>
            <th rowSpan={2}>PACK</th>
            <th colSpan={3}>PAK ESTIMATE</th>
            
            <th rowSpan={2}>WTR</th>
            <th rowSpan={2}>CTRC</th>
            <th rowSpan={2}>DEMO</th>
            <th rowSpan={2}>ITEL</th>
            <th rowSpan={2}>EQ</th>
            <th rowSpan={2}>PICK</th>
            <th colSpan={3}>WTR ESTIMATE</th>
           
            <th rowSpan={2}>STR</th>
            <th rowSpan={2}>CTRC</th>
            <th colSpan={3}>STR ESTIMATE</th>
            <th rowSpan={2}>PAYMENT</th>
            <th rowSpan={2}>COMMENTS</th>
        </tr>
        <tr>
            {/* PAK ESTIMATE 子项 */}
            <th>Send</th>
            <th>Review</th>
            <th>Agree</th>
            {/* WTR ESTIMATE 子项 */}
            <th>Send</th>
            <th>Review</th>
            <th>Agree</th>
            {/* STR ESTIMATE 子项 */}
            <th>Send</th>
            <th>Review</th>
            <th>Agree</th>
        </tr>
        </thead>
      <tbody>
        {rows.map(row => (
          <ProgressTableRow
            key={row._id}
            row={row}
            isEditing={editingRowId === row._id}
            editRowData={editingRowId === row._id ? editRowData : null}
            onCellChange={(path, val) => handleCellChange(path, val)}
            onShowDetail={handleShowDetail}
            onRowDoubleClick={() => tryEditRow(row._id)}
            trRef={editingRowId === row._id ? editingRowRef : undefined}
          />
        ))}
      </tbody>
    </table>
    {/* 底部加载提示 */}
    {progressLoading && (
        <div style={{ textAlign: 'center', padding: 10, color: '#888' }}>
          加载中...
        </div>
    )}
    {!progressHasMore && (
        <div style={{ textAlign: 'center', padding: 10, color: '#888' }}>
          已经到底了
        </div>
    )}

      <Dialog open={dialogOpen} maxWidth="md" fullWidth onClose={() => setDialogOpen(false)}>
        {loading ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>加载中...</Box>
        ) : (
          <TaskCard task={taskDetail} onClose={() => setDialogOpen(false)} />
        )}
      </Dialog>
    </div>
  );
}
