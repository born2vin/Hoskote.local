import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TextField,
  Button,
  Box,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, LockReset } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { authApi } from '../services/api';

const ResetPassword = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      await authApi.resetPassword(token, data.newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.detail || t('auth.invalidResetLink'));
    }

    setLoading(false);
  };

  // No token in the URL at all -- nothing to submit, so don't render a
  // form that can only ever fail.
  if (!token) {
    return (
      <AuthLayout title={t('auth.resetPasswordTitle')}>
        <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
          {t('auth.invalidResetLink')}
        </Alert>
        <Button
          component={RouterLink}
          to="/forgot-password"
          fullWidth
          variant="contained"
          sx={{ py: 1.5 }}
        >
          {t('auth.forgotPasswordTitle')}
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={t('auth.resetPasswordTitle')}
      subtitle={t('auth.resetPasswordSubtitle')}
    >
      {error && (
        <Alert severity="error" sx={{ width: '100%', mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ width: '100%', mb: 3, borderRadius: 2 }}>
          {t('auth.passwordResetSuccess')}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="newPassword"
          label={t('auth.newPassword')}
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          autoFocus
          disabled={success}
          {...register('newPassword', {
            required: t('auth.passwordRequired'),
            minLength: { value: 8, message: t('auth.passwordMinLength8') },
            validate: {
              hasLetter: (value) => /[A-Za-z]/.test(value) || t('auth.passwordNeedsLetter'),
              hasNumber: (value) => /\d/.test(value) || t('auth.passwordNeedsNumber'),
            },
          })}
          error={!!errors.newPassword}
          helperText={errors.newPassword?.message}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  sx={{ color: 'text.secondary' }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          id="confirmNewPassword"
          label={t('auth.confirmPassword')}
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          disabled={success}
          {...register('confirmNewPassword', {
            required: t('auth.confirmPasswordRequired'),
            validate: (value) => value === newPassword || t('auth.passwordsDoNotMatch'),
          })}
          error={!!errors.confirmNewPassword}
          helperText={errors.confirmNewPassword?.message}
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading || success}
          startIcon={<LockReset />}
          sx={{ py: 1.5, fontSize: '1rem' }}
        >
          {loading ? t('auth.resettingPassword') : t('auth.resetPasswordButton')}
        </Button>
      </Box>
    </AuthLayout>
  );
};

export default ResetPassword;
