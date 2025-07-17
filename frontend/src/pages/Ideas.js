import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  Add,
  ThumbUp,
  ThumbDown,
  Person,
  AccessTime,
  Lightbulb,
  TrendingUp,
  CheckCircle,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ideasApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const Ideas = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { data: ideas, isLoading } = useQuery('ideas', () => ideasApi.getAll());

  const createMutation = useMutation(ideasApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('ideas');
      setOpen(false);
      reset();
    },
  });

  const voteMutation = useMutation(
    ({ id, voteType }) => ideasApi.vote(id, voteType),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('ideas');
      },
    }
  );

  const categories = [
    'Environment',
    'Education',
    'Health',
    'Infrastructure',
    'Safety',
    'Technology',
    'Social',
    'Economic',
    'Other'
  ];

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  const handleVote = (ideaId, voteType) => {
    voteMutation.mutate({ id: ideaId, voteType });
  };

  const filteredIdeas = ideas?.data?.filter((idea) => {
    if (tab === 0) return true; // All
    if (tab === 1) return idea.status === 'pending';
    if (tab === 2) return idea.status === 'approved';
    if (tab === 3) return idea.author_id === user?.id;
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'implemented': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle />;
      case 'implemented': return <TrendingUp />;
      default: return <Lightbulb />;
    }
  };

  const getCategoryGradient = (category) => {
    const gradients = {
      Environment: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      Education: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      Health: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      Infrastructure: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      Safety: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      Technology: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      Social: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      Economic: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      Other: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    };
    return gradients[category] || gradients.Other;
  };

  return (
    <Box sx={{ 
      background: 'transparent',
      minHeight: 'calc(100vh - 80px)',
      py: 3,
    }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700,
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                mb: 1,
              }}
            >
              💡 Community Ideas
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 400,
              }}
            >
              Share your vision for a better community
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: 3,
              px: 3,
              py: 1.5,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              },
            }}
          >
            Share Idea
          </Button>
        </Box>

        <Box sx={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 3,
          mb: 3,
        }}>
          <Tabs 
            value={tab} 
            onChange={(e, newValue) => setTab(newValue)} 
            sx={{ 
              px: 2,
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '0.95rem',
              },
            }}
          >
            <Tab label="All Ideas" />
            <Tab label="Pending" />
            <Tab label="Approved" />
            <Tab label="My Ideas" />
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          {isLoading ? (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Box className="loading-spinner" sx={{ 
                  width: 40, 
                  height: 40, 
                  border: '4px solid rgba(255,255,255,0.3)',
                  borderTop: '4px solid white',
                  borderRadius: '50%',
                  mx: 'auto',
                  mb: 2,
                }} />
                <Typography sx={{ color: 'white' }}>Loading ideas...</Typography>
              </Box>
            </Grid>
          ) : (
            filteredIdeas?.map((idea, index) => (
              <Grid item xs={12} md={6} lg={4} key={idea.id}>
                <Fade in={true} timeout={300 + index * 100}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 3,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {/* Category Badge */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Chip
                          icon={getStatusIcon(idea.status)}
                          label={idea.category}
                          sx={{
                            background: getCategoryGradient(idea.category),
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            '& .MuiChip-icon': {
                              color: 'white',
                            },
                          }}
                        />
                        <Chip 
                          label={idea.status} 
                          size="small" 
                          color={getStatusColor(idea.status)}
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>

                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                        {idea.title}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 3,
                          lineHeight: 1.6,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {idea.description}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            mr: 1.5, 
                            fontSize: '0.875rem',
                            background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                          }}
                        >
                          {idea.author?.full_name?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {idea.author?.full_name || idea.author?.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(idea.created_at), 'MMM dd, yyyy')}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Upvote">
                            <IconButton
                              size="small"
                              onClick={() => handleVote(idea.id, 'up')}
                              disabled={voteMutation.isLoading}
                              sx={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                borderRadius: 2,
                                px: 1.5,
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                  transform: 'scale(1.1)',
                                },
                              }}
                            >
                              <ThumbUp sx={{ fontSize: 16, mr: 0.5 }} />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {idea.votes_up}
                              </Typography>
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Downvote">
                            <IconButton
                              size="small"
                              onClick={() => handleVote(idea.id, 'down')}
                              disabled={voteMutation.isLoading}
                              sx={{
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: 'white',
                                borderRadius: 2,
                                px: 1.5,
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                  transform: 'scale(1.1)',
                                },
                              }}
                            >
                              <ThumbDown sx={{ fontSize: 16, mr: 0.5 }} />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {idea.votes_down}
                              </Typography>
                            </IconButton>
                          </Tooltip>
                        </Box>
                        
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          #{idea.id}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))
          )}
        </Grid>

        {/* Create Idea Dialog */}
        <Dialog 
          open={open} 
          onClose={() => setOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle sx={{ 
            pb: 1,
            fontSize: '1.5rem',
            fontWeight: 600,
          }}>
            💡 Share Your Idea
          </DialogTitle>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Title"
                fullWidth
                variant="outlined"
                {...register('title', { required: 'Title is required' })}
                error={!!errors.title}
                helperText={errors.title?.message}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                {...register('description', { required: 'Description is required' })}
                error={!!errors.description}
                helperText={errors.description?.message}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  label="Category"
                  {...register('category', { required: 'Category is required' })}
                  error={!!errors.category}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: getCategoryGradient(category),
                            mr: 1,
                          }}
                        />
                        {category}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button 
                onClick={() => setOpen(false)}
                sx={{ borderRadius: 2 }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                disabled={createMutation.isLoading}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  borderRadius: 2,
                  px: 3,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  },
                }}
              >
                {createMutation.isLoading ? 'Sharing...' : 'Share Idea'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Ideas;