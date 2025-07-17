import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  Avatar,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { usersApi } from '../services/api';

const Profile = () => {
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      address: user?.address || '',
    },
  });

  const updateMutation = useMutation(usersApi.updateProfile, {
    onSuccess: () => {
      queryClient.invalidateQueries('user');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                mr: 3, 
                bgcolor: 'primary.main',
                fontSize: '2rem'
              }}
            >
              {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h4" gutterBottom>
                {user?.full_name || user?.username}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Username: {user?.username}
              </Typography>
            </Box>
          </Box>

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Profile updated successfully!
            </Alert>
          )}

          <Typography variant="h5" gutterBottom>
            Update Profile
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  {...register('full_name', { required: 'Full name is required' })}
                  error={!!errors.full_name}
                  helperText={errors.full_name?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  {...register('phone')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Address"
                  {...register('address')}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              disabled={updateMutation.isLoading}
            >
              {updateMutation.isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile;