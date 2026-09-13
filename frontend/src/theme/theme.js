import { experimental_extendTheme as extendTheme } from '@mui/material/styles';

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
// Spacing follows MUI's 8px grid (theme.spacing(1) = 8px) — used consistently
// via sx spacing props (1, 2, 3, 4, 5 => 8/16/24/32/40px) across every page.
// Radius scale: 10 (chips/inputs) / 14 (buttons) / 20 (cards, bento tiles) / 28 (modals).
// Shadows: soft, low-contrast "bento" shadows tinted with the brand ink instead
// of pure black, so elevation reads as a gentle lift rather than a hard drop.

const radius = { sm: 10, md: 14, lg: 20, xl: 28 };

const softShadow = (i) => {
  const tiers = [
    'none',
    '0 1px 2px rgba(15, 23, 42, 0.05)',
    '0 2px 8px -2px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)',
    '0 6px 16px -4px rgba(15, 23, 42, 0.10), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
    '0 12px 24px -6px rgba(15, 23, 42, 0.12), 0 4px 8px -4px rgba(15, 23, 42, 0.06)',
    '0 24px 40px -10px rgba(15, 23, 42, 0.16), 0 8px 16px -8px rgba(15, 23, 42, 0.08)',
  ];
  return tiers[Math.min(i, tiers.length - 1)];
};
const shadows = Array.from({ length: 25 }, (_, i) => softShadow(i === 0 ? 0 : Math.ceil(i / 5)));

// Brand: deep teal (identity) + indigo/violet (interactive accent).
const brand = {
  tealDeep: '#173139',
  teal: '#244855',
  tealMid: '#406D7E',
  tealLight: '#90AEAD',
  accent: '#6366f1',
  accentLight: '#8b5cf6',
  accentDark: '#4338ca',
};

export const theme = extendTheme({
  cssVarPrefix: 'app',
  shape: { borderRadius: radius.lg },
  shadows,
  colorSchemes: {
    light: {
      palette: {
        primary: { main: brand.teal, light: brand.tealMid, dark: brand.tealDeep, contrastText: '#ffffff' },
        secondary: { main: brand.accent, light: brand.accentLight, dark: brand.accentDark, contrastText: '#ffffff' },
        success: { main: '#10b981', light: '#34d399', dark: '#059669' },
        warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
        error: { main: '#ef4444', light: '#f87171', dark: '#dc2626' },
        info: { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb' },
        background: { default: '#f3f6f7', paper: '#ffffff' },
        text: { primary: '#0f172a', secondary: '#5b6b76' },
        divider: 'rgba(15, 23, 42, 0.08)',
        custom: {
          shellGradient:
            'radial-gradient(at 15% 0%, rgba(99, 102, 241, 0.10) 0px, transparent 50%),' +
            'radial-gradient(at 85% 15%, rgba(36, 72, 85, 0.12) 0px, transparent 50%),' +
            'radial-gradient(at 75% 100%, rgba(144, 174, 173, 0.20) 0px, transparent 50%),' +
            '#f3f6f7',
          shellText: '#0f172a',
          shellTextMuted: 'rgba(15, 23, 42, 0.68)',
          glassBg: 'rgba(255, 255, 255, 0.70)',
          glassBorder: 'rgba(255, 255, 255, 0.60)',
          glassStrong: 'rgba(255, 255, 255, 0.85)',
          navBg: 'rgba(255, 255, 255, 0.75)',
        },
      },
    },
    dark: {
      palette: {
        primary: { main: brand.tealLight, light: '#b7cccb', dark: brand.tealMid, contrastText: '#0b1416' },
        secondary: { main: '#818cf8', light: '#a5b4fc', dark: brand.accent, contrastText: '#0b1416' },
        success: { main: '#34d399', light: '#6ee7b7', dark: '#10b981' },
        warning: { main: '#fbbf24', light: '#fcd34d', dark: '#f59e0b' },
        error: { main: '#f87171', light: '#fca5a5', dark: '#ef4444' },
        info: { main: '#60a5fa', light: '#93c5fd', dark: '#3b82f6' },
        background: { default: '#0b1220', paper: '#111a2c' },
        text: { primary: '#f1f5f9', secondary: '#94a3b8' },
        divider: 'rgba(255, 255, 255, 0.08)',
        custom: {
          shellGradient:
            'radial-gradient(at 15% 0%, rgba(99, 102, 241, 0.16) 0px, transparent 50%),' +
            'radial-gradient(at 85% 15%, rgba(64, 109, 126, 0.28) 0px, transparent 50%),' +
            'radial-gradient(at 75% 100%, rgba(23, 49, 57, 0.55) 0px, transparent 50%),' +
            'linear-gradient(160deg, #0b1220 0%, #101c2c 55%, #142534 100%)',
          shellText: '#f8fafc',
          shellTextMuted: 'rgba(248, 250, 252, 0.72)',
          glassBg: 'rgba(17, 24, 39, 0.62)',
          glassBorder: 'rgba(255, 255, 255, 0.10)',
          glassStrong: 'rgba(17, 24, 39, 0.85)',
          navBg: 'rgba(11, 18, 32, 0.72)',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontSize: 'clamp(2.25rem, 1.8rem + 2vw, 3.25rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em' },
    h2: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontSize: 'clamp(1.9rem, 1.6rem + 1.4vw, 2.6rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.025em' },
    h3: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontSize: 'clamp(1.6rem, 1.4rem + 1vw, 2.1rem)', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' },
    h4: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.015em' },
    h5: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
    h6: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    button: { fontWeight: 600, letterSpacing: '0.01em' },
  },
  transitions: {
    easing: { emphasized: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (t) => ({
        html: { colorScheme: 'light dark' },
        body: {
          background: t.vars.palette.custom.shellGradient,
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          transition: 'background-color 0.4s ease',
        },
        '@media (prefers-reduced-motion: reduce)': {
          '*': {
            animationDuration: '0.001ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.001ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      }),
    },
    MuiButtonBase: {
      defaultProps: { disableRipple: false },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          background: t.vars.palette.custom.navBg,
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: `1px solid ${t.vars.palette.custom.glassBorder}`,
          color: t.vars.palette.text.primary,
          boxShadow: 'none',
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderRadius: radius.lg,
          backgroundColor: t.vars.palette.background.paper,
          backgroundImage: 'none',
          border: `1px solid ${t.vars.palette.divider}`,
          boxShadow: softShadow(2),
          transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease',
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          backgroundImage: 'none',
          border: `1px solid ${t.vars.palette.divider}`,
        }),
        rounded: { borderRadius: radius.lg },
        elevation0: { border: 'none' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme: t }) => ({
          borderRadius: radius.xl,
          background: t.vars.palette.custom.glassStrong,
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: `1px solid ${t.vars.palette.custom.glassBorder}`,
          boxShadow: softShadow(5),
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 22px',
          boxShadow: 'none',
          transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease, background 0.2s ease',
          '&:hover': { boxShadow: softShadow(2), transform: 'translateY(-2px)' },
          '&:active': { transform: 'translateY(0) scale(0.97)' },
        },
        // Scoped to the primary color only (not the bare `contained` key) so
        // semantic colors — success/error/warning/info/secondary — keep their
        // own solid, accessible fill instead of all sharing one gradient.
        containedPrimary: {
          backgroundImage: `linear-gradient(135deg, ${brand.teal} 0%, ${brand.accent} 100%)`,
          color: '#fff',
          '&:hover': {
            backgroundImage: `linear-gradient(135deg, ${brand.tealDeep} 0%, ${brand.accentDark} 100%)`,
            boxShadow: softShadow(2),
          },
        },
        outlined: { borderWidth: '1.5px', '&:hover': { borderWidth: '1.5px' } },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), background-color 0.2s ease',
          '&:hover': { transform: 'translateY(-1px) scale(1.06)' },
          '&:active': { transform: 'scale(0.92)' },
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderRadius: radius.md,
          backgroundColor: t.vars.palette.background.paper,
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
          '&.Mui-focused': { boxShadow: `0 0 0 4px rgba(99, 102, 241, 0.15)` },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 999, fontWeight: 600, fontSize: '0.75rem' },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 48 },
        indicator: ({ theme: t }) => ({
          height: '100%',
          borderRadius: radius.sm,
          backgroundColor: 'rgba(99, 102, 241, 0.12)',
          zIndex: 0,
        }),
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          margin: '6px 4px',
          minHeight: 40,
          textTransform: 'none',
          fontWeight: 600,
          zIndex: 1,
          transition: 'color 0.2s ease',
          '&.Mui-selected': { color: brand.accent },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: ({ theme: t }) => ({ borderRadius: 999, backgroundColor: t.vars.palette.divider }),
        bar: { borderRadius: 999 },
      },
    },
    MuiAvatar: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme: t }) => ({
          background: t.vars.palette.custom.glassStrong,
          backdropFilter: 'blur(12px)',
          color: t.vars.palette.text.primary,
          border: `1px solid ${t.vars.palette.divider}`,
          borderRadius: radius.sm,
          fontSize: '0.75rem',
          boxShadow: softShadow(2),
        }),
      },
    },
  },
});

export default theme;
