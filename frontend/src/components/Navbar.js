import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  Lightbulb,
  Warning,
  Store,
  AccountBalance,
  AccountCircle,
  Logout,
  Notifications,
  Construction,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { useColorScheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode, setMode } = useColorScheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const isAdmin = user?.role === 'Admin' || user?.role === 'Delegated Admin';
  const isDark = mode === 'dark';

  const menuItems = [
    { label: t('navbar.dashboard'), path: '/dashboard', icon: <Dashboard /> },
    { label: t('navbar.ideas'), path: '/ideas', icon: <Lightbulb /> },
    { label: t('navbar.alerts'), path: '/alerts', icon: <Warning /> },
    { label: t('navbar.issues'), path: '/issues', icon: <Construction /> },
    { label: t('navbar.marketplace'), path: '/marketplace', icon: <Store /> },
  ];

  if (isAdmin) {
    menuItems.push({ label: t('navbar.budgeting'), path: '/budgeting', icon: <AccountBalance /> });
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const toggleColorMode = () => {
    setMode(isDark ? 'light' : 'dark');
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ py: 1, gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: 0 }}>
          <Box
            sx={(t) => ({
              width: 40,
              height: 40,
              borderRadius: 2.5,
              backgroundImage: `linear-gradient(135deg, ${t.vars.palette.secondary.main} 0%, ${t.vars.palette.secondary.light} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              flexShrink: 0,
            })}
          >
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
              SE
            </Typography>
          </Box>
          <Typography
            variant="h6"
            component="div"
            noWrap
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              fontSize: '1.15rem',
            }}
          >
            {t('navbar.communityHub')}
          </Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, mr: 2 }}>
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Tooltip title={item.label} key={item.path}>
                <Button
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 999,
                    px: 2,
                    py: 1,
                    color: active ? 'secondary.main' : 'text.secondary',
                    backgroundColor: active ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.12)',
                      color: 'secondary.main',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              </Tooltip>
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LanguageSelector />

          <Tooltip title={isDark ? t('navbar.lightMode', 'Switch to light mode') : t('navbar.darkMode', 'Switch to dark mode')}>
            <IconButton size="medium" onClick={toggleColorMode} sx={{ color: 'text.secondary' }}>
              {isDark ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>

          <Tooltip title={t('navbar.notifications')}>
            <IconButton size="medium" sx={{ color: 'text.secondary' }}>
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title={t('common.profile')}>
            <IconButton
              size="medium"
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              sx={{ ml: 0.5 }}
            >
              <Avatar
                sx={(t) => ({
                  width: 36,
                  height: 36,
                  backgroundImage: `linear-gradient(135deg, ${t.vars.palette.secondary.main} 0%, ${t.vars.palette.secondary.light} 100%)`,
                  fontSize: '1rem',
                })}
              >
                {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          keepMounted
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{ sx: { mt: 1, minWidth: 220 } }}
        >
          <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              {t('navbar.signedInAs')}
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {user?.full_name || user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role}
            </Typography>
          </Box>
          <MenuItem onClick={handleProfile} sx={{ py: 1.5, px: 2 }}>
            <AccountCircle sx={{ mr: 2, color: 'text.secondary' }} />
            {t('navbar.profileSettings')}
          </MenuItem>
          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.5,
              px: 2,
              color: 'error.main',
              '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
            }}
          >
            <Logout sx={{ mr: 2 }} />
            {t('common.logout')}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
