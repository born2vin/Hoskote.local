import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  Box,
  Fade
} from '@mui/material';
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

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <>
      <Tooltip title={t('languageSelector.selectLanguage')} placement="bottom">
        <IconButton
          onClick={handleClick}
          sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.2)',
              transform: 'translateY(-2px)',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LanguageIcon fontSize="small" />
            <Typography variant="caption" sx={{ fontSize: '1.2em' }}>
              {currentLanguage.flag}
            </Typography>
          </Box>
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
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            minWidth: 200,
            mt: 1
          }
        }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={i18n.language === language.code}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              py: 1.5,
              px: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'rgba(103, 58, 183, 0.1)',
              },
              '&.Mui-selected': {
                background: 'rgba(103, 58, 183, 0.15)',
                '&:hover': {
                  background: 'rgba(103, 58, 183, 0.2)',
                }
              }
            }}
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