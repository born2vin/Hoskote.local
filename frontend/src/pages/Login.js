import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/AuthLayout';

const Login = () => {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    const result = await login(data.username, data.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <AuthLayout title={t('auth.welcomeBack')} subtitle={t('auth.signInToAccount')}>
      {error && (
        <Alert severity="error" sx={{ width: '100%', mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label={t('auth.username')}
          name="username"
          autoComplete="username"
          autoFocus
          {...register('username', { required: t('auth.usernameRequired') })}
          error={!!errors.username}
          helperText={errors.username?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label={t('auth.password')}
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete="current-password"
          {...register('password', { required: t('auth.passwordRequired') })}
          error={!!errors.password}
          helperText={errors.password?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
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
          sx={{ mb: 1 }}
        />

        <Box sx={{ textAlign: 'right', mb: 2 }}>
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={(e) => {
              e.preventDefault();
              navigate('/forgot-password');
            }}
            sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { textDecoration: 'underline', color: 'secondary.main' } }}
          >
            {t('auth.forgotPassword')}
          </Link>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          startIcon={<LoginIcon />}
          sx={{ py: 1.5, fontSize: '1rem' }}
        >
          {loading ? t('auth.signingIn') : t('common.login')}
        </Button>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {t('auth.dontHaveAccount')}{' '}
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                e.preventDefault();
                navigate('/register');
              }}
              sx={{ color: 'secondary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              {t('auth.signUpNow')}
            </Link>
          </Typography>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default Login;
