// src/components/TopAppBar.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Button,
    Box,
  } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'; 
import { getCurrentUser, logout } from '../utils/authUtils';
import { useTranslation } from 'react-i18next';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsDialog from './SettingsDialog';
import { typeApi } from '../contexts/TypeStore';

  /**
   * Top level app bar
   * @param {boolean}  showHomeButton  是否显示“返回”按钮
   * @param {function} onHomeClick     点击回调
   */
export default function TopAppBar({ showHomeButton = false, onHomeClick }) {
  /* === 菜单开关 === */
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { t, i18n, ready } = useTranslation();
  if (!ready) return null;
  
  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);
  
  const handleMenuOpen  = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  
  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    navigate('/login');
  };
  
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={handleMenuOpen} sx={{ mr: 1 }}>
          <MenuIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => { setSettingsOpen(true); handleMenuClose(); }}>
            <SettingsIcon fontSize="small" sx={{ mr: 1 }} />{t('TopAppBar.settings')}
          </MenuItem>
        </Menu>
        <Typography variant="h6" sx={{ mr: 2 }}>
          WorkLog
        </Typography>
        {showHomeButton && (
          <Button
            color="inherit"
            startIcon={<ArrowBackIosNewIcon />}
            onClick={onHomeClick}
            sx={{ ml: 2 }}
          >
            {t('TopAppBar.BackButton')}
          </Button>
        )}

        <Box sx={{ flexGrow: 1 }} />
        {/* 用户名和登出 */}
        {currentUser && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1">
              {currentUser.username}
            </Typography>
            <Button 
              color="inherit"
              size="small"
              onClick={handleLogout}
              sx={{ minWidth: 0, px: 1, fontSize: '0.75rem' }}
            >
              {t('TopAppBar.logOut')}
            </Button>
          </Box>
        )}
        
      </Toolbar>

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        typeApi={typeApi}
      />
    </AppBar>
    
  );
}
