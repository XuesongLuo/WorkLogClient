// src/components/TaskList.jsx
import React, { useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// 日期格式化工具
function formatDate(val) {
  if (!val) return '';
  const d = typeof val === 'string' ? new Date(val) : val;
  if (isNaN(d)) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const TaskList = React.forwardRef(function TaskList(
  { tasks, onSelectTask, sx = {}, loading, hasMore, onLoadMore },
  ref
) {
  const { t } = useTranslation();
  const containerRef = useRef();

  // 列定义 宽度比例设置
  const columns = useMemo(
    () => [
      {
        key: 'start',
        header: t('ProList.startDate'),
        baseWidth: 50,
        render: t => formatDate(t.start),
      },
      {
        key: 'fulladdress',
        header: t('ProList.address'),
        baseWidth: 150,
        render: t =>
          [t.address, t.city, t.state, t.zipcode].filter(Boolean).join(', '),
      },
      {
        key: 'year',
        header: t('ProList.year'),
        baseWidth: 50,
        render: t => t.year,
      },
      {
        key: 'insurance',
        header: t('ProList.insurance'),
        baseWidth: 80,
        render: t => t.insurance,
      },
      {
        key: 'type',
        header: t('ProList.type'),
        baseWidth: 50,
        align: 'center',
        render: t => t.type,
      },
    ],
    [t]
  );

  // 动态按比例分配列宽（百分比宽度）
  const totalBase = columns.reduce((sum, col) => sum + (col.baseWidth || 80), 0);
  const dynamicCols = columns.map(col => {
    const percent = ((col.baseWidth || 80) / totalBase) * 100;
    return { ...col, percent: percent.toFixed(4) };
  });

  // 无限滚动监听
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let ticking = false;
    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (
            !loading &&
            hasMore &&
            el.scrollTop + el.clientHeight >= el.scrollHeight - 80
          ) {
            if (typeof onLoadMore === 'function') onLoadMore();
          }
          ticking = false;
        });
        ticking = true;
      }
    }
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, onLoadMore]);

  // 自定义外观
  const tableStyle = {
    tableLayout: 'fixed',
    width: '100%',
    maxWidth: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
    background: '#fff',
  };
  const thStyle = col => ({
    padding: '8px 4px',
    fontWeight: 700,
    fontSize: 13,
    background: '#f8fafd',
    borderBottom: '1px solid #eee',
    boxSizing: 'border-box',
    textAlign: 'center',
    minWidth: 60,
    ...(col.align === 'right' ? { textAlign: 'right' } : {}),
  });
  const tdStyle = col => ({
    padding: '8px 4px',
    fontSize: 12,
    borderBottom: '1px solid #f4f4f4',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 60,
    boxSizing: 'border-box',
    textAlign: col.align === 'right' ? 'right' : 'center',
    cursor: 'pointer',
  });

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        maxWidth: '100%',
        height: '100%',
        minHeight: 0,
        minWidth: 0,
        position: 'relative',
        boxSizing: 'border-box',
        ...sx,
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
    >
      <table style={tableStyle}>
        <colgroup>
          {dynamicCols.map((col, i) => (
            <col key={col.key} style={{ width: `${col.percent}%`, minWidth: 60 }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {dynamicCols.map(col => (
              <th key={col.key} style={thStyle(col)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((t, idx) => (
            <tr
              key={t._id || idx}
              style={{
                background: idx % 2 === 1 ? '#fafbfc' : '#fff',
                transition: 'background 0.18s',
                cursor: 'pointer',
              }}
              onClick={() => onSelectTask && onSelectTask(t)}
            >
              {dynamicCols.map(col => (
                <td key={col.key} style={tdStyle(col)}>
                  {col.render(t)}
                </td>
              ))}
            </tr>
          ))}
          {loading && (
            <tr>
              <td colSpan={dynamicCols.length} style={{ textAlign: 'center', color: '#999', padding: 10 }}>
                <span>加载中…</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {/* 已经到底提示 */}
      {!hasMore && !loading && (
        <div style={{
          textAlign: 'center',
          color: '#999',
          fontSize: 13,
          padding: 8,
          background: '#fff'
        }}>
          已经到底了
        </div>
      )}
    </div>
  );
});

export default TaskList;
