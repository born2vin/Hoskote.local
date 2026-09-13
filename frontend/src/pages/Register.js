import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TextField,
  Button,
  Box,
  Alert,
  Link,
  Grid,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/AuthLayout';

const Register = () => {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess(false);

    const result = await registerUser({
      username: data.username,
      email: data.email,
      full_name: data.full_name,
      phone: data.phone || null,
      address: data.address || null,
      password: data.password,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <AuthLayout
      title={t('auth.joinCommunityHub')}
      subtitle={t('auth.createAccount')}
      maxWidth="md"
    >
      {error && (
        <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
          {t('auth.registrationSuccessful')}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="username"
              label={t('auth.username')}
              name="username"
              autoComplete="username"
              {...register('username', {
                required: t('auth.usernameRequired'),
                minLength: { value: 3, message: t('auth.usernameMinLength') },
              })}
              error={!!errors.username}
              helperText={errors.username?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="email"
              label={t('auth.email')}
              name="email"
              autoComplete="email"
              {...register('email', {
                required: t('auth.emailRequired'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('auth.invalidEmail'),
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="full_name"
              label={t('auth.fullName')}
              name="full_name"
              autoComplete="name"
              {...register('full_name', { required: t('auth.fullNameRequired') })}
              error={!!errors.full_name}
              helperText={errors.full_name?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="phone"
              label={t('auth.phoneNumber')}
              name="phone"
              autoComplete="tel"
              {...register('phone')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="address"
              label={t('auth.address')}
              name="address"
              autoComplete="address"
              {...register('address')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name="password"
              label={t('auth.password')}
              type="password"
              id="password"
              autoComplete="new-password"
              {...register('password', {
                required: t('auth.passwordRequired'),
                minLength: { value: 6, message: t('auth.passwordMinLength') },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name="confirmPassword"
              label={t('auth.confirmPassword')}
              type="password"
              id="confirmPassword"
              {...register('confirmPassword', {
                required: t('auth.confirmPasswordRequired'),
                validate: (value) => value === password || t('auth.passwordsDoNotMatch'),
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />
          </Grid>
        </Grid>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2, py: 1.5 }}
          disabled={loading}
        >
          {loading ? t('auth.creatingAccount') : t('common.register')}
        </Button>
        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary" component="span">
            {t('auth.alreadyHaveAccount')}{' '}
          </Typography>
          <Link
            component="button"
            variant="body2"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
            sx={{ color: 'secondary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            {t('auth.signInNow')}
          </Link>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default Register;
