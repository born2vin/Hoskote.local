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
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Divider,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
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
  Contacts as ContactsIcon,
  Campaign,
  HowToReg,
  MoreHoriz,
} from '@mui/icons-material';
import { useColorScheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { issuesApi, alertsApi, contactsApi } from '../services/api';
import LanguageSelector from './LanguageSelector';
import useIsMobile from '../hooks/useIsMobile';

const NOTIFICATIONS_POLL_INTERVAL = 60 * 1000;
// First N role-aware nav destinations get a permanent slot in the mobile
// bottom bar; everything past that (Marketplace, Contacts, and the
// Admin-only items) lives behind "More" so the bar never gets cramped.
const BOTTOM_NAV_PRIMARY_COUNT = 4;

const Navbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode, setMode } = useColorScheme();
  const isMobile = useIsMobile();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [moreAnchorEl, setMoreAnchorEl] = useState(null);

  const isAdmin = user?.role === 'Admin' || user?.role === 'Delegated Admin';
  const isDark = mode === 'dark';

  const lastSeenKey = `notifications_last_seen_${user?.username || 'anonymous'}`;
  const [lastSeen, setLastSeen] = useState(
    () => localStorage.getItem(lastSeenKey) || new Date(0).toISOString()
  );

  const { data: recentIssues } = useQuery(
    'nav-recent-issues',
    () => issuesApi.getAll({ limit: 5 }),
    { enabled: !!user, refetchInterval: NOTIFICATIONS_POLL_INTERVAL }
  );
  const { data: recentAlerts } = useQuery(
    'nav-recent-alerts',
    () => alertsApi.getActive({ limit: 5 }),
    { enabled: !!user, refetchInterval: NOTIFICATIONS_POLL_INTERVAL }
  );
  const { data: pendingContacts } = useQuery(
    'nav-pending-contacts',
    () => contactsApi.getPending(),
    { enabled: !!user && isAdmin, refetchInterval: NOTIFICATIONS_POLL_INTERVAL }
  );

  // "New" alerts/issues are relative to when the bell was last opened; a
  // pending admin action stays flagged until someone actually approves or
  // rejects it, so it isn't gated on lastSeen at all.
  const feedItems = [
    ...(recentIssues?.data || []).map((issue) => ({
      id: `issue-${issue.id}`,
      icon: <Construction fontSize="small" />,
      title: issue.title,
      subtitle: `New issue reported · ${issue.status}`,
      created_at: issue.created_at,
      path: '/issues',
    })),
    ...(recentAlerts?.data || []).map((alert) => ({
      id: `alert-${alert.id}`,
      icon: <Warning fontSize="small" />,
      title: alert.title,
      subtitle: `Safety alert · ${alert.severity}`,
      created_at: alert.created_at,
      path: '/alerts',
    })),
  ]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);

  const pendingActionItems = isAdmin
    ? (pendingContacts?.data || []).map((contact) => ({
        id: `contact-${contact.id}`,
        icon: <HowToReg fontSize="small" />,
        title: contact.name,
        subtitle: `Contact awaiting approval · ${contact.category}`,
        created_at: contact.created_at,
        path: '/contacts',
      }))
    : [];

  const newFeedCount = feedItems.filter(
    (item) => new Date(item.created_at) > new Date(lastSeen)
  ).length;
  const badgeCount = newFeedCount + pendingActionItems.length;

  const menuItems = [
    { label: t('navbar.dashboard'), path: '/dashboard', icon: <Dashboard /> },
    { label: t('navbar.ideas'), path: '/ideas', icon: <Lightbulb /> },
    { label: t('navbar.alerts'), path: '/alerts', icon: <Warning /> },
    { label: t('navbar.issues'), path: '/issues', icon: <Construction /> },
    { label: t('navbar.marketplace'), path: '/marketplace', icon: <Store /> },
    { label: t('navbar.contacts', 'Contacts'), path: '/contacts', icon: <ContactsIcon /> },
  ];

  if (isAdmin) {
    menuItems.push({ label: t('navbar.budgeting'), path: '/budgeting', icon: <AccountBalance /> });
    menuItems.push({ label: t('navbar.noticeBoard', 'Notice Board'), path: '/notices', icon: <Campaign /> });
  }

  const primaryNavItems = menuItems.slice(0, BOTTOM_NAV_PRIMARY_COUNT);
  const overflowNavItems = menuItems.slice(BOTTOM_NAV_PRIMARY_COUNT);
  const isOverflowRouteActive = overflowNavItems.some((item) => item.path === location.pathname);
  const bottomNavValue = isOverflowRouteActive
    ? 'more'
    : primaryNavItems.find((item) => item.path === location.pathname)?.path || false;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotifOpen = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
    const now = new Date().toISOString();
    localStorage.setItem(lastSeenKey, now);
    setLastSeen(now);
  };

  const handleNotifItemClick = (path) => {
    handleNotifClose();
    navigate(path);
  };

  const handleMoreOpen = (event) => {
    setMoreAnchorEl(event.currentTarget);
  };

  const handleMoreClose = () => {
    setMoreAnchorEl(null);
  };

  const handleMoreItemClick = (path) => {
    handleMoreClose();
    navigate(path);
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
    <>
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

        {/* Desktop (>=768px): full icon + label row, unchanged from before. */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 0.5, mr: 2 }}>
            {menuItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Tooltip title={item.label} key={item.path}>
                  <Button
                    color="inherit"
                    startIcon={item.icon}
                    onClick={() => navigate(item.path)}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
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
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LanguageSelector />

          <Tooltip title={isDark ? t('navbar.lightMode', 'Switch to light mode') : t('navbar.darkMode', 'Switch to dark mode')}>
            <IconButton
              size="medium"
              onClick={toggleColorMode}
              sx={{ color: 'text.secondary' }}
              aria-label={isDark ? t('navbar.lightMode', 'Switch to light mode') : t('navbar.darkMode', 'Switch to dark mode')}
            >
              {isDark ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>

          <Tooltip title={t('navbar.notifications')}>
            <IconButton
              size="medium"
              sx={{ color: 'text.secondary' }}
              onClick={handleNotifOpen}
              aria-controls="menu-notifications"
              aria-haspopup="true"
              aria-label={t('navbar.notifications')}
            >
              <Badge badgeContent={badgeCount} color="error">
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
          id="menu-notifications"
          anchorEl={notifAnchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={Boolean(notifAnchorEl)}
          onClose={handleNotifClose}
          PaperProps={{ sx: { mt: 1, minWidth: 320, maxWidth: 380, maxHeight: 440 } }}
        >
          {pendingActionItems.length === 0 && feedItems.length === 0 && (
            <MenuItem disabled>
              <ListItemText
                primary="You're all caught up"
                secondary="No new alerts, issues, or pending actions"
              />
            </MenuItem>
          )}

          {pendingActionItems.length > 0 && [
            <ListSubheader key="pending-header" sx={{ lineHeight: '32px' }}>
              Pending Actions
            </ListSubheader>,
            ...pendingActionItems.map((item) => (
              <MenuItem key={item.id} onClick={() => handleNotifItemClick(item.path)} sx={{ whiteSpace: 'normal' }}>
                <ListItemIcon sx={{ color: 'warning.main' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} secondary={item.subtitle} />
              </MenuItem>
            )),
            <Divider key="pending-divider" />,
          ]}

          {feedItems.length > 0 && (
            <ListSubheader sx={{ lineHeight: '32px' }}>Recent Activity</ListSubheader>
          )}
          {feedItems.map((item) => (
            <MenuItem key={item.id} onClick={() => handleNotifItemClick(item.path)} sx={{ whiteSpace: 'normal' }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.title} secondary={item.subtitle} />
            </MenuItem>
          ))}
        </Menu>

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

        {/* Overflow items that don't fit in the mobile bottom bar. */}
        <Menu
          id="menu-bottom-nav-more"
          anchorEl={moreAnchorEl}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={Boolean(moreAnchorEl)}
          onClose={handleMoreClose}
          PaperProps={{ sx: { mb: 1, minWidth: 200 } }}
        >
          {overflowNavItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <MenuItem
                key={item.path}
                selected={active}
                onClick={() => handleMoreItemClick(item.path)}
                aria-current={active ? 'page' : undefined}
              >
                <ListItemIcon sx={{ color: active ? 'secondary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </MenuItem>
            );
          })}
        </Menu>
      </Toolbar>
    </AppBar>

    {/* Mobile (<768px): fixed icon-only bottom bar, replacing the top link row. */}
    {isMobile && (
      <Paper
        elevation={0}
        sx={(t) => ({
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: t.zIndex.appBar,
          borderRadius: 0,
          borderTop: `1px solid ${t.vars.palette.divider}`,
          background: t.vars.palette.custom.navBg,
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          pb: 'env(safe-area-inset-bottom)',
        })}
      >
        <BottomNavigation
          value={bottomNavValue}
          showLabels
          sx={{ height: 56, background: 'transparent' }}
        >
          {primaryNavItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <BottomNavigationAction
                key={item.path}
                value={item.path}
                aria-label={item.label}
                title={item.label}
                onClick={() => navigate(item.path)}
                icon={
                  <Box
                    sx={{
                      display: 'flex',
                      p: 0.5,
                      borderRadius: 2.5,
                      backgroundColor: active ? 'rgba(99, 102, 241, 0.14)' : 'transparent',
                    }}
                  >
                    {item.icon}
                  </Box>
                }
                sx={{
                  minWidth: 44,
                  minHeight: 44,
                  color: 'text.secondary',
                  '&.Mui-selected': { color: 'secondary.main' },
                  '& .MuiBottomNavigationAction-label': { display: 'none' },
                }}
              />
            );
          })}
          {overflowNavItems.length > 0 && (
            <BottomNavigationAction
              value="more"
              aria-label="More navigation options"
              title="More"
              onClick={handleMoreOpen}
              icon={
                <Box
                  sx={{
                    display: 'flex',
                    p: 0.5,
                    borderRadius: 2.5,
                    backgroundColor: isOverflowRouteActive ? 'rgba(99, 102, 241, 0.14)' : 'transparent',
                  }}
                >
                  <MoreHoriz />
                </Box>
              }
              sx={{
                minWidth: 44,
                minHeight: 44,
                color: 'text.secondary',
                '&.Mui-selected': { color: 'secondary.main' },
                '& .MuiBottomNavigationAction-label': { display: 'none' },
              }}
            />
          )}
        </BottomNavigation>
      </Paper>
    )}
    </>
  );
};

export default Navbar;
