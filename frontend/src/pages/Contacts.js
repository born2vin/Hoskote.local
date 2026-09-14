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
  Avatar,
} from '@mui/material';
import { Add, Phone, CheckCircle, Cancel, LocalPhone } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { contactsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';

const categories = ['Plumber', 'Electrician', 'Police', 'Municipal', 'Carpenter', 'Pest Control', 'Other'];

const Contacts = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'Admin' || user?.role === 'Delegated Admin';

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    defaultValues: { name: '', phone: '', category: 'Plumber' },
  });

  const { data: directory, isLoading } = useQuery('contacts-directory', () => contactsApi.getApproved());
  const { data: pending } = useQuery('contacts-pending', () => contactsApi.getPending(), { enabled: isAdmin });

  const invalidate = () => {
    queryClient.invalidateQueries('contacts-directory');
    queryClient.invalidateQueries('contacts-pending');
  };

  const createMutation = useMutation(contactsApi.create, {
    onSuccess: () => {
      invalidate();
      setOpen(false);
      reset();
    },
  });

  const statusMutation = useMutation(
    ({ id, approval_status }) => contactsApi.updateStatus(id, { approval_status }),
    { onSuccess: () => invalidate() }
  );

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  const directoryList = directory?.data || [];
  const pendingList = pending?.data || [];

  const groupedDirectory = directoryList.reduce((groups, contact) => {
    (groups[contact.category] = groups[contact.category] || []).push(contact);
    return groups;
  }, {});

  return (
    <Box sx={{ minHeight: 'calc(100vh - 80px)', py: 3 }}>
      <Container maxWidth="lg">
        <PageHeader
          icon="📇"
          title="Community Contacts"
          subtitle="Trusted local plumbers, electricians and emergency numbers, recommended by residents"
          action={
            <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
              Suggest a Contact
            </Button>
          }
        />

        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ pb: '0 !important' }}>
            <Tabs value={tab} onChange={(e, v) => setTab(v)}>
              <Tab label="Directory" />
              {isAdmin && <Tab label={`Pending Approval (${pendingList.length})`} />}
            </Tabs>
          </CardContent>
        </Card>

        {tab === 0 && (
          isLoading ? (
            <Typography>Loading contacts...</Typography>
          ) : directoryList.length === 0 ? (
            <Card>
              <CardContent>
                <Typography color="text.secondary" align="center">
                  No approved contacts yet. Be the first to suggest one!
                </Typography>
              </CardContent>
            </Card>
          ) : (
            Object.keys(groupedDirectory).sort().map((category) => (
              <Box key={category} sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  {category}
                </Typography>
                <Grid container spacing={2}>
                  {groupedDirectory[category].map((contact) => (
                    <Grid item xs={12} sm={6} md={4} key={contact.id}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            <LocalPhone />
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body1" fontWeight={600} noWrap>
                              {contact.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {contact.phone}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))
          )
        )}

        {tab === 1 && isAdmin && (
          pendingList.length === 0 ? (
            <Card>
              <CardContent>
                <Typography color="text.secondary" align="center">
                  No pending submissions. All caught up!
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {pendingList.map((contact) => (
                <Grid item xs={12} md={6} key={contact.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6">{contact.name}</Typography>
                        <Chip label={contact.category} size="small" />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
                        <Phone fontSize="small" />
                        <Typography variant="body2">{contact.phone}</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                        Suggested by {contact.submitted_by?.full_name || contact.submitted_by?.username}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircle />}
                          disabled={statusMutation.isLoading}
                          onClick={() => statusMutation.mutate({ id: contact.id, approval_status: 'approved' })}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Cancel />}
                          disabled={statusMutation.isLoading}
                          onClick={() => statusMutation.mutate({ id: contact.id, approval_status: 'rejected' })}
                        >
                          Reject
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )
        )}

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Suggest a Contact</DialogTitle>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
              <TextField
                autoFocus
                label="Name / Business Name"
                fullWidth
                variant="outlined"
                {...register('name', { required: 'Name is required' })}
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Phone Number"
                fullWidth
                variant="outlined"
                {...register('phone', { required: 'Phone number is required' })}
                error={!!errors.phone}
                helperText={errors.phone?.message}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Category">
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Your suggestion will be reviewed by an admin before it appears in the directory.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={createMutation.isLoading}>
                {createMutation.isLoading ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Contacts;
