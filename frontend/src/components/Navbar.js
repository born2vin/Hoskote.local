import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
    { label: 'Ideas', path: '/ideas', icon: <Lightbulb /> },
    { label: 'Alerts', path: '/alerts', icon: <Warning /> },
    { label: 'Marketplace', path: '/marketplace', icon: <Store /> },
    { label: 'Expenses', path: '/expenses', icon: <AccountBalance /> },
  ];

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

  return (
    <AppBar 
      position="static" 
      elevation={0} 
      sx={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        color: '#1e293b',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
              C
            </Typography>
          </Box>
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              fontWeight: 700, 
              color: '#1e293b',
              fontSize: '1.25rem',
            }}
          >
            Community Hub
          </Typography>
        </Box>
        
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 3 }}>
          {menuItems.map((item) => (
            <Tooltip title={item.label} key={item.path}>
              <Button
                color="inherit"
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 3,
                  px: 2,
                  py: 1,
                  color: location.pathname === item.path ? '#6366f1' : '#64748b',
                  backgroundColor: location.pathname === item.path ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    color: '#6366f1',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                {item.label}
              </Button>
            </Tooltip>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Notifications">
            <IconButton
              size="medium"
              color="inherit"
              sx={{
                color: '#64748b',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  color: '#6366f1',
                },
              }}
            >
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Profile">
            <IconButton
              size="medium"
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              sx={{
                ml: 1,
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                },
              }}
            >
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
        
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          sx={{
            mt: 1,
            '& .MuiPaper-root': {
              borderRadius: 3,
              minWidth: 200,
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
              border: '1px solid rgb(226 232 240)',
            },
          }}
        >
          <Box sx={{ px: 2, py: 1, borderBottom: '1px solid rgb(226 232 240)' }}>
            <Typography variant="body2" color="text.secondary">
              Signed in as
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {user?.full_name || user?.username}
            </Typography>
          </Box>
          <MenuItem 
            onClick={handleProfile}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
              },
            }}
          >
            <AccountCircle sx={{ mr: 2, color: '#64748b' }} />
            Profile Settings
          </MenuItem>
          <MenuItem 
            onClick={handleLogout}
            sx={{
              py: 1.5,
              px: 2,
              color: '#ef4444',
              '&:hover': {
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
              },
            }}
          >
            <Logout sx={{ mr: 2 }} />
            Sign Out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;