// src/components/SettingsDialog.jsx
import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  List, ListItem, ListItemText, IconButton, TextField, Stack, Divider, Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { useTranslation } from 'react-i18next';

export default function SettingsDialog({ open, onClose, typeApi }) {
  const { t, i18n } = useTranslation();
  // 语言
  const [lang, setLang] = useState(i18n.language);
  // 类型管理
  const [types, setTypes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [newType, setNewType] = useState('');

  // 获取类型列表
  useEffect(() => {
    if (open) {
      typeApi.getTypes().then(setTypes);
    }
  }, [open, typeApi]);

  // 切换语言
  const handleLangChange = (value) => {
    setLang(value);
    i18n.changeLanguage(value);
    localStorage.setItem('appLang', value);
  };

  // 添加新类型
  const handleAddType = async () => {
    const name = newType.trim();
    if (!name || types.some(t => t.name === name)) return;
    const added = await typeApi.addType(name);
    setTypes(types.concat(added));
    setNewType('');
  };

  // 删除类型
  const handleDeleteType = async (id) => {
    await typeApi.deleteType(id);
    setTypes(types.filter(t => t._id !== id));
  };

  // 开始编辑
  const handleEditType = (id, name) => {
    setEditingId(id);
    setEditingValue(name);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    const name = editingValue.trim();
    if (!name || types.some(t => t.name === name)) return;
    const updated = await typeApi.updateType(editingId, name);
    setTypes(types.map(t => t._id === editingId ? updated : t));
    setEditingId(null);
    setEditingValue('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('Settings.Title')}</DialogTitle>
      <DialogContent dividers>
        <Box mb={2}>
          <strong>{t('Settings.Language')}</strong>
          <Stack direction="row" spacing={2} mt={1}>
            {['zh', 'en', 'es'].map(lng => (
              <Button
                key={lng}
                variant={lang === lng ? 'contained' : 'outlined'}
                onClick={() => handleLangChange(lng)}
              >
                {lng === 'zh' ? '中文' : lng === 'en' ? 'English' : 'Español'}
              </Button>
            ))}
          </Stack>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box>
          <strong>{t('Settings.Types')}</strong>
          <List dense>
            {types.map(type => (
              <ListItem
                key={type._id}
                secondaryAction={
                  editingId === type._id ? (
                    <>
                      <IconButton color="primary" onClick={handleSaveEdit}>
                        <SaveIcon />
                      </IconButton>
                      <IconButton color="inherit" onClick={() => setEditingId(null)}>
                        <CancelIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton color="primary" onClick={() => handleEditType(type._id, type.name)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteType(type._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )
                }
              >
                {editingId === type._id ? (
                  <TextField
                    size="small"
                    value={editingValue}
                    onChange={e => setEditingValue(e.target.value)}
                    sx={{ minWidth: 120 }}
                  />
                ) : (
                  <ListItemText primary={type.name} />
                )}
              </ListItem>
            ))}
            {/* 新增类型输入框 */}
            <ListItem>
              <TextField
                placeholder={t('Settings.AddType')}
                size="small"
                value={newType}
                onChange={e => setNewType(e.target.value)}
                sx={{ minWidth: 120 }}
                onKeyDown={e => e.key === 'Enter' && handleAddType()}
              />
              <IconButton color="primary" onClick={handleAddType}>
                <AddIcon />
              </IconButton>
            </ListItem>
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('Settings.Close')}</Button>
      </DialogActions>
    </Dialog>
  );
}
