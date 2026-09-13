import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Card,
  Typography,
  Box,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  Lightbulb,
  Warning,
  Store,
  AccountBalance,
  TrendingUp,
  TrendingDown,
  Notifications,
  Assignment,
  ArrowForward,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { ideasApi, alertsApi, marketplaceApi, budgetingApi } from '../services/api';
import PageHeader from '../components/PageHeader';

// A dense, gap-filling bento grid — tiles declare how much space they need
// and `gridAutoFlow: dense` packs the rest around them.
const BentoGrid = ({ children, sx, ...props }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gridAutoFlow: 'dense',
      gap: { xs: 2, sm: 2.5, md: 3 },
      ...sx,
    }}
    {...props}
  >
    {children}
  </Box>
);

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: ideas } = useQuery('recent-ideas', () => ideasApi.getAll({ limit: 5 }));
  const { data: activeAlerts } = useQuery('active-alerts', () => alertsApi.getActive({ limit: 5 }));
  const { data: marketplaceItems } = useQuery('marketplace-items', () => marketplaceApi.getAll({ limit: 5 }));
  const { data: budgetData } = useQuery('budget-overview', () => budgetingApi.getAll({ limit: 100 }));

  const totalIncome = budgetData?.data?.filter(tx => tx.transaction_type === 'Income').reduce((sum, tx) => sum + tx.amount, 0) || 0;
  const totalExpenses = budgetData?.data?.filter(tx => tx.transaction_type === 'Expense').reduce((sum, tx) => sum + tx.amount, 0) || 0;
  const netBalance = totalIncome - totalExpenses;

  const quickActions = [
    {
      title: t('dashboard.shareIdea.title'),
      description: t('dashboard.shareIdea.description'),
      icon: <Lightbulb />,
      colorKey: 'success',
      action: () => navigate('/ideas'),
    },
    {
      title: t('dashboard.reportAlert.title'),
      description: t('dashboard.reportAlert.description'),
      icon: <Warning />,
      colorKey: 'warning',
      action: () => navigate('/alerts'),
    },
    {
      title: t('dashboard.browseItems.title'),
      description: t('dashboard.browseItems.description'),
      icon: <Store />,
      colorKey: 'info',
      action: () => navigate('/marketplace'),
    },
    {
      title: t('dashboard.splitExpenses.title'),
      description: t('dashboard.splitExpenses.description'),
      icon: <AccountBalance />,
      colorKey: 'secondary',
      action: () => navigate('/expenses'),
    },
  ];

  const stats = [
    { title: 'Active Ideas', value: ideas?.data?.length || 0, icon: <TrendingUp />, colorKey: 'success', progress: 75 },
    { title: 'Safety Alerts', value: activeAlerts?.data?.length || 0, icon: <Notifications />, colorKey: 'error', progress: 25 },
    { title: 'Items Available', value: marketplaceItems?.data?.length || 0, icon: <Store />, colorKey: 'info', progress: 60 },
    { title: 'Budget Transactions', value: budgetData?.data?.length || 0, icon: <Assignment />, colorKey: 'secondary', progress: 40 },
  ];

  return (
    <Box sx={{ minHeight: 'calc(100vh - 80px)', py: 3 }}>
      <Container maxWidth="lg">
        <PageHeader
          title={t('dashboard.welcomeBack', { name: user?.full_name?.split(' ')[0] || user?.username })}
          subtitle={t('dashboard.happeningToday')}
        />

        {/* Bento: net balance hero tile + at-a-glance stats */}
        <BentoGrid sx={{ mb: { xs: 3, md: 4 } }}>
          <Card
            sx={{
              gridColumn: { xs: 'span 12', md: 'span 4' },
              gridRow: { md: 'span 2' },
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backgroundImage: (t) => `linear-gradient(135deg, ${t.vars.palette.primary.main} 0%, ${t.vars.palette.secondary.main} 100%)`,
              color: '#fff',
              border: 'none',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <AccountBalance />
                </Avatar>
                <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                  {t('dashboard.netBalance')}
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                ₹{netBalance.toFixed(0)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>{t('dashboard.totalIncome')}</Typography>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingUp fontSize="small" /> ₹{totalIncome.toFixed(0)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>{t('dashboard.totalExpenses')}</Typography>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingDown fontSize="small" /> ₹{totalExpenses.toFixed(0)}
                </Typography>
              </Box>
            </Box>
          </Card>

          {stats.map((stat, index) => (
            <Card key={index} sx={{ gridColumn: { xs: 'span 6', sm: 'span 4', md: 'span 4' }, p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: `${stat.colorKey}.main`, mr: 2, width: 44, height: 44 }}>
                  {stat.icon}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{stat.value}</Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>{stat.title}</Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={stat.progress}
                color={stat.colorKey === 'secondary' ? 'secondary' : stat.colorKey}
                sx={{ height: 6 }}
              />
            </Card>
          ))}
        </BentoGrid>

        {/* Quick actions */}
        <Typography variant="h5" sx={{ fontWeight: 600, color: (t) => t.vars.palette.custom.shellText, mb: 2 }}>
          {t('dashboard.quickActions')}
        </Typography>
        <BentoGrid sx={{ mb: { xs: 3, md: 4 } }}>
          {quickActions.map((action, index) => (
            <Card
              key={index}
              sx={{
                gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' },
                cursor: 'pointer',
                textAlign: 'center',
                py: 4,
                px: 3,
              }}
              onClick={action.action}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 3,
                  backgroundImage: (t) => `linear-gradient(135deg, ${t.vars.palette[action.colorKey].main} 0%, ${t.vars.palette[action.colorKey].dark} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                {React.cloneElement(action.icon, { sx: { color: 'white', fontSize: 26 } })}
              </Box>
              <Typography variant="h6" gutterBottom>{action.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {action.description}
              </Typography>
              <Button size="small" color={action.colorKey === 'secondary' ? 'secondary' : action.colorKey} variant="contained" endIcon={<ArrowForward />}>
                Get Started
              </Button>
            </Card>
          ))}
        </BentoGrid>

        {/* Recent activity */}
        <BentoGrid>
          <Card sx={{ gridColumn: { xs: 'span 12', md: 'span 6' }, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">💡 Latest Ideas</Typography>
              <IconButton size="small" color="success" onClick={() => navigate('/ideas')} sx={{ bgcolor: 'success.main', color: '#fff', '&:hover': { bgcolor: 'success.dark' } }}>
                <Add />
              </IconButton>
            </Box>
            {ideas?.data?.slice(0, 3).map((idea) => (
              <Box key={idea.id} sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
                  {idea.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                  <Chip label={idea.category} size="small" color="secondary" />
                  <Chip label={idea.status} size="small" color={idea.status === 'approved' ? 'success' : 'default'} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  by {idea.author?.full_name || idea.author?.username}
                </Typography>
              </Box>
            ))}
            <Button fullWidth variant="contained" color="success" endIcon={<ArrowForward />} onClick={() => navigate('/ideas')}>
              View All Ideas
            </Button>
          </Card>

          <Card sx={{ gridColumn: { xs: 'span 12', md: 'span 6' }, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">🚨 Safety Updates</Typography>
              <IconButton size="small" onClick={() => navigate('/alerts')} sx={{ bgcolor: 'error.main', color: '#fff', '&:hover': { bgcolor: 'error.dark' } }}>
                <Add />
              </IconButton>
            </Box>
            {activeAlerts?.data?.slice(0, 3).map((alert) => (
              <Box key={alert.id} sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
                  {alert.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                  <Chip label={alert.alert_type.replace('_', ' ')} size="small" color="warning" />
                  <Chip
                    label={alert.severity}
                    size="small"
                    color={
                      alert.severity === 'high' || alert.severity === 'critical'
                        ? 'error'
                        : alert.severity === 'medium'
                        ? 'warning'
                        : 'default'
                    }
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  📍 {alert.location}
                </Typography>
              </Box>
            ))}
            <Button fullWidth variant="contained" color="error" endIcon={<ArrowForward />} onClick={() => navigate('/alerts')}>
              View All Alerts
            </Button>
          </Card>
        </BentoGrid>
      </Container>
    </Box>
  );
};

export default Dashboard;
