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
  IconButton,
  Avatar,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add,
  ThumbUp,
  ThumbDown,
  Person,
  AccessTime,
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Community Ideas</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Share Idea
        </Button>
      </Box>

      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="All Ideas" />
        <Tab label="Pending" />
        <Tab label="Approved" />
        <Tab label="My Ideas" />
      </Tabs>

      <Grid container spacing={3}>
        {isLoading ? (
          <Grid item xs={12}>
            <Typography>Loading ideas...</Typography>
          </Grid>
        ) : (
          filteredIdeas?.map((idea) => (
            <Grid item xs={12} md={6} lg={4} key={idea.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {idea.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {idea.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={idea.category} size="small" />
                    <Chip 
                      label={idea.status} 
                      size="small" 
                      color={getStatusColor(idea.status)}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                      {idea.author?.full_name?.charAt(0) || 'U'}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      by {idea.author?.full_name || idea.author?.username}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTime sx={{ width: 16, height: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(idea.created_at), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<ThumbUp />}
                        onClick={() => handleVote(idea.id, 'up')}
                        disabled={voteMutation.isLoading}
                      >
                        {idea.votes_up}
                      </Button>
                      <Button
                        size="small"
                        startIcon={<ThumbDown />}
                        onClick={() => handleVote(idea.id, 'down')}
                        disabled={voteMutation.isLoading}
                      >
                        {idea.votes_down}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Create Idea Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Your Idea</DialogTitle>
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
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={createMutation.isLoading}
            >
              {createMutation.isLoading ? 'Sharing...' : 'Share Idea'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Ideas;