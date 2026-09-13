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
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { issuesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';

const Issues = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'Admin' || user?.role === 'Delegated Admin';

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      category: 'Infrastructure',
      description: '',
      status: 'Open',
    },
  });

  const { data: issues, isLoading } = useQuery(
    ['issues', filterStatus, filterCategory],
    () => issuesApi.getAll({ status: filterStatus || undefined, category: filterCategory || undefined }),
    { keepPreviousData: true }
  );

  const createMutation = useMutation(issuesApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('issues');
      setOpen(false);
      reset();
    },
  });

  const updateStatusMutation = useMutation(
    ({ id, data }) => issuesApi.updateStatus(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('issues');
      },
    }
  );

  const categories = [
    'Infrastructure',
    'Utilities',
    'Security',
    'Landscaping',
    'Cleaning',
    'Noise',
    'Parking',
    'Other'
  ];

  const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return 'success';
      case 'In Progress':
        return 'info';
      default:
        return 'warning';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Infrastructure': 'error',
      'Security': 'warning',
      'Utilities': 'info',
      'Landscaping': 'success',
      'Cleaning': 'primary',
      'Noise': 'secondary',
      'Parking': 'default',
      'Other': 'default',
    };
    return colors[category] || 'default';
  };

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  const issueList = issues?.data || [];

  return (
    <Box sx={{ minHeight: 'calc(100vh - 80px)', py: 3 }}>
    <Container maxWidth="lg">
      <PageHeader
        icon="🛠️"
        title="Community Issues"
        subtitle="Report and track shared maintenance problems"
        action={
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
            Report Issue
          </Button>
        }
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab label="All Issues" />
            {isAdmin && <Tab label="My Reports" />}
          </Tabs>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Filter by Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Category</InputLabel>
                <Select
                  value={filterCategory}
                  label="Filter by Category"
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {isLoading ? (
        <Typography>Loading issues...</Typography>
      ) : issueList.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary" align="center">
              No issues reported yet. Click "Report Issue" to add one.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {issueList.map((issue) => (
            <Grid item xs={12} md={6} key={issue.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip
                      label={issue.category}
                      color={getCategoryColor(issue.category)}
                      size="small"
                    />
                    <Chip
                      label={issue.status}
                      color={getStatusColor(issue.status)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    {issue.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {issue.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Reported by {issue.author?.full_name || issue.author?.username || 'Unknown'}
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(issue.created_at), 'MMM dd, yyyy')}
                  </Typography>

                  {isAdmin && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Update Status</InputLabel>
                        <Select
                          value={issue.status}
                          label="Update Status"
                          onChange={(e) => updateStatusMutation.mutate({
                            id: issue.id,
                            data: { status: e.target.value }
                          })}
                        >
                          {statuses.map((status) => (
                            <MenuItem key={status} value={status}>{status}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Report New Issue</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  label="Issue Title"
                  fullWidth
                  variant="outlined"
                  {...register('title', { required: 'Title is required' })}
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Category</InputLabel>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Category">
                        {categories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  {...register('description', { required: 'Description is required' })}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isLoading}
            >
              {createMutation.isLoading ? 'Submitting...' : 'Submit Issue'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
    </Box>
  );
};

export default Issues;
