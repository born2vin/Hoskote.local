import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Shared route header used on top of the app's shell gradient.
 * Text color is sourced from theme.vars.palette.custom.shellText so it stays
 * legible in both the light and dark color schemes (the shell background
 * swaps between a soft light tint and a deep gradient per mode).
 */
const PageHeader = ({ icon, title, subtitle, action }) => {
  return (
    <Box
      className="page-enter"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: { xs: 3, md: 4 },
      }}
    >
      <Box>
        <Typography
          variant="h3"
          sx={(t) => ({
            color: t.vars.palette.custom.shellText,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          })}
        >
          {icon && <span aria-hidden="true">{icon}</span>}
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="h6"
            sx={(t) => ({ color: t.vars.palette.custom.shellTextMuted, fontWeight: 400, mt: 0.5 })}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Box>
  );
};

export default PageHeader;
