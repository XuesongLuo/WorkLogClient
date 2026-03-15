// src/components/EditorTableComponents/EditTableCells.jsx
import React from 'react';
import { Divider } from '@mui/material';
import EditableTextfield from './EditableTextfield';
import EditableCheckbox from './EditableCheckbox';
import EditableNumberCell from './EditableNumberCell';
import ToggleBox from './ToggleBox';

// PAK 相关单元格组件
const PakToggleCell = React.memo(({ value, onToggleActive, onDateChange, disabled }) => (
  <ToggleBox 
    value={value}
    onToggleActive={onToggleActive}
    onDateChange={onDateChange}
    disabled={disabled}
  />
), (prev, next) => {
    // 只有 pak 相关数据变化时才重新渲染
    prev.value?.active === next.value?.active &&
    prev.value?.start_date === next.value?.start_date &&
    prev.disabled === next.disabled
});

// PAK 的 POUT checkbox - 会响应 pak.active 的变化
const PakPoutCell = React.memo(({ value, onChange, disabled }) => (
  <EditableCheckbox 
    value={!!value}
    disabled={disabled}
    onChange={e => onChange(e.target.checked)}
  />
), (prev, next) => {
    prev.value === next.value && prev.disabled === next.disabled
});

// PAK 的 PACK checkbox
const PakPackCell = React.memo(({ value, onChange, disabled }) => (
  <EditableCheckbox 
    value={!!value}
    disabled={disabled}
    onChange={e => onChange(e.target.checked)}
  />
), (prev, next) => {
    prev.value === next.value && prev.disabled === next.disabled
});

// 通用的估价单元格组件
const EstimateCell = React.memo(({ value, onChange, disabled, }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <EditableCheckbox
        value={!!value?.checked}
        disabled={disabled}
        onChange={e => onChange('checked', e.target.checked)}
        sx={{ marginBottom: '4px' }} 
      />
      <Divider sx={{width: '100%', my: 0.5  }} />
      <EditableNumberCell 
        value={value?.amount ?? ''}
        disabled={disabled}
        onChange={val => onChange('amount', val)}
      />
    </div>
  );
}, (prev, next) =>
  prev.value?.checked === next.value?.checked &&
  prev.value?.amount === next.value?.amount &&
  prev.disabled === next.disabled
);

// WTR 相关单元格组件
const WtrToggleCell = React.memo(({ value, onToggleActive, onDateChange, disabled }) => (
  <ToggleBox 
    value={value}
    onToggleActive={onToggleActive}
    onDateChange={onDateChange}
    disabled={disabled}
  />
), (prev, next) => {
    prev.value?.active === next.value?.active &&
    prev.value?.start_date === next.value?.start_date &&
    prev.disabled === next.disabled
});

// WTR 的各个 checkbox 组件
const WtrCtrcCell = React.memo(({ value, onChange, disabled }) => (
  <EditableCheckbox 
    value={!!value}
    disabled={disabled}
    onChange={e => onChange(e.target.checked)}
  />
), (prev, next) =>
    prev.value === next.value && prev.disabled === next.disabled
);

const WtrDemoCell = React.memo(({ value, onChange, disabled }) => (
  <EditableCheckbox 
    value={!!value}
    disabled={disabled}
    onChange={e => onChange(e.target.checked)}
  />
), (prev, next) =>
    prev.value === next.value && prev.disabled === next.disabled
);

// 继续其他 WTR 字段
const WtrItelCell = React.memo(({ value, onChange, disabled }) => (
  <EditableCheckbox 
    value={!!value}
    disabled={disabled}
    onChange={e => onChange(e.target.checked)}
  />
), (prev, next) =>
    prev.value === next.value && prev.disabled === next.disabled
);

const WtrEqCell = React.memo(({ value, onChange, disabled }) => (
  <EditableCheckbox 
    value={!!value}
    disabled={disabled}
    onChange={e => onChange(e.target.checked)}
  />
), (prev, next) =>
    prev.value === next.value && prev.disabled === next.disabled
);

const WtrPickCell = React.memo(({ value, onChange, disabled }) => (
  <EditableCheckbox 
    value={!!value}
    disabled={disabled}
    onChange={e => onChange(e.target.checked)}
  />
), (prev, next) =>
    prev.value === next.value && prev.disabled === next.disabled
);

// 3. STR 相关单元格组件
const StrToggleCell = React.memo(({ value, onToggleActive, onDateChange, disabled }) => (
  <ToggleBox 
    value={value}
    onToggleActive={onToggleActive}
    onDateChange={onDateChange}
    disabled={disabled}
  />
), (prev, next) =>
    prev.value?.active === next.value?.active &&
    prev.value?.start_date === next.value?.start_date &&
    prev.disabled === next.disabled
);

const StrCtrcCell = React.memo(({ value, onChange, disabled }) => (
  <EditableCheckbox 
    value={!!value}
    disabled={disabled}
    onChange={e => onChange(e.target.checked)}
  />
), (prev, next) =>
    prev.value === next.value && prev.disabled === next.disabled
);

// 基础单元格组件
const LocationCell = React.memo(({ value, onShowDetail }) => (
  <span
    className="location-cell"
    onClick={() => onShowDetail?.()}
    title="点击查看详情"
  >
    {value}
  </span>
), (prev, next) => {
  return prev.value === next.value;
});

const YearCell = React.memo(({ value, onChange, disabled, }) => (
  <EditableTextfield 
      value={value}
      onChange={onChange}
  />
), (prev, next) => prev.value === next.value );

const InsuranceCell = React.memo(({ value, onChange, disabled, }) => (
  <EditableTextfield 
    value={value}
    onChange={onChange}
  />
), (prev, next) =>
    prev.value === next.value
);

const ArolCell = React.memo(({ value, onChange, disabled }) => (
  <EditableCheckbox 
    value={!!value}
    onChange={e => onChange(e.target.checked)}
  />
), (prev, next) => prev.value === next.value
);

const TestCell = React.memo(({ value, onChange, disabled }) => (
  <EditableCheckbox 
    value={!!value}
    onChange={e => onChange(e.target.checked)}
  />
), (prev, next) => prev.value === next.value
);

const PaymentCell = React.memo(({ value, onChange, disabled, }) => (
  <EditableNumberCell 
    value={value}
    onChange={onChange}
  />
), (prev, next) =>
    prev.value === next.value
);

const CommentsCell = React.memo(({ value, onChange, disabled, }) => (
  <EditableTextfield 
    value={value}
    onChange={onChange}
  />
), (prev, next) =>
    prev.value === next.value
);

// 导出所有组件
export {
    LocationCell,
    YearCell,
    InsuranceCell,
    ArolCell,
    TestCell,
    PakToggleCell,
    PakPoutCell,
    PakPackCell,
    WtrToggleCell,
    WtrCtrcCell,
    WtrDemoCell,
    WtrItelCell,
    WtrEqCell,
    WtrPickCell,
    StrToggleCell,
    StrCtrcCell,
    EstimateCell,
    PaymentCell,
    CommentsCell
};