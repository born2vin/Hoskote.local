import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Container, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';
import { useColorScheme } from '@mui/material/styles';
import LanguageSelector from './LanguageSelector';

/**
 * Shared shell for the Login / Register screens: brand gradient background,
 * a frosted-glass card, and the app logo mark. Keeping this in one place is
 * what makes the two auth screens look like the same product.
 */
const AuthLayout = ({ title, subtitle, children, maxWidth = 'sm' }) => {
  const { t } = useTranslation();
  const { mode, setMode } = useColorScheme();
  const isDark = mode === 'dark';

  return (
    <Box
      sx={(t) => ({
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: t.vars.palette.custom.shellGradient,
        p: 2,
        position: 'relative',
      })}
    >
      <Box sx={{ position: 'absolute', top: { xs: 12, sm: 20 }, right: { xs: 12, sm: 20 }, display: 'flex', gap: 0.5 }}>
        <LanguageSelector />
        <Tooltip title={isDark ? t('navbar.lightMode') : t('navbar.darkMode')}>
          <IconButton onClick={() => setMode(isDark ? 'light' : 'dark')} sx={{ color: 'text.secondary' }}>
            {isDark ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Tooltip>
      </Box>

      <Container component="main" maxWidth={maxWidth} className="page-enter">
        <Paper
          elevation={0}
          sx={(t) => ({
            padding: { xs: 3, sm: 4, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: t.vars.palette.custom.glassStrong,
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: `1px solid ${t.vars.palette.custom.glassBorder}`,
            borderRadius: 7,
            boxShadow: '0 24px 40px -10px rgba(15, 23, 42, 0.16)',
          })}
        >
          <Box
            sx={(t) => ({
              width: 180,
              height: 72,
              borderRadius: 4,
              backgroundImage: `linear-gradient(135deg, ${t.vars.palette.primary.main} 0%, ${t.vars.palette.secondary.main} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              boxShadow: '0 10px 20px -6px rgba(15, 23, 42, 0.25)',
            })}
          >
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, fontFamily: '"Space Grotesk", sans-serif' }}>
              Supra Enclave
            </Typography>
          </Box>

          <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', color: 'text.primary' }}>
            {title}
          </Typography>

          {subtitle && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center', fontSize: '1.05rem' }}>
              {subtitle}
            </Typography>
          )}

          {children}
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;
