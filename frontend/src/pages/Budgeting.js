import React, { useState, useEffect } from 'react';
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
  Alert,
} from '@mui/material';
import {
  Add,
  AccountBalance,
  TrendingUp,
  TrendingDown,
  Edit,
  Delete,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { budgetingApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';

const Budgeting = () => {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [tab, setTab] = useState(0);
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'Admin' || user?.role === 'Delegated Admin';

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      transaction_type: 'Income',
      category: 'Maintenance',
      amount: '',
      description: '',
      villa_number: '',
      resident_name: '',
      transaction_date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const {
    register: editRegister,
    handleSubmit: editHandleSubmit,
    reset: editReset,
    control: editControl,
    watch: editWatch,
    getValues: editGetValues,
    setValue: editSetValue,
    formState: { errors: editErrors },
  } = useForm();

  const { data: transactions, isLoading } = useQuery(
    ['budgeting', filterType, filterCategory],
    () => budgetingApi.getAll({ transaction_type: filterType || undefined, category: filterCategory || undefined }),
    { keepPreviousData: true }
  );

  const createMutation = useMutation(budgetingApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('budgeting');
      setOpen(false);
      setError('');
      reset();
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || err.message || 'Failed to create transaction';
      setError(msg);
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => budgetingApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('budgeting');
        setEditOpen(false);
        setSelectedTransaction(null);
        setError('');
        editReset();
      },
      onError: (err) => {
        const msg = err.response?.data?.detail || err.message || 'Failed to update transaction';
        setError(msg);
      },
    }
  );

  const deleteMutation = useMutation(
    (id) => budgetingApi.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('budgeting');
      },
    }
  );

  const incomeCategories = ['Maintenance', 'Donation', 'Event'];
  const expenseCategories = ['Utilities', 'Cleaning', 'Security', 'Landscaping', 'Repairs', 'Supplies', 'Other'];
  const categories = [...incomeCategories, ...expenseCategories];

  const transactionTypes = ['Income', 'Expense'];

  const transactionType = watch('transaction_type');

  useEffect(() => {
    const currentCategory = getValues('category');
    const allowedCategories = transactionType === 'Income' ? incomeCategories : expenseCategories;
    if (!allowedCategories.includes(currentCategory)) {
      setValue('category', allowedCategories[0]);
    }
  }, [transactionType]);

  const editTransactionType = editWatch('transaction_type');

  useEffect(() => {
    const currentCategory = editGetValues('category');
    const allowedCategories = editTransactionType === 'Income' ? incomeCategories : expenseCategories;
    if (!allowedCategories.includes(currentCategory)) {
      editSetValue('category', allowedCategories[0]);
    }
  }, [editTransactionType]);

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setError('');
    editReset({
      transaction_type: transaction.transaction_type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      description: transaction.description || '',
      villa_number: transaction.villa_number || '',
      resident_name: transaction.resident_name || '',
      transaction_date: format(new Date(transaction.transaction_date), 'yyyy-MM-dd'),
    });
    setEditOpen(true);
  };

  const onSubmit = (data) => {
    console.log('Submitting budget transaction:', data);
    const payload = {
      ...data,
      amount: parseFloat(data.amount),
    };
    createMutation.mutate(payload, {
      onError: (err) => {
        console.error('Create transaction error:', err);
      }
    });
  };

  const onEditSubmit = (data) => {
    const payload = {
      ...data,
      amount: parseFloat(data.amount),
    };
    updateMutation.mutate({ id: selectedTransaction.id, data: payload }, {
      onError: (err) => {
        console.error('Update transaction error:', err);
      }
    });
  };

  const transactionList = transactions?.data || [];

  const totalIncome = transactionList
    .filter((t) => t.transaction_type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactionList
    .filter((t) => t.transaction_type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <Box sx={{ minHeight: 'calc(100vh - 80px)', py: 3 }}>
    <Container maxWidth="lg">
      <PageHeader
        icon="💰"
        title="Budgeting"
        subtitle="Track community income, expenses, and balance"
        action={
          isAdmin && (
            <Button variant="contained" startIcon={<Add />} onClick={() => { setError(''); setOpen(true); }}>
              Add Transaction
            </Button>
          )
        }
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6">Total Income</Typography>
              </Box>
              <Typography variant="h4" color="success.main" fontWeight={700}>
                ${totalIncome.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingDown sx={{ color: 'error.main', mr: 1 }} />
                <Typography variant="h6">Total Expenses</Typography>
              </Box>
              <Typography variant="h4" color="error.main" fontWeight={700}>
                ${totalExpense.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalance sx={{ color: balance >= 0 ? 'success.main' : 'error.main', mr: 1 }} />
                <Typography variant="h6">Balance</Typography>
              </Box>
              <Typography variant="h4" color={balance >= 0 ? 'success.main' : 'error.main'} fontWeight={700}>
                ${balance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab label="All Transactions" />
            <Tab label="Income" />
            <Tab label="Expenses" />
          </Tabs>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Type</InputLabel>
                <Select
                  value={filterType}
                  label="Filter by Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  {transactionTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
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
        <Typography>Loading transactions...</Typography>
      ) : transactionList.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary" align="center">
              No budget transactions recorded yet.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {transactionList.map((transaction) => (
            <Grid item xs={12} md={6} lg={4} key={transaction.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip
                      label={transaction.transaction_type}
                      color={transaction.transaction_type === 'Income' ? 'success' : 'error'}
                      size="small"
                    />
                    <Chip
                      label={transaction.category}
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  <Typography variant="h6" gutterBottom color={transaction.transaction_type === 'Income' ? 'success.main' : 'error.main'}>
                    {transaction.transaction_type === 'Income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </Typography>

                  {transaction.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {transaction.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {transaction.villa_number ? `Villa ${transaction.villa_number}` : ''}
                      {transaction.resident_name ? ` - ${transaction.resident_name}` : ''}
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                  </Typography>

                  {isAdmin && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleEdit(transaction)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this transaction?')) {
                            deleteMutation.mutate(transaction.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Budget Transaction</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="transaction-type-label">Type</InputLabel>
                  <Controller
                    name="transaction_type"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} labelId="transaction-type-label" label="Type">
                        {transactionTypes.map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="transaction-category-label">Category</InputLabel>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} labelId="transaction-category-label" label="Category">
                        {(transactionType === 'Income' ? incomeCategories : expenseCategories).map((category) => (
                          <MenuItem key={category} value={category}>{category}</MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoFocus
                  label="Amount ($)"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0.01, step: 0.01 }}
                  {...register('amount', {
                    required: 'Amount is required',
                    min: { value: 0.01, message: 'Amount must be greater than 0' },
                  })}
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Transaction Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  {...register('transaction_date', { required: 'Date is required' })}
                  error={!!errors.transaction_date}
                  helperText={errors.transaction_date?.message}
                  sx={{ mb: 2 }}
                />
              </Grid>
              {transactionType === 'Income' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Villa Number"
                    fullWidth
                    {...register('villa_number', { required: 'Villa number is required for income' })}
                    error={!!errors.villa_number}
                    helperText={errors.villa_number?.message}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              )}
              {transactionType === 'Income' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Resident Name"
                    fullWidth
                    {...register('resident_name', { required: 'Resident name is required for income' })}
                    error={!!errors.resident_name}
                    helperText={errors.resident_name?.message}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              )}
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
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isLoading}
            >
              {createMutation.isLoading ? 'Adding...' : 'Add Transaction'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Budget Transaction</DialogTitle>
        <form onSubmit={editHandleSubmit(onEditSubmit)}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="edit-transaction-type-label">Type</InputLabel>
                  <Controller
                    name="transaction_type"
                    control={editControl}
                    render={({ field }) => (
                      <Select {...field} labelId="edit-transaction-type-label" label="Type">
                        {transactionTypes.map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="edit-transaction-category-label">Category</InputLabel>
                  <Controller
                    name="category"
                    control={editControl}
                    render={({ field }) => (
                      <Select {...field} labelId="edit-transaction-category-label" label="Category">
                        {(editTransactionType === 'Income' ? incomeCategories : expenseCategories).map((category) => (
                          <MenuItem key={category} value={category}>{category}</MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoFocus
                  label="Amount ($)"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0.01, step: 0.01 }}
                  {...editRegister('amount', {
                    required: 'Amount is required',
                    min: { value: 0.01, message: 'Amount must be greater than 0' },
                  })}
                  error={!!editErrors.amount}
                  helperText={editErrors.amount?.message}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Transaction Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  {...editRegister('transaction_date', { required: 'Date is required' })}
                  error={!!editErrors.transaction_date}
                  helperText={editErrors.transaction_date?.message}
                  sx={{ mb: 2 }}
                />
              </Grid>
              {editTransactionType === 'Income' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Villa Number"
                    fullWidth
                    {...editRegister('villa_number', { required: 'Villa number is required for income' })}
                    error={!!editErrors.villa_number}
                    helperText={editErrors.villa_number?.message}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              )}
              {editTransactionType === 'Income' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Resident Name"
                    fullWidth
                    {...editRegister('resident_name', { required: 'Resident name is required for income' })}
                    error={!!editErrors.resident_name}
                    helperText={editErrors.resident_name?.message}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  {...editRegister('description')}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={updateMutation.isLoading}
            >
              {updateMutation.isLoading ? 'Updating...' : 'Update Transaction'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
    </Box>
  );
};

export default Budgeting;
