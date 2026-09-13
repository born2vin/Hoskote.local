import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  Fade
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Language as LanguageIcon,
  Check as CheckIcon
} from '@mui/icons-material';

const LanguageSelector = () => {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const languages = [
    { code: 'en', name: t('languageSelector.languages.en'), flag: '🇺🇸' },
    { code: 'kn', name: t('languageSelector.languages.kn'), flag: '🇮🇳' },
    { code: 'te', name: t('languageSelector.languages.te'), flag: '🇮🇳' }
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    handleClose();
  };

  return (
    <>
      <Tooltip title={t('languageSelector.selectLanguage')} placement="bottom">
        <IconButton onClick={handleClick} sx={{ color: 'text.secondary' }}>
          <LanguageIcon />
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: (theme) => ({
            background: theme.vars.palette.custom.glassStrong,
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: `1px solid ${theme.vars.palette.custom.glassBorder}`,
            minWidth: 200,
            mt: 1,
          }),
        }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={i18n.language === language.code}
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              py: 1.5,
              px: 2,
              transition: 'background-color 0.2s ease',
              '&:hover': {
                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
              },
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.secondary.main, 0.15),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                },
              },
            })}
          >
            <Typography sx={{ fontSize: '1.2em' }}>
              {language.flag}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                flex: 1, 
                fontWeight: i18n.language === language.code ? 600 : 400,
                color: i18n.language === language.code ? 'primary.main' : 'text.primary'
              }}
            >
              {language.name}
            </Typography>
            {i18n.language === language.code && (
              <CheckIcon 
                sx={{ 
                  color: 'primary.main',
                  fontSize: '1.1rem'
                }} 
              />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSelector;