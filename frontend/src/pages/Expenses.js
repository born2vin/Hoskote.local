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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Person,
  AccessTime,
  AttachMoney,
  Payment,
} from '@mui/icons-material';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { expensesApi, usersApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const Expenses = () => {
  const [open, setOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [selectedSplit, setSelectedSplit] = useState(null);
  const [tab, setTab] = useState(0);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      split_type: 'equal',
      participant_ids: [],
    },
  });

  const {
    register: payRegister,
    handleSubmit: payHandleSubmit,
    reset: payReset,
    formState: { errors: payErrors },
  } = useForm();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'participants',
  });

  const splitType = watch('split_type');

  const { data: expenses, isLoading } = useQuery('expenses', () => expensesApi.getAll({ my_expenses_only: true }));
  const { data: splits } = useQuery('my-splits', () => expensesApi.getMySplits());
  const { data: pendingPayments } = useQuery('pending-payments', () => expensesApi.getPendingPayments());
  const { data: users } = useQuery('users', () => usersApi.getAll());

  const createMutation = useMutation(expensesApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('expenses');
      queryClient.invalidateQueries('my-splits');
      queryClient.invalidateQueries('pending-payments');
      setOpen(false);
      reset();
    },
  });

  const payMutation = useMutation(
    ({ id, amount }) => expensesApi.pay(id, amount),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('expenses');
        queryClient.invalidateQueries('my-splits');
        queryClient.invalidateQueries('pending-payments');
        setPayOpen(false);
        payReset();
      },
    }
  );

  const categories = [
    'Maintenance',
    'Utilities',
    'Events',
    'Cleaning',
    'Security',
    'Landscaping',
    'Repairs',
    'Supplies',
    'Other'
  ];

  const onSubmit = (data) => {
    const participantIds = data.participant_ids.length > 0 ? data.participant_ids : [user.id];
    
    const payload = {
      ...data,
      total_amount: parseFloat(data.total_amount),
      participant_ids: participantIds,
      due_date: data.due_date || null,
    };

    if (data.split_type === 'custom' && data.participants) {
      payload.custom_splits = data.participants.map(p => ({
        user_id: parseInt(p.user_id),
        amount_owed: parseFloat(p.amount_owed),
      }));
    }

    createMutation.mutate(payload);
  };

  const onPaySubmit = (data) => {
    payMutation.mutate({
      id: selectedSplit.expense_id,
      amount: parseFloat(data.amount),
    });
  };

  const handlePay = (split) => {
    setSelectedSplit(split);
    setPayOpen(true);
  };

  const getTabData = () => {
    switch (tab) {
      case 0: return expenses?.data || [];
      case 1: return splits?.data || [];
      case 2: return pendingPayments?.data || [];
      default: return [];
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'settled': return 'success';
      case 'cancelled': return 'error';
      default: return 'warning';
    }
  };

  const calculateProgress = (split) => {
    return (split.amount_paid / split.amount_owed) * 100;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Community Expenses</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Create Expense
        </Button>
      </Box>

      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="All Expenses" />
        <Tab label="My Splits" />
        <Tab label="Pending Payments" />
      </Tabs>

      <Grid container spacing={3}>
        {isLoading ? (
          <Grid item xs={12}>
            <Typography>Loading expenses...</Typography>
          </Grid>
        ) : tab === 0 ? (
          // Expenses view
          getTabData().map((expense) => (
            <Grid item xs={12} md={6} lg={4} key={expense.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {expense.title}
                  </Typography>
                  {expense.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {expense.description}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={expense.category} size="small" />
                    <Chip 
                      label={expense.status} 
                      size="small" 
                      color={getStatusColor(expense.status)}
                    />
                    <Chip label={expense.split_type} size="small" />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AttachMoney sx={{ width: 20, height: 20, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="h6" color="primary">
                      ${expense.total_amount.toFixed(2)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Person sx={{ width: 16, height: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {expense.participants?.length || 0} participants
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTime sx={{ width: 16, height: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      Created {format(new Date(expense.created_at), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    Created by {expense.created_by?.full_name || expense.created_by?.username}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          // Splits view
          <Grid item xs={12}>
            <List>
              {getTabData().map((split) => (
                <Card key={split.id} sx={{ mb: 2 }}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <AttachMoney />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={split.expense?.title || 'Expense'}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            Amount: ${split.amount_owed.toFixed(2)} | 
                            Paid: ${split.amount_paid.toFixed(2)} | 
                            Remaining: ${(split.amount_owed - split.amount_paid).toFixed(2)}
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={calculateProgress(split)} 
                            sx={{ mt: 1, mb: 1 }}
                            color={split.is_settled ? 'success' : 'primary'}
                          />
                          <Chip 
                            label={split.is_settled ? 'Settled' : 'Pending'} 
                            size="small" 
                            color={split.is_settled ? 'success' : 'warning'}
                          />
                        </Box>
                      }
                    />
                    {!split.is_settled && (
                      <Button
                        variant="outlined"
                        startIcon={<Payment />}
                        onClick={() => handlePay(split)}
                        disabled={payMutation.isLoading}
                      >
                        Pay
                      </Button>
                    )}
                  </ListItem>
                </Card>
              ))}
            </List>
          </Grid>
        )}
      </Grid>

      {/* Create Expense Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Expense</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  label="Title"
                  fullWidth
                  variant="outlined"
                  {...register('title', { required: 'Title is required' })}
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  {...register('description')}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Total Amount ($)"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                  {...register('total_amount', { 
                    required: 'Amount is required',
                    min: { value: 0.01, message: 'Amount must be greater than 0' }
                  })}
                  error={!!errors.total_amount}
                  helperText={errors.total_amount?.message}
                  sx={{ mb: 2 }}
                />
              </Grid>
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
                  <InputLabel>Split Type</InputLabel>
                  <Select
                    label="Split Type"
                    {...register('split_type')}
                    defaultValue="equal"
                  >
                    <MenuItem value="equal">Equal Split</MenuItem>
                    <MenuItem value="custom">Custom Split</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Due Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  {...register('due_date')}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Participants</InputLabel>
                  <Select
                    label="Participants"
                    multiple
                    {...register('participant_ids')}
                    renderValue={(selected) => 
                      selected.map(id => 
                        users?.data?.find(u => u.id === id)?.full_name || 'Unknown'
                      ).join(', ')
                    }
                  >
                    {users?.data?.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.full_name || user.username}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
              {createMutation.isLoading ? 'Creating...' : 'Create Expense'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Pay Expense Dialog */}
      <Dialog open={payOpen} onClose={() => setPayOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Make Payment</DialogTitle>
        <form onSubmit={payHandleSubmit(onPaySubmit)}>
          <DialogContent>
            {selectedSplit && (
              <>
                <Typography variant="body1" gutterBottom>
                  Expense: {selectedSplit.expense?.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Amount owed: ${selectedSplit.amount_owed.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Already paid: ${selectedSplit.amount_paid.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Remaining: ${(selectedSplit.amount_owed - selectedSplit.amount_paid).toFixed(2)}
                </Typography>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Payment Amount ($)"
                  type="number"
                  fullWidth
                  variant="outlined"
                  inputProps={{ 
                    min: 0.01, 
                    max: selectedSplit.amount_owed - selectedSplit.amount_paid,
                    step: 0.01 
                  }}
                  {...payRegister('amount', { 
                    required: 'Amount is required',
                    min: { value: 0.01, message: 'Amount must be greater than 0' },
                    max: { 
                      value: selectedSplit.amount_owed - selectedSplit.amount_paid, 
                      message: 'Cannot exceed remaining amount' 
                    }
                  })}
                  error={!!payErrors.amount}
                  helperText={payErrors.amount?.message}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={payMutation.isLoading}
            >
              {payMutation.isLoading ? 'Processing...' : 'Make Payment'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Expenses;