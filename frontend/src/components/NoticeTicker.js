import React from 'react';
import { Box, Typography } from '@mui/material';
import { Campaign } from '@mui/icons-material';
import { useQuery } from 'react-query';
import { noticesApi } from '../services/api';

// Auto-scrolling banner of active notices, shown to every role on the
// Dashboard. The backend's /active endpoint already strict-filters by
// expiry_date, but we re-check on the client too so a notice can never
// flash on screen after it expires while this query's data is stale.
const NoticeTicker = () => {
  const { data } = useQuery('active-notices', () => noticesApi.getActive(), {
    refetchInterval: 5 * 60 * 1000,
  });

  const notices = (data?.data || []).filter(
    (notice) => new Date(notice.expiry_date).getTime() > Date.now()
  );

  if (notices.length === 0) return null;

  // Duplicated so the marquee can loop seamlessly at -50% translation.
  const feed = [...notices, ...notices];

  return (
    <Box
      className="page-enter"
      sx={(t) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        mb: { xs: 3, md: 4 },
        borderRadius: 999,
        border: `1px solid ${t.vars.palette.custom.glassBorder}`,
        background: t.vars.palette.custom.glassBg,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        overflow: 'hidden',
        py: 1.25,
        pl: 2,
        pr: 1,
      })}
    >
      <Box
        sx={(t) => ({
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexShrink: 0,
          pr: 2,
          mr: 1,
          borderRight: `1px solid ${t.vars.palette.divider}`,
        })}
      >
        <Campaign color="secondary" fontSize="small" />
        <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
          Notices
        </Typography>
      </Box>
      <Box sx={{ overflow: 'hidden', flexGrow: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: 'flex',
            width: 'max-content',
            animation: `notice-ticker-scroll ${Math.max(notices.length * 8, 18)}s linear infinite`,
            '@keyframes notice-ticker-scroll': {
              '0%': { transform: 'translateX(0)' },
              '100%': { transform: 'translateX(-50%)' },
            },
            '&:hover': { animationPlayState: 'paused' },
          }}
        >
          {feed.map((notice, index) => (
            <Typography
              key={`${notice.id}-${index}`}
              variant="body2"
              color="text.secondary"
              sx={{ whiteSpace: 'nowrap', pr: 6 }}
            >
              <Box component="strong" sx={{ color: 'text.primary' }}>{notice.title}</Box>
              {' — '}
              {notice.description}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default NoticeTicker;
