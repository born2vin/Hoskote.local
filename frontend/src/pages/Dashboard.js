import React from 'react';
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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { ideasApi, alertsApi, marketplaceApi, expensesApi } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: ideas } = useQuery('recent-ideas', () => ideasApi.getAll({ limit: 5 }));
  const { data: activeAlerts } = useQuery('active-alerts', () => alertsApi.getActive({ limit: 5 }));
  const { data: marketplaceItems } = useQuery('marketplace-items', () => marketplaceApi.getAll({ limit: 5 }));
  const { data: expenses } = useQuery('recent-expenses', () => expensesApi.getAll({ limit: 5, my_expenses_only: true }));

  const quickActions = [
    {
      title: 'Share an Idea',
      description: 'Propose a new idea for community betterment',
      icon: <Lightbulb />,
      color: '#4CAF50',
      action: () => navigate('/ideas'),
    },
    {
      title: 'Report Alert',
      description: 'Report safety concerns or incidents',
      icon: <Warning />,
      color: '#FF9800',
      action: () => navigate('/alerts'),
    },
    {
      title: 'Browse Marketplace',
      description: 'Lend or borrow items from neighbors',
      icon: <Store />,
      color: '#2196F3',
      action: () => navigate('/marketplace'),
    },
    {
      title: 'Split Expenses',
      description: 'Share community expenses with others',
      icon: <AccountBalance />,
      color: '#9C27B0',
      action: () => navigate('/expenses'),
    },
  ];

  const stats = [
    {
      title: 'Active Ideas',
      value: ideas?.data?.length || 0,
      icon: <TrendingUp />,
      color: '#4CAF50',
    },
    {
      title: 'Active Alerts',
      value: activeAlerts?.data?.length || 0,
      icon: <Notifications />,
      color: '#FF5722',
    },
    {
      title: 'Available Items',
      value: marketplaceItems?.data?.length || 0,
      icon: <Store />,
      color: '#2196F3',
    },
    {
      title: 'Pending Expenses',
      value: expenses?.data?.filter(e => e.status === 'pending').length || 0,
      icon: <Assignment />,
      color: '#9C27B0',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.full_name || user?.username}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Stay connected with your community
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Quick Actions
          </Typography>
        </Grid>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
              onClick={action.action}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: action.color, 
                    width: 56, 
                    height: 56, 
                    mx: 'auto', 
                    mb: 2 
                  }}
                >
                  {action.icon}
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Ideas */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Recent Ideas</Typography>
                <Button 
                  size="small" 
                  onClick={() => navigate('/ideas')}
                >
                  View All
                </Button>
              </Box>
              {ideas?.data?.slice(0, 3).map((idea) => (
                <Box key={idea.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                  <Typography variant="body1" gutterBottom>
                    {idea.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip label={idea.category} size="small" />
                    <Chip 
                      label={idea.status} 
                      size="small" 
                      color={idea.status === 'approved' ? 'success' : 'default'}
                    />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Active Alerts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Active Alerts</Typography>
                <Button 
                  size="small" 
                  onClick={() => navigate('/alerts')}
                >
                  View All
                </Button>
              </Box>
              {activeAlerts?.data?.slice(0, 3).map((alert) => (
                <Box key={alert.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                  <Typography variant="body1" gutterBottom>
                    {alert.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip label={alert.alert_type} size="small" />
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
                    />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;