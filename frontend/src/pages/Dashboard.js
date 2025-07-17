import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  Lightbulb,
  Warning,
  Store,
  AccountBalance,
  TrendingUp,
  People,
  Notifications,
  Assignment,
  ArrowForward,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { ideasApi, alertsApi, marketplaceApi, expensesApi } from '../services/api';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: ideas } = useQuery('recent-ideas', () => ideasApi.getAll({ limit: 5 }));
  const { data: activeAlerts } = useQuery('active-alerts', () => alertsApi.getActive({ limit: 5 }));
  const { data: marketplaceItems } = useQuery('marketplace-items', () => marketplaceApi.getAll({ limit: 5 }));
  const { data: expenses } = useQuery('recent-expenses', () => expensesApi.getAll({ limit: 5, my_expenses_only: true }));

  const quickActions = [
    {
      title: t('dashboard.shareIdea.title'),
      description: t('dashboard.shareIdea.description'),
      icon: <Lightbulb />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      action: () => navigate('/ideas'),
    },
    {
      title: t('dashboard.reportAlert.title'),
      description: t('dashboard.reportAlert.description'),
      icon: <Warning />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      action: () => navigate('/alerts'),
    },
    {
      title: t('dashboard.browseItems.title'),
      description: t('dashboard.browseItems.description'),
      icon: <Store />,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      action: () => navigate('/marketplace'),
    },
    {
      title: t('dashboard.splitExpenses.title'),
      description: t('dashboard.splitExpenses.description'),
      icon: <AccountBalance />,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      action: () => navigate('/expenses'),
    },
  ];

  const stats = [
    {
      title: 'Active Ideas',
      value: ideas?.data?.length || 0,
      icon: <TrendingUp />,
      color: '#10b981',
      progress: 75,
    },
    {
      title: 'Safety Alerts',
      value: activeAlerts?.data?.length || 0,
      icon: <Notifications />,
      color: '#ef4444',
      progress: 25,
    },
    {
      title: 'Items Available',
      value: marketplaceItems?.data?.length || 0,
      icon: <Store />,
      color: '#3b82f6',
      progress: 60,
    },
    {
      title: 'Pending Expenses',
      value: expenses?.data?.filter(e => e.status === 'pending').length || 0,
      icon: <Assignment />,
      color: '#8b5cf6',
      progress: 40,
    },
  ];

  return (
    <Box sx={{ 
      background: 'transparent',
      minHeight: 'calc(100vh - 80px)',
      py: 3,
    }}>
      <Container maxWidth="lg">
        {/* Welcome Section */}
        <Box sx={{ mb: 5 }}>
          <Typography 
            variant="h3" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            {t('dashboard.welcomeBack', { name: user?.full_name?.split(' ')[0] || user?.username })}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 400,
            }}
          >
            {t('dashboard.happeningToday')}
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: stat.color, 
                        mr: 2,
                        width: 48,
                        height: 48,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={stat.progress} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: stat.color,
                        borderRadius: 3,
                      },
                    }} 
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12}>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 600,
                color: 'white',
                mb: 3,
              }}
            >
              {t('dashboard.quickActions')}
            </Typography>
          </Grid>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3,
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  },
                }}
                onClick={action.action}
              >
                <CardContent sx={{ textAlign: 'center', py: 4, px: 3 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 3,
                      background: action.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {React.cloneElement(action.icon, { 
                      sx: { color: 'white', fontSize: 28 } 
                    })}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {action.description}
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<ArrowForward />}
                    sx={{
                      background: action.gradient,
                      color: 'white',
                      borderRadius: 2,
                      px: 2,
                      '&:hover': {
                        background: action.gradient,
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Activity */}
        <Grid container spacing={3}>
          {/* Recent Ideas */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    💡 Latest Ideas
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => navigate('/ideas')}
                    sx={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    <Add />
                  </IconButton>
                </Box>
                {ideas?.data?.slice(0, 3).map((idea) => (
                  <Box key={idea.id} sx={{ mb: 3, pb: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                    <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
                      {idea.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label={idea.category} 
                        size="small" 
                        sx={{ 
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          color: 'white',
                          fontWeight: 500,
                        }}
                      />
                      <Chip 
                        label={idea.status} 
                        size="small" 
                        color={idea.status === 'approved' ? 'success' : 'default'}
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      by {idea.author?.full_name || idea.author?.username}
                    </Typography>
                  </Box>
                ))}
                <Button
                  fullWidth
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/ideas')}
                  sx={{
                    mt: 2,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    borderRadius: 2,
                    py: 1,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    },
                  }}
                >
                  View All Ideas
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Active Alerts */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    🚨 Safety Updates
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => navigate('/alerts')}
                    sx={{
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    <Add />
                  </IconButton>
                </Box>
                {activeAlerts?.data?.slice(0, 3).map((alert) => (
                  <Box key={alert.id} sx={{ mb: 3, pb: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                    <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
                      {alert.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label={alert.alert_type.replace('_', ' ')} 
                        size="small" 
                        sx={{
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          color: 'white',
                          fontWeight: 500,
                        }}
                      />
                      <Chip 
                        label={alert.severity} 
                        size="small" 
                        color={
                          alert.severity === 'high' || alert.severity === 'critical' 
                            ? 'error' 
                            : alert.severity === 'medium' 
                            ? 'warning' 
                            : 'default'
                        }
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      📍 {alert.location}
                    </Typography>
                  </Box>
                ))}
                <Button
                  fullWidth
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/alerts')}
                  sx={{
                    mt: 2,
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    borderRadius: 2,
                    py: 1,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    },
                  }}
                >
                  View All Alerts
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;