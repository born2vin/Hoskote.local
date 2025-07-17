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
} from '@mui/material';
import {
  Add,
  Person,
  AccessTime,
  AttachMoney,
  KeyboardReturn,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { marketplaceApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const Marketplace = () => {
  const [open, setOpen] = useState(false);
  const [borrowOpen, setBorrowOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [tab, setTab] = useState(0);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const {
    register: borrowRegister,
    handleSubmit: borrowHandleSubmit,
    reset: borrowReset,
    formState: { errors: borrowErrors },
  } = useForm();

  const { data: items, isLoading } = useQuery('marketplace-items', () => marketplaceApi.getAll());
  const { data: myItems } = useQuery('my-items', () => marketplaceApi.getMyItems());
  const { data: borrowedItems } = useQuery('borrowed-items', () => marketplaceApi.getBorrowed());

  const createMutation = useMutation(marketplaceApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('marketplace-items');
      queryClient.invalidateQueries('my-items');
      setOpen(false);
      reset();
    },
  });

  const borrowMutation = useMutation(
    ({ id, days }) => marketplaceApi.borrow(id, days),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('marketplace-items');
        queryClient.invalidateQueries('borrowed-items');
        setBorrowOpen(false);
        borrowReset();
      },
    }
  );

  const returnMutation = useMutation(marketplaceApi.return, {
    onSuccess: () => {
      queryClient.invalidateQueries('marketplace-items');
      queryClient.invalidateQueries('borrowed-items');
    },
  });

  const categories = [
    'Electronics',
    'Books',
    'Tools',
    'Furniture',
    'Clothing',
    'Sports',
    'Kitchen',
    'Garden',
    'Automotive',
    'Other'
  ];

  const itemTypes = [
    { value: 'lend', label: 'Available to Lend' },
    { value: 'borrow', label: 'Looking to Borrow' },
    { value: 'both', label: 'Both' }
  ];

  const conditions = [
    'excellent',
    'good',
    'fair',
    'poor'
  ];

  const onSubmit = (data) => {
    createMutation.mutate({
      ...data,
      price_per_day: parseFloat(data.price_per_day) || 0,
      duration_max: parseInt(data.duration_max) || null,
    });
  };

  const onBorrowSubmit = (data) => {
    borrowMutation.mutate({
      id: selectedItem.id,
      days: parseInt(data.days),
    });
  };

  const handleBorrow = (item) => {
    setSelectedItem(item);
    setBorrowOpen(true);
  };

  const handleReturn = (itemId) => {
    returnMutation.mutate(itemId);
  };

  const getTabData = () => {
    switch (tab) {
      case 0: return items?.data || [];
      case 1: return myItems?.data || [];
      case 2: return borrowedItems?.data || [];
      default: return [];
    }
  };

  const getItemTypeColor = (type) => {
    switch (type) {
      case 'lend': return 'success';
      case 'borrow': return 'info';
      case 'both': return 'primary';
      default: return 'default';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return 'success';
      case 'good': return 'info';
      case 'fair': return 'warning';
      case 'poor': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Community Marketplace</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Add Item
        </Button>
      </Box>

      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Browse Items" />
        <Tab label="My Items" />
        <Tab label="Borrowed Items" />
      </Tabs>

      <Grid container spacing={3}>
        {isLoading ? (
          <Grid item xs={12}>
            <Typography>Loading items...</Typography>
          </Grid>
        ) : (
          getTabData().map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {item.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip label={item.category} size="small" />
                    <Chip 
                      label={item.item_type} 
                      size="small" 
                      color={getItemTypeColor(item.item_type)}
                    />
                    <Chip 
                      label={item.condition} 
                      size="small" 
                      color={getConditionColor(item.condition)}
                    />
                    <Chip 
                      label={item.availability ? 'Available' : 'Borrowed'} 
                      size="small" 
                      color={item.availability ? 'success' : 'error'}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                      {item.owner?.full_name?.charAt(0) || 'U'}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      by {item.owner?.full_name || item.owner?.username}
                    </Typography>
                  </Box>

                  {item.price_per_day > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AttachMoney sx={{ width: 16, height: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        ${item.price_per_day}/day
                      </Typography>
                    </Box>
                  )}

                  {item.duration_max && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTime sx={{ width: 16, height: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Max {item.duration_max} days
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTime sx={{ width: 16, height: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(item.created_at), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    {tab === 0 && item.availability && item.owner_id !== user?.id && item.item_type !== 'borrow' && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleBorrow(item)}
                        disabled={borrowMutation.isLoading}
                      >
                        Borrow
                      </Button>
                    )}
                    {tab === 2 && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<KeyboardReturn />}
                        onClick={() => handleReturn(item.id)}
                        disabled={returnMutation.isLoading}
                        color="success"
                      >
                        Return
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Add Item Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Marketplace Item</DialogTitle>
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
              rows={3}
              variant="outlined"
              {...register('description', { required: 'Description is required' })}
              error={!!errors.description}
              helperText={errors.description?.message}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    label="Type"
                    {...register('item_type', { required: 'Type is required' })}
                    error={!!errors.item_type}
                  >
                    {itemTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Condition</InputLabel>
                  <Select
                    label="Condition"
                    {...register('condition', { required: 'Condition is required' })}
                    error={!!errors.condition}
                    defaultValue="good"
                  >
                    {conditions.map((condition) => (
                      <MenuItem key={condition} value={condition}>
                        {condition.charAt(0).toUpperCase() + condition.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price per Day ($)"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  {...register('price_per_day')}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Maximum Duration (days)"
                  type="number"
                  inputProps={{ min: 1 }}
                  {...register('duration_max')}
                  helperText="Leave blank for no limit"
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
              {createMutation.isLoading ? 'Adding...' : 'Add Item'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Borrow Item Dialog */}
      <Dialog open={borrowOpen} onClose={() => setBorrowOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Borrow Item</DialogTitle>
        <form onSubmit={borrowHandleSubmit(onBorrowSubmit)}>
          <DialogContent>
            {selectedItem && (
              <>
                <Typography variant="h6" gutterBottom>
                  {selectedItem.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedItem.description}
                </Typography>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Number of Days"
                  type="number"
                  fullWidth
                  variant="outlined"
                  inputProps={{ 
                    min: 1, 
                    max: selectedItem.duration_max || 365 
                  }}
                  {...borrowRegister('days', { 
                    required: 'Number of days is required',
                    min: { value: 1, message: 'Must be at least 1 day' },
                    max: { 
                      value: selectedItem.duration_max || 365, 
                      message: `Cannot exceed ${selectedItem.duration_max || 365} days` 
                    }
                  })}
                  error={!!borrowErrors.days}
                  helperText={borrowErrors.days?.message}
                />
                {selectedItem.price_per_day > 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Cost: ${selectedItem.price_per_day}/day
                  </Typography>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBorrowOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={borrowMutation.isLoading}
            >
              {borrowMutation.isLoading ? 'Borrowing...' : 'Borrow Item'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Marketplace;