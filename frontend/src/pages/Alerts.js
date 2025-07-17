import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add,
  Warning,
  LocationOn,
  AccessTime,
  CheckCircle,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { alertsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const Alerts = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { data: alerts, isLoading } = useQuery('alerts', () => alertsApi.getAll());

  const createMutation = useMutation(alertsApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('alerts');
      setOpen(false);
      reset();
    },
  });

  const resolveMutation = useMutation(alertsApi.resolve, {
    onSuccess: () => {
      queryClient.invalidateQueries('alerts');
    },
  });

  const alertTypes = [
    'theft',
    'robbery',
    'emergency',
    'suspicious_activity',
    'vandalism',
    'accident',
    'fire',
    'medical',
    'other'
  ];

  const severityLevels = [
    'low',
    'medium',
    'high',
    'critical'
  ];

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  const handleResolve = (alertId) => {
    resolveMutation.mutate(alertId);
  };

  const filteredAlerts = alerts?.data?.filter((alert) => {
    if (tab === 0) return true; // All
    if (tab === 1) return alert.status === 'active';
    if (tab === 2) return alert.status === 'resolved';
    if (tab === 3) return alert.author_id === user?.id;
    return true;
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'warning';
      case 'resolved': return 'success';
      case 'false_alarm': return 'default';
      default: return 'default';
    }
  };

  return (
  <Box sx={{ 
      background: 'transparent',
      minHeight: 'calc(100vh - 80px)',
      py: 3,
    }}>
    <Container maxWidth="lg">
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
      <Box>
      <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700,
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                mb: 1,
              }}
            > 🚨 Safety Alerts</Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 400,
              }}
            >
              Alert everyone to protect the community
            </Typography>
            </Box>
        <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: 3,
              px: 3,
              py: 1.5,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              },
            }}
          >
          Report Alert
        </Button>
      </Box>
      <Box sx={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 3,
          mb: 3,
        }}>
      <Tabs 
            value={tab} 
            onChange={(e, newValue) => setTab(newValue)} 
            sx={{ 
              px: 2,
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '0.95rem',
              },
            }}>
        <Tab label="All Alerts" />
        <Tab label="Active" />
        <Tab label="Resolved" />
        <Tab label="My Alerts" />
      </Tabs></Box>

      <Grid container spacing={3}>
        {isLoading ? (
          <Grid item xs={12}>
            <Typography>Loading alerts...</Typography>
          </Grid>
        ) : (
          filteredAlerts?.map((alert) => (
            <Grid item xs={12} md={6} lg={4} key={alert.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderLeft: `4px solid ${
                    alert.severity === 'critical' || alert.severity === 'high' 
                      ? '#f44336' 
                      : alert.severity === 'medium' 
                      ? '#ff9800' 
                      : '#2196f3'
                  }`
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Warning 
                      sx={{ 
                        color: 
                          alert.severity === 'critical' || alert.severity === 'high' 
                            ? '#f44336' 
                            : alert.severity === 'medium' 
                            ? '#ff9800' 
                            : '#2196f3',
                        mr: 1 
                      }} 
                    />
                    <Typography variant="h6">
                      {alert.title}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {alert.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      label={alert.alert_type.replace('_', ' ')} 
                      size="small" 
                    />
                    <Chip 
                      label={alert.severity} 
                      size="small" 
                      color={getSeverityColor(alert.severity)}
                    />
                    <Chip 
                      label={alert.status} 
                      size="small" 
                      color={getStatusColor(alert.status)}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ width: 16, height: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {alert.location}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                      {alert.author?.full_name?.charAt(0) || 'U'}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      by {alert.author?.full_name || alert.author?.username}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTime sx={{ width: 16, height: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(alert.created_at), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Box>

                  {alert.status === 'active' && alert.author_id === user?.id && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<CheckCircle />}
                      onClick={() => handleResolve(alert.id)}
                      disabled={resolveMutation.isLoading}
                      color="success"
                    >
                      Mark Resolved
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Create Alert Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Report Safety Alert</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              variant="outlined"
              {...register('title', { required: 'Title is required' })}
              error={!!errors.title}
              helperText={errors.title?.message}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              {...register('description', { required: 'Description is required' })}
              error={!!errors.description}
              helperText={errors.description?.message}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Alert Type</InputLabel>
              <Select
                label="Alert Type"
                {...register('alert_type', { required: 'Alert type is required' })}
                error={!!errors.alert_type}
              >
                {alertTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Severity</InputLabel>
              <Select
                label="Severity"
                {...register('severity', { required: 'Severity is required' })}
                error={!!errors.severity}
                defaultValue="medium"
              >
                {severityLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Location"
              fullWidth
              variant="outlined"
              {...register('location', { required: 'Location is required' })}
              error={!!errors.location}
              helperText={errors.location?.message}
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button 
                type="submit" 
                variant="contained"
                disabled={createMutation.isLoading}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  borderRadius: 2,
                  px: 3,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  },
                }}
              >
              {createMutation.isLoading ? 'Reporting...' : 'Report Alert'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
    </Box>
  );
};

export default Alerts;