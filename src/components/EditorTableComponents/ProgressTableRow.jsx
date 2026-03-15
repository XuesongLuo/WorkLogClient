// src/components/EditorTableComponents/ProgressTableRow.jsx
import React, { useCallback } from 'react';
import _ from 'lodash';
import {
  LocationCell, YearCell, InsuranceCell, ArolCell, TestCell,
  PakToggleCell, PakPoutCell, PakPackCell, EstimateCell,
  WtrToggleCell, WtrCtrcCell, WtrDemoCell, WtrItelCell, WtrEqCell, WtrPickCell,
  StrToggleCell, StrCtrcCell,
  PaymentCell, CommentsCell
} from './EditTableCells';
import ReadonlyGreenCheckbox from './ReadonlyGreenCheckbox';
import ReadonlyToggleBox from './ReadonlyToggleBox';
import ReadonlyEstimateCell from './ReadonlyEstimateCell';

const ProgressTableRow = React.memo(function ProgressTableRow({
  row, isEditing, editRowData, onCellChange, onShowDetail, onRowDoubleClick, trRef
}) {
  // getVal: 优先取 editRowData，否则 row（原数据）
  const getVal = useCallback(
    (path, fallback = '') => {
      if (!isEditing) return _.get(row, path, fallback);
      return _.get(editRowData, path, fallback);
    },
    [row, editRowData, isEditing]
  );
  // onCellChange 代理，path 为 ['pak','estimate','send','amount']
  const cellOnChange = useCallback((path, value) => {
    if (!isEditing) return;
    onCellChange(path, value);
  }, [onCellChange, isEditing]);

  return (
    <tr ref={trRef} onDoubleClick={onRowDoubleClick} className={isEditing ? 'editing-row' : ''} style={{ cursor: 'pointer' }}>
      {/* LOCATION */}
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        <LocationCell value={row.location} onShowDetail={() => onShowDetail(row._id)} />
      </td>
      {/* YEAR */}
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <YearCell value={getVal('year', '')} onChange={val => cellOnChange(['year'], val)} />
          : <span  style={{ fontSize:'12px'}}>{row.year}</span>}
      </td>
      {/* INSURANCE */}
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <InsuranceCell value={getVal('insurance', '')} onChange={val => cellOnChange(['insurance'], val)} />
          : <span style={{ fontSize:'12px'}}>{row.insurance}</span>}
      </td>
      {/* AROL */}
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}> 
        {isEditing
          ? <ArolCell value={getVal('arol', false)} onChange={val => cellOnChange(['arol'], val)} />
          : <ReadonlyGreenCheckbox checked={row.arol} />}
      </td>
      {/* TEST */}
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <TestCell value={getVal('test', false)} onChange={val => cellOnChange(['test'], val)} />
          : <ReadonlyGreenCheckbox checked={row.test} />}
      </td>

      {/* PAK 区块 */}
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <PakToggleCell
              value={{
                active: getVal('pak.active', false),
                start_date: getVal('pak.start_date', ''),
              }}
              onToggleActive={val => cellOnChange(['pak', 'active'], val)}
              onDateChange={val => cellOnChange(['pak', 'start_date'], val)}
              disabled={!editRowData?.pak?.active}
            />
          : <ReadonlyToggleBox section={row.pak} />}
      </td>
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <PakPoutCell value={getVal('pak.pout', false)} onChange={val => cellOnChange(['pak', 'pout'], val)} disabled={!editRowData?.pak?.active} />
          : <ReadonlyGreenCheckbox checked={row.pak?.pout} />}
      </td>
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <PakPackCell value={getVal('pak.pack', false)} onChange={val => cellOnChange(['pak', 'pack'], val)} disabled={!editRowData?.pak?.active} />
          : <ReadonlyGreenCheckbox checked={row.pak?.pack} />}
      </td>
      {/* PAK ESTIMATE 分组 */}
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <EstimateCell
              value={{
                checked: getVal('pak.estimate.send.checked', false),
                amount: getVal('pak.estimate.send.amount', 0),
              }}
              onChange={(field, val) => cellOnChange(['pak', 'estimate', 'send', field], val)}
              disabled={!editRowData?.pak?.active}
            />
          : <ReadonlyEstimateCell
              checked={row.pak?.estimate?.send?.checked}
              amount={row.pak?.estimate?.send?.amount}
              disabled={!row.pak?.active}
            />}
      </td>
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <EstimateCell
              value={{
                checked: getVal('pak.estimate.review.checked', false),
                amount: getVal('pak.estimate.review.amount', 0),
              }}
              onChange={(field, val) => cellOnChange(['pak', 'estimate', 'review', field], val)}
              disabled={!editRowData?.pak?.active}
            />
          : <ReadonlyEstimateCell
              checked={row.pak?.estimate?.review?.checked}
              amount={row.pak?.estimate?.review?.amount}
              disabled={!row.pak?.active}
            />}
      </td>
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <EstimateCell
              value={{
                checked: getVal('pak.estimate.agree.checked', false),
                amount: getVal('pak.estimate.agree.amount', 0),
              }}
              onChange={(field, val) => cellOnChange(['pak', 'estimate', 'agree', field], val)}
              disabled={!editRowData?.pak?.active}
            />
          : <ReadonlyEstimateCell
              checked={row.pak?.estimate?.agree?.checked}
              amount={row.pak?.estimate?.agree?.amount}
              disabled={!row.pak?.active}
            />}
      </td>

      {/* WTR 区块 */}
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <WtrToggleCell
              value={{
                active: getVal('wtr.active', false),
                start_date: getVal('wtr.start_date', ''),
              }}
              onToggleActive={val => cellOnChange(['wtr', 'active'], val)}
              onDateChange={val => cellOnChange(['wtr', 'start_date'], val)}
              disabled={!editRowData?.wtr?.active}
            />
          : <ReadonlyToggleBox section={row.wtr} />}
      </td>
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <WtrCtrcCell value={getVal('wtr.ctrc', false)} onChange={val => cellOnChange(['wtr', 'ctrc'], val)} disabled={!editRowData?.wtr?.active} />
          : <ReadonlyGreenCheckbox checked={row.wtr?.ctrc} />}
      </td>
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <WtrDemoCell value={getVal('wtr.demo', false)} onChange={val => cellOnChange(['wtr', 'demo'], val)} disabled={!editRowData?.wtr?.active} />
          : <ReadonlyGreenCheckbox checked={row.wtr?.demo} />}
      </td>
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <WtrItelCell value={getVal('wtr.itel', false)} onChange={val => cellOnChange(['wtr', 'itel'], val)} disabled={!editRowData?.wtr?.active} />
          : <ReadonlyGreenCheckbox checked={row.wtr?.itel} />}
      </td>
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <WtrEqCell value={getVal('wtr.eq', false)} onChange={val => cellOnChange(['wtr', 'eq'], val)} disabled={!editRowData?.wtr?.active} />
          : <ReadonlyGreenCheckbox checked={row.wtr?.eq} />}
      </td>
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <WtrPickCell value={getVal('wtr.pick', false)} onChange={val => cellOnChange(['wtr', 'pick'], val)} disabled={!editRowData?.wtr?.active} />
          : <ReadonlyGreenCheckbox checked={row.wtr?.pick} />}
      </td>
      {/* WTR ESTIMATE 分组 */}
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <EstimateCell
              value={{
                checked: getVal('wtr.estimate.send.checked', false),
                amount: getVal('wtr.estimate.send.amount', 0),
              }}
              onChange={(field, val) => cellOnChange(['wtr', 'estimate', 'send', field], val)}
              disabled={!editRowData?.wtr?.active}
            />
          : <ReadonlyEstimateCell
              checked={row.wtr?.estimate?.send?.checked}
              amount={row.wtr?.estimate?.send?.amount}
              disabled={!row.wtr?.active}
            />}
      </td>
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <EstimateCell
              value={{
                checked: getVal('wtr.estimate.review.checked', false),
                amount: getVal('wtr.estimate.review.amount', 0),
              }}
              onChange={(field, val) => cellOnChange(['wtr', 'estimate', 'review', field], val)}
              disabled={!editRowData?.wtr?.active}
            />
          : <ReadonlyEstimateCell
              checked={row.wtr?.estimate?.review?.checked}
              amount={row.wtr?.estimate?.review?.amount}
              disabled={!row.wtr?.active}
            />}
      </td>
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <EstimateCell
              value={{
                checked: getVal('wtr.estimate.agree.checked', false),
                amount: getVal('wtr.estimate.agree.amount', 0),
              }}
              onChange={(field, val) => cellOnChange(['wtr', 'estimate', 'agree', field], val)}
              disabled={!editRowData?.wtr?.active}
            />
          : <ReadonlyEstimateCell
              checked={row.wtr?.estimate?.agree?.checked}
              amount={row.wtr?.estimate?.agree?.amount}
              disabled={!row.wtr?.active}
            />}
      </td>

      {/* STR 区块 */}
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <StrToggleCell
              value={{
                active: getVal('str.active', false),
                start_date: getVal('str.start_date', ''),
              }}
              onToggleActive={val => cellOnChange(['str', 'active'], val)}
              onDateChange={val => cellOnChange(['str', 'start_date'], val)}
              disabled={!editRowData?.str?.active}
            />
          : <ReadonlyToggleBox section={row.str} />}
      </td>
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <StrCtrcCell value={getVal('str.ctrc', false)} onChange={val => cellOnChange(['str', 'ctrc'], val)} disabled={!editRowData?.str?.active} />
          : <ReadonlyGreenCheckbox checked={row.str?.ctrc} />}
      </td>
      {/* STR ESTIMATE 分组 */}
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <EstimateCell
              value={{
                checked: getVal('str.estimate.send.checked', false),
                amount: getVal('str.estimate.send.amount', 0),
              }}
              onChange={(field, val) => cellOnChange(['str', 'estimate', 'send', field], val)}
              disabled={!editRowData?.str?.active}
            />
          : <ReadonlyEstimateCell
              checked={row.str?.estimate?.send?.checked}
              amount={row.str?.estimate?.send?.amount}
              disabled={!row.str?.active}
            />}
      </td>
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <EstimateCell
              value={{
                checked: getVal('str.estimate.review.checked', false),
                amount: getVal('str.estimate.review.amount', 0),
              }}
              onChange={(field, val) => cellOnChange(['str', 'estimate', 'review', field], val)}
              disabled={!editRowData?.str?.active}
            />
          : <ReadonlyEstimateCell
              checked={row.str?.estimate?.review?.checked}
              amount={row.str?.estimate?.review?.amount}
              disabled={!row.str?.active}
            />}
      </td>
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <EstimateCell
              value={{
                checked: getVal('str.estimate.agree.checked', false),
                amount: getVal('str.estimate.agree.amount', 0),
              }}
              onChange={(field, val) => cellOnChange(['str', 'estimate', 'agree', field], val)}
              disabled={!editRowData?.str?.active}
            />
          : <ReadonlyEstimateCell
              checked={row.str?.estimate?.agree?.checked}
              amount={row.str?.estimate?.agree?.amount}
              disabled={!row.str?.active}
            />}
      </td>
      {/* PAYMENT */}
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <PaymentCell value={getVal('payment', 0)} onChange={val => cellOnChange(['payment'], val)} />
          : <span style={{ fontSize:'12px'}}>${row.payment}</span>}
      </td>
      {/* COMMENTS */}
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {isEditing
          ? <CommentsCell value={getVal('comments', '')} onChange={val => cellOnChange(['comments'], val)} />
          : <span style={{ fontSize:'12px'}}>{row.comments}</span>}
      </td>
    </tr>
  );
},
(prev, next) => {
  // 只有当前行内容、编辑态或副本变才重新渲染
  if (prev.isEditing !== next.isEditing) return false;
  if (prev.isEditing && prev.editRowData !== next.editRowData) return false;
  if (prev.row !== next.row) return false;
  return true;
});

export default ProgressTableRow;
