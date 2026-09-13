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
import { authApi } from '../services/api';

const Register = () => {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [villaTaken, setVillaTaken] = useState(false);
  const [checkingVilla, setCheckingVilla] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch('password');

  const villaField = register('villa_number', {
    required: t('auth.villaNumberRequired'),
    pattern: { value: /^\d{3}$/, message: t('auth.villaNumberFormat') },
  });

  const handleVillaBlur = async (e) => {
    const value = e.target.value;
    if (!/^\d{3}$/.test(value)) {
      setVillaTaken(false);
      return;
    }
    setCheckingVilla(true);
    try {
      const response = await authApi.checkVilla(value);
      setVillaTaken(!!response.data?.exists);
    } catch {
      // Non-blocking: if the check itself fails (e.g. network hiccup),
      // don't stop the user from continuing to fill out the form.
      setVillaTaken(false);
    } finally {
      setCheckingVilla(false);
    }
  };

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
      villa_number: data.villa_number,
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
              {...villaField}
              onBlur={(e) => {
                villaField.onBlur(e);
                handleVillaBlur(e);
              }}
              required
              fullWidth
              id="villa_number"
              label={t('auth.villaNumber')}
              inputProps={{ maxLength: 3, inputMode: 'numeric', pattern: '[0-9]*' }}
              error={!!errors.villa_number}
              helperText={
                errors.villa_number?.message
                  || (checkingVilla ? t('common.loading') : (villaTaken ? t('auth.villaNumberTaken') : ' '))
              }
              sx={
                !errors.villa_number && villaTaken
                  ? {
                      '& .MuiOutlinedInput-root fieldset': { borderColor: 'warning.main' },
                      '& .MuiFormHelperText-root': { color: 'warning.main' },
                    }
                  : undefined
              }
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
